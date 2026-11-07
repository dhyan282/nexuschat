"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.requireAuth, auth_1.requireAdmin, admin_controller_1.adminController.stats);
router.get('/users', auth_1.requireAuth, auth_1.requireAdmin, admin_controller_1.adminController.users);
router.patch('/users/:id/suspend', auth_1.requireAuth, auth_1.requireAdmin, admin_controller_1.adminController.suspend);
router.patch('/users/:id/activate', auth_1.requireAuth, auth_1.requireAdmin, admin_controller_1.adminController.activate);
router.delete('/users/:id', auth_1.requireAuth, auth_1.requireAdmin, admin_controller_1.adminController.delete);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map