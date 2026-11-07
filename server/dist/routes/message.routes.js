"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/search', auth_1.requireAuth, message_controller_1.messageController.search);
router.get('/:conversationId', auth_1.requireAuth, message_controller_1.messageController.list);
router.post('/', auth_1.requireAuth, message_controller_1.messageController.create);
router.patch('/:id', auth_1.requireAuth, message_controller_1.messageController.edit);
router.delete('/:id', auth_1.requireAuth, message_controller_1.messageController.delete);
router.post('/:id/reactions', auth_1.requireAuth, message_controller_1.messageController.react);
router.post('/:conversationId/read', auth_1.requireAuth, message_controller_1.messageController.read);
exports.default = router;
//# sourceMappingURL=message.routes.js.map