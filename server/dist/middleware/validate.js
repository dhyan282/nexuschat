"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.errorHandler = errorHandler;
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
        if (!result.success) {
            return res.status(400).json({ message: 'Validation error', errors: result.error.flatten() });
        }
        req.validated = result.data;
        next();
    };
}
function errorHandler(err, _req, res, _next) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}
//# sourceMappingURL=validate.js.map