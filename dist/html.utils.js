"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlUtils = void 0;
class HtmlUtils {
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
exports.HtmlUtils = HtmlUtils;
