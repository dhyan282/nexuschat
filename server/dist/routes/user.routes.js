"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/me', auth_1.requireAuth, user_controller_1.userController.me);
router.patch('/me', auth_1.requireAuth, user_controller_1.userController.updateMe);
router.get('/search', auth_1.requireAuth, user_controller_1.userController.search);
router.get('/:id', auth_1.requireAuth, user_controller_1.userController.get);
router.post('/:id/block', auth_1.requireAuth, user_controller_1.userController.block);
router.delete('/:id/block', auth_1.requireAuth, user_controller_1.userController.unblock);
router.get('/me/blocked', auth_1.requireAuth, user_controller_1.userController.blocked);
exports.default = router;
//# sourceMappingURL=user.routes.js.map