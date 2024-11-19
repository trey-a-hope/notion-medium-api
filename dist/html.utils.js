"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlUtils = void 0;
/**
 * Utility class for HTML-related operations
 * Provides static methods for common HTML string manipulations
 */
class HtmlUtils {
    /**
     * Converts special characters in a string to their corresponding HTML entities
     * This prevents XSS (Cross-Site Scripting) attacks and ensures proper HTML rendering
     *
     * Conversions:
     * & -> &amp;    (ampersand)
     * < -> &lt;     (less than)
     * > -> &gt;     (greater than)
     * " -> &quot;   (double quote)
     * ' -> &#039;   (single quote)
     *
     * @param unsafe - The raw string that might contain special HTML characters
     * @returns The escaped string safe for HTML insertion
     *
     * @example
     * const unsafe = '<script>alert("xss")</script>';
     * const safe = HtmlUtils.escapeHtml(unsafe);
     */
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;") // Must be first to avoid double-escaping
            .replace(/</g, "&lt;") // Prevents HTML tag injection
            .replace(/>/g, "&gt;") // Prevents HTML tag injection
            .replace(/"/g, "&quot;") // Escapes double quotes in attributes
            .replace(/'/g, "&#039;"); // Escapes single quotes in attributes
    }
}
exports.HtmlUtils = HtmlUtils;
