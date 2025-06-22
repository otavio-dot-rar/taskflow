"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuleType = getRuleType;
// Helper function to get rule type from metadata
function getRuleType(metadata) {
    if (metadata.alwaysApply)
        return "Always";
    if (metadata.description && metadata.description.trim() !== "")
        return "Agent Requested";
    return "Manual"; // alwaysApply: false but no description
}
