"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, notification_controller_1.notificationController.list);
router.get('/unread-count', auth_1.requireAuth, notification_controller_1.notificationController.unreadCount);
router.patch('/:id/read', auth_1.requireAuth, notification_controller_1.notificationController.read);
router.post('/read-all', auth_1.requireAuth, notification_controller_1.notificationController.readAll);
router.delete('/:id', auth_1.requireAuth, notification_controller_1.notificationController.delete);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map