"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversation_controller_1 = require("../controllers/conversation.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, conversation_controller_1.conversationController.list);
router.post('/', auth_1.requireAuth, conversation_controller_1.conversationController.create);
router.get('/:id', auth_1.requireAuth, conversation_controller_1.conversationController.get);
router.patch('/:id', auth_1.requireAuth, conversation_controller_1.conversationController.update);
router.delete('/:id', auth_1.requireAuth, conversation_controller_1.conversationController.delete);
router.post('/:id/members', auth_1.requireAuth, conversation_controller_1.conversationController.addMember);
router.delete('/:id/members/:userId', auth_1.requireAuth, conversation_controller_1.conversationController.removeMember);
exports.default = router;
//# sourceMappingURL=conversation.routes.js.map