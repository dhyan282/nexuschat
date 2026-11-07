"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const svc = __importStar(require("../services/message.service"));
exports.messageController = {
    list: async (req, res) => res.json(await svc.listMessages(req.params.conversationId, req.userId, req.query.before, Number(req.query.limit || 30))),
    create: async (req, res) => res.status(201).json(await svc.createMessage(req.body, req.userId)),
    edit: async (req, res) => res.json(await svc.editMessage(req.params.id, req.userId, req.body.content)),
    delete: async (req, res) => { await svc.deleteMessage(req.params.id, req.userId); res.json({ ok: true }); },
    react: async (req, res) => res.json(await svc.addReaction(req.params.id, req.userId, req.body.emoji)),
    read: async (req, res) => { await svc.markRead(req.params.conversationId, req.userId, req.body.messageId); res.json({ ok: true }); },
    search: async (req, res) => res.json(await svc.searchMessages(req.userId, String(req.query.q || ''))),
};
//# sourceMappingURL=message.controller.js.map