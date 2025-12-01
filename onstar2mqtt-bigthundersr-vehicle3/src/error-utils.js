const _ = require('lodash');

/**
 * Normalizes errors from different sources (Axios, OpenID-client, etc.) into a consistent format.
 * Handles:
 * - Axios errors: use response.status
 * - OpenID-client (OPError): use response.statusCode 
 * - Fallback: parse status code from error message
 * @param {Error} e - The error to normalize
 * @returns {Object} - Normalized error object with consistent response.status/statusText
 */
const normalizeError = (e) => {
    // Start with standard properties
    const normalized = {
        message: e.message,
        stack: e.stack
    };
    
    // Try to get status code from various sources
    let status = null;
    let statusText = null;
    
    // Check for Axios-style response (response.status)
    if (e.response?.status) {
        status = e.response.status;
        statusText = e.response.statusText;
    }
    // Check for OpenID-client style response (response.statusCode)
    else if (e.response?.statusCode) {
        status = e.response.statusCode;
        // OpenID-client doesn't always have statusText, try to get it
        statusText = e.response.statusMessage || e.response.statusText;
    }
    // Fallback: try to parse status code from error message (e.g., "expected 200 OK, got: 429 Too Many Requests")
    else if (e.message) {
        const match = e.message.match(/got:\s*(\d{3})\s+(.+?)(?:\s*$|\s*\n)/i);
        if (match) {
            status = parseInt(match[1], 10);
            statusText = match[2].trim();
        }
    }
    
    // Build response object if we have status info
    if (status !== null) {
        normalized.response = {
            status: status,
            statusText: statusText || 'Unknown'
        };
        
        // Include additional response data if available
        if (e.response?.headers) normalized.response.headers = e.response.headers;
        if (e.response?.data) normalized.response.data = e.response.data;
        if (e.response?.body) normalized.response.data = e.response.body; // OpenID-client uses body
    }
    
    // Include request info if available (Axios-style)
    if (e.request) {
        normalized.request = _.pick(e.request, ['method', 'body', 'contentType', 'headers', 'url']);
    }
    if (e.config) {
        // Axios stores request info in config
        normalized.request = {
            method: e.config.method,
            url: e.config.url,
            headers: e.config.headers
        };
    }
    
    return normalized;
};

module.exports = { normalizeError };
