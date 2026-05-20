"use strict";

/**
 * Automatically discover and verify deep sub-path imports used by installed
 * packages. Catches breaking ESM/CJS changes that unit tests won't exercise.
 *
 * Scans JS files of direct dependencies (and key transitive deps like
 * patchright-core) for require() calls targeting sub-paths of other packages,
 * then verifies each one resolves.
 */

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const nodeModules = path.join(__dirname, "..", "node_modules");

// Packages whose JS files we scan for deep imports.
// Includes direct deps + known critical transitive deps.
function getPackagesToScan() {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    const direct = Object.keys(pkg.dependencies || {});
    // Add known transitive packages that use deep imports
    const transitive = ["patchright-core"];
    const all = [...new Set([...direct, ...transitive])];
    return all.filter(name => {
        try {
            fs.statSync(path.join(nodeModules, name));
            return true;
        } catch { return false; }
    });
}

// Extract deep require() specifiers from a JS file.
// A "deep import" is require("pkg/sub/path") — not just require("pkg").
function extractDeepRequires(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const results = new Set();
    // Match require("...") and require('...')
    const re = /require\(["']([^"']+)["']\)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        const spec = m[1];
        // Skip relative, built-in, or bare (no sub-path) imports
        if (spec.startsWith(".") || spec.startsWith("node:")) continue;
        // Determine if there's a sub-path beyond the package name
        const parts = spec.split("/");
        const subPath = spec.startsWith("@") ? parts.slice(2).join("/") : parts.slice(1).join("/");
        if (subPath) results.add(spec);
    }
    return results;
}

// Recursively find .js files in a directory (non-symlink, skip nested node_modules)
function findJsFiles(dir, files = []) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return files; }
    for (const entry of entries) {
        if (entry.name === "node_modules") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            findJsFiles(full, files);
        } else if (entry.name.endsWith(".js") || entry.name.endsWith(".cjs")) {
            files.push(full);
        }
    }
    return files;
}

// Main
const packagesToScan = getPackagesToScan();
const deepImports = new Map(); // specifier -> Set of packages that use it

// Imports that are bundled, optional, or conditionally loaded at runtime.
// These don't need to resolve from node_modules.
const ignoredPatterns = [
    /^electron\b/,         // optional Electron runtime
    /^playwright-core\b/,  // replaced by patchright-core internals
    /^ajv\b/,             // bundled into patchright-core
    /^ajv-formats\b/,    // bundled into patchright-core
];

console.log(`Scanning ${packagesToScan.length} packages for deep imports...\n`);

for (const pkg of packagesToScan) {
    const pkgDir = path.join(nodeModules, pkg);
    const jsFiles = findJsFiles(pkgDir);
    for (const file of jsFiles) {
        for (const spec of extractDeepRequires(file)) {
            if (!deepImports.has(spec)) deepImports.set(spec, new Set());
            deepImports.get(spec).add(pkg);
        }
    }
}

if (deepImports.size === 0) {
    console.log("No deep sub-path imports found.");
    process.exit(0);
}

console.log(`Found ${deepImports.size} unique deep imports. Verifying...\n`);

let failed = 0;
let passed = 0;

for (const [spec, consumers] of [...deepImports.entries()].sort()) {
    // Skip known-optional/bundled imports
    if (ignoredPatterns.some(re => re.test(spec))) continue;

    // Resolve from the first consumer's perspective
    const consumer = [...consumers][0];
    const consumerPkg = path.join(nodeModules, consumer, "package.json");
    let require_;
    try {
        require_ = createRequire(consumerPkg);
    } catch {
        continue; // skip if we can't create require for this package
    }

    try {
        require_.resolve(spec);
        passed++;
    } catch (err) {
        const usedBy = [...consumers].join(", ");
        console.error(`  ✗ ${spec}`);
        console.error(`    used by: ${usedBy}`);
        console.error(`    error: ${err.code || err.message}\n`);
        failed++;
    }
}

if (failed > 0) {
    console.error(`\n${failed} deep import(s) failed to resolve. A dependency likely dropped CJS or changed export paths.`);
    console.log(`${passed} deep import(s) OK.`);
    process.exit(1);
} else {
    console.log(`  All ${passed} deep imports resolve OK.`);
}
