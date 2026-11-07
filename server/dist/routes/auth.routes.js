"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({ body: zod_1.z.object({ name: zod_1.z.string().min(2), username: zod_1.z.string().min(3), email: zod_1.z.string().email(), password: zod_1.z.string().min(6), phone: zod_1.z.string().optional(), avatar: zod_1.z.string().optional() }) });
const loginSchema = zod_1.z.object({ body: zod_1.z.object({ identifier: zod_1.z.string(), password: zod_1.z.string() }) });
router.post('/register', (0, validate_1.validate)(registerSchema), auth_controller_1.authController.register);
router.post('/login', (0, validate_1.validate)(loginSchema), auth_controller_1.authController.login);
router.post('/refresh', auth_controller_1.authController.refresh);
router.post('/logout', auth_controller_1.authController.logout);
router.post('/logout-all', auth_1.requireAuth, auth_controller_1.authController.logoutAll);
router.post('/forgot-password', auth_controller_1.authController.forgotPassword);
router.post('/reset-password', auth_controller_1.authController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map