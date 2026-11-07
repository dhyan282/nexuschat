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
exports.conversationController = void 0;
const svc = __importStar(require("../services/conversation.service"));
exports.conversationController = {
    list: async (req, res) => res.json(await svc.listConversations(req.userId)),
    get: async (req, res) => res.json(await svc.getConversation(req.params.id, req.userId)),
    create: async (req, res) => res.status(201).json(await svc.createConversation(req.body, req.userId)),
    delete: async (req, res) => { await svc.deleteConversation(req.params.id, req.userId); res.json({ ok: true }); },
    update: async (req, res) => res.json(await svc.updateConversation(req.params.id, req.userId, req.body)),
    addMember: async (req, res) => res.json(await svc.addMember(req.params.id, req.userId, req.body.userId)),
    removeMember: async (req, res) => { await svc.removeMember(req.params.id, req.userId, req.params.userId); res.json({ ok: true }); },
};
//# sourceMappingURL=conversation.controller.js.map