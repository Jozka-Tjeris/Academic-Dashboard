"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentStatusTypes = exports.TWENTYFOUR_HOURS_IN_MS = exports.EPSILON = exports.INVALID_GRADE = exports.MAX_GRADE = exports.DEFAULT_MAX_SCORE = void 0;
exports.DEFAULT_MAX_SCORE = 100;
exports.MAX_GRADE = 100;
exports.INVALID_GRADE = NaN;
exports.EPSILON = 0.0001;
// 24 hours in milliseconds (1000ms * 60s * 60m * 24h)
exports.TWENTYFOUR_HOURS_IN_MS = 1000 * 60 * 60 * 24;
exports.AssessmentStatusTypes = ['upcoming', 'submitted', 'due in 24 hours', 'overdue', 'graded'];
