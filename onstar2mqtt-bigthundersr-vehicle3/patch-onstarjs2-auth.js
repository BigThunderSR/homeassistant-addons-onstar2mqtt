const fs = require('fs');

const files = [
  '/app/node_modules/onstarjs2/dist/index.cjs',
  '/app/node_modules/onstarjs2/dist/index.mjs',
];

const retryNeedle = '            const maxRetries = 4; // Increased from 2 to 4 (5 total attempts)';
const retryReplacement = '            const maxRetries = 0; // Avoid repeated auth retries that can trigger account lockouts';

const accessDeniedNeedle = '                        const maxRetries = 2;';
const accessDeniedReplacement = '                        const maxRetries = 0;';

const frameNeedle = `                yield client.send("Network.enable");
                // Set up CDP network listener to catch everything that appears in DevTools`;

const frameReplacement = `                yield client.send("Network.enable");
                const captureAuthCodeFromUrl = (source, rawUrl) => {
                    if (!rawUrl) {
                        return false;
                    }
                    const normalizedUrl = String(rawUrl);
                    const locationCode = this.getRegexMatch(normalizedUrl, \`[?&]code=([^&]*)\`);
                    if (locationCode && normalizedUrl.toLowerCase().includes("msauth.com.gm.mychevrolet")) {
                        this.capturedAuthCode = locationCode;
                        console.log(\`[SUCCESS handleMFA \${source}] Captured authorization redirect\`);
                        return true;
                    }
                    return false;
                };
                page.on("framenavigated", (frame) => {
                    try {
                        captureAuthCodeFromUrl("framenavigated", frame.url());
                    }
                    catch (error) {
                        console.error("[ERROR handleMFA framenavigated]", error);
                    }
                });
                page.on("request", (request) => {
                    try {
                        captureAuthCodeFromUrl("request", request.url());
                    }
                    catch (error) {
                        console.error("[ERROR handleMFA request]", error);
                    }
                });
                // Set up CDP network listener to catch everything that appears in DevTools`;

const requestWillBeSentNeedle = `                client.on("Network.requestWillBeSent", (params) => {
                    const requestUrl = params.request.url;
                    // if (this.debugMode) {
                    //   console.log(
                    //     \`[DEBUG handleMFA CDP requestWillBeSent] Request to: \${requestUrl}\`,
                    //   );
                    // }
                    if (requestUrl
                        .toLowerCase()
                        .startsWith("msauth.com.gm.mychevrolet://auth")) {
                        console.log(\`[SUCCESS handleMFA CDP requestWillBeSent] Captured msauth redirect via CDP. URL: \${requestUrl}\`);
                        this.capturedAuthCode = this.getRegexMatch(requestUrl, \`[?&]code=([^&]*)\`);
                        if (this.capturedAuthCode) {
                            console.log(\`[SUCCESS handleMFA CDP requestWillBeSent] Extracted authorization code: \${this.capturedAuthCode}\`);
                        }
                        else {
                            console.error(\`[ERROR handleMFA CDP requestWillBeSent] msauth redirect found, but FAILED to extract code from: \${requestUrl}\`);
                        }
                    }
                });`;

const requestWillBeSentReplacement = `                client.on("Network.requestWillBeSent", (params) => {
                    captureAuthCodeFromUrl("CDP requestWillBeSent", params.request.url);
                });`;

const commentedBlock = `                // // Also listen for redirects at CDP level
                // client.on("Network.responseReceived", (params: any) => {
                //   const response = params.response;
                //   if (
                //     (response.status === 301 || response.status === 302) &&
                //     response.headers &&
                //     response.headers.location
                //   ) {
                //     const location = response.headers.location;
                //     if (this.debugMode) {
                //       console.log(
                //         \`[DEBUG handleMFA CDP responseReceived] Redirect from \${response.url} to: \${location}\`,
                //       );
                //     }
                //     if (
                //       location
                //         .toLowerCase()
                //         .startsWith("msauth.com.gm.mychevrolet://auth")
                //     ) {
                //       console.log(
                //         \`[SUCCESS handleMFA CDP responseReceived] Captured msauth redirect via CDP response. Location: \${location}\`,
                //       );
                //       this.capturedAuthCode = this.getRegexMatch(
                //         location,
                //         \`[?&]code=([^&]*)\`,
                //       );
                //       if (this.capturedAuthCode) {
                //         console.log(
                //           \`[SUCCESS handleMFA CDP responseReceived] Extracted authorization code: \${this.capturedAuthCode}\`,
                //         );
                //       } else {
                //         console.error(
                //           \`[ERROR handleMFA CDP responseReceived] msauth redirect found, but FAILED to extract code from: \${location}\`,
                //         );
                //       }
                //     }
                //   }
                // });`;

const activeBlock = `                client.on("Network.responseReceived", (params) => {
                    const response = params.response;
                    const location = response.headers && (response.headers.location || response.headers.Location);
                    if ((response.status === 301 || response.status === 302) && location) {
                        captureAuthCodeFromUrl("CDP responseReceived", location);
                    }
                });`;

const otpNeedle = `                const otpField = yield page
                    .locator('input[name="otpCode"], [aria-label*="One-Time Passcode"i], [aria-label*="OTP"i]')
                    .first();
                yield otpField.click({ delay: Math.random() * 200 + 50 });
                yield otpField.type(otp, { delay: Math.random() * 150 + 50 });
                yield page.waitForTimeout(500 + Math.random() * 500); // Pause before clicking
                console.log("✅ TOTP code entered - preparing to submit MFA form");`;

const otpReplacement = `                const otpField = yield page
                    .locator('input[name="otpCode"], input[inputmode="numeric"], [aria-label*="verification code"i], [aria-label*="one-time"i], [aria-label*="OTP"i]')
                    .first();
                yield otpField.click({ delay: Math.random() * 200 + 50 });
                yield otpField.fill("");
                yield otpField.type(otp, { delay: Math.random() * 120 + 40 });
                const typedValue = yield otpField.inputValue();
                if (typedValue !== otp) {
                    console.log("[TRACE handleMFA] OTP input did not persist, forcing DOM value assignment");
                    yield otpField.evaluate((element, expected) => {
                        const input = element;
                        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                        nativeSetter.call(input, expected);
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: expected.slice(-1) || "0" }));
                        input.blur();
                    }, otp);
                }
                yield page.waitForFunction((expected) => {
                    const input = document.querySelector('input[name="otpCode"], input[inputmode="numeric"], input[aria-label*="verification code" i], input[aria-label*="one-time" i], input[aria-label*="OTP" i]');
                    return !!input && "value" in input && input.value === expected;
                }, otp, { timeout: 10000 });
                yield page.waitForTimeout(2400); // GM page advertises a 2000ms input verification delay
                console.log("✅ TOTP code entered and stabilized - preparing to submit MFA form");`;

const submitClickNeedle = `                const submitMfaButton = yield page // Renamed variable to avoid conflict
                    .locator('button[type="submit"], input[type="submit"], button:has-text("Verify"), button:has-text("Continue"), button:has-text("Submit"), [role="button"][aria-label*="Verify"i], [role="button"][aria-label*="Continue"i], [role="button"][aria-label*="Submit"i]')
                    .first();
                yield submitMfaButton.waitFor({ timeout: 60000 });
                console.log("✅ MFA submit button found - clicking to complete authentication");
                yield submitMfaButton.click();`;

const submitClickReplacement = `                const submitMfaButton = yield page // Renamed variable to avoid conflict
                    .locator('button#continue, button[type="submit"], input[type="submit"], button:has-text("Submit Code"), button:has-text("Verify"), button:has-text("Continue"), button:has-text("Submit"), [role="button"][aria-label*="Verify"i], [role="button"][aria-label*="Continue"i], [role="button"][aria-label*="Submit"i]')
                    .first();
                yield submitMfaButton.waitFor({ timeout: 60000 });
                console.log("✅ MFA submit button found - clicking to complete authentication");
                yield submitMfaButton.hover();
                yield page.waitForTimeout(200);
                yield submitMfaButton.click({ delay: 120 });
                yield page.waitForTimeout(1200);
                if (!this.capturedAuthCode) {
                    const fallbackSubmitted = yield page.evaluate(() => {
                        const button = document.querySelector('button#continue, button[type="submit"], input[type="submit"]');
                        const form = document.getElementById("attributeVerification") || (button && button.form) || document.querySelector("form");
                        if (button && typeof button.click === "function") {
                            button.click();
                        }
                        if (form && typeof form.requestSubmit === "function") {
                            form.requestSubmit(button || undefined);
                            return true;
                        }
                        return false;
                    });
                    if (fallbackSubmitted) {
                        console.log("[TRACE handleMFA] Used DOM requestSubmit fallback after button click");
                        yield page.waitForTimeout(1500);
                    }
                }`;

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file to patch: ${file}`);
  }

  const original = fs.readFileSync(file, 'utf8');
  let updated = original;

  if (updated.includes(retryNeedle)) {
    updated = updated.replace(retryNeedle, retryReplacement);
  }

  if (updated.includes(accessDeniedNeedle)) {
    updated = updated.replace(accessDeniedNeedle, accessDeniedReplacement);
  }

  if (updated.includes(frameNeedle)) {
    updated = updated.replace(frameNeedle, frameReplacement);
  }

  if (updated.includes(requestWillBeSentNeedle)) {
    updated = updated.replace(requestWillBeSentNeedle, requestWillBeSentReplacement);
  }

  if (updated.includes(commentedBlock)) {
    updated = updated.replace(commentedBlock, activeBlock);
  }

  if (updated.includes(otpNeedle)) {
    updated = updated.replace(otpNeedle, otpReplacement);
  }

  if (updated.includes(submitClickNeedle)) {
    updated = updated.replace(submitClickNeedle, submitClickReplacement);
  }

  if (updated === original) {
    throw new Error(`No expected auth patch points found in ${file}`);
  }

  fs.writeFileSync(file, updated);
  console.log(`Patched ${file}`);
}
