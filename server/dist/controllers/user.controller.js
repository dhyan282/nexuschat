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
exports.userController = void 0;
const svc = __importStar(require("../services/user.service"));
exports.userController = {
    me: async (req, res) => res.json(await svc.getMe(req.userId)),
    updateMe: async (req, res) => res.json(await svc.updateMe(req.userId, req.body)),
    search: async (req, res) => res.json(await svc.searchUsers(String(req.query.q || ''), req.userId)),
    get: async (req, res) => res.json(await svc.getUser(req.params.id)),
    block: async (req, res) => { await svc.blockUser(req.userId, req.params.id); res.json({ ok: true }); },
    unblock: async (req, res) => { await svc.unblockUser(req.userId, req.params.id); res.json({ ok: true }); },
    blocked: async (req, res) => res.json(await svc.getBlocked(req.userId)),
};
//# sourceMappingURL=user.controller.js.map