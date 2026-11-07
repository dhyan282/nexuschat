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
exports.registerSchema = exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        username: zod_1.z.string().min(3),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        phone: zod_1.z.string().optional(),
        avatar: zod_1.z.string().optional(),
    }),
});
exports.registerSchema = registerSchema;
exports.authController = {
    register: async (req, res) => {
        try {
            const data = req.validated?.body || req.body;
            const result = await (0, auth_service_1.registerUser)(data);
            setTokens(res, result.accessToken, result.refreshToken);
            res.status(201).json({ user: result.user, accessToken: result.accessToken });
        }
        catch (e) {
            res.status(e.status || 500).json({ message: e.message });
        }
    },
    login: async (req, res) => {
        try {
            const { identifier, password } = req.body;
            const result = await (0, auth_service_1.loginUser)(identifier, password);
            setTokens(res, result.accessToken, result.refreshToken);
            res.json({ user: result.user, accessToken: result.accessToken });
        }
        catch (e) {
            res.status(e.status || 500).json({ message: e.message });
        }
    },
    refresh: async (req, res) => {
        try {
            const token = req.cookies?.refreshToken || req.body.refreshToken;
            const result = await (0, auth_service_1.refreshTokens)(token);
            setTokens(res, result.accessToken, result.refreshToken);
            res.json({ accessToken: result.accessToken });
        }
        catch (e) {
            res.status(e.status || 500).json({ message: e.message });
        }
    },
    logout: async (req, res) => {
        await (0, auth_service_1.logoutUser)(req.cookies?.refreshToken);
        clearTokens(res);
        res.json({ message: 'Logged out' });
    },
    logoutAll: async (req, res) => {
        await (0, auth_service_1.logoutAll)(req.userId);
        clearTokens(res);
        res.json({ message: 'Logged out from all devices' });
    },
    forgotPassword: async (req, res) => {
        try {
            await (await Promise.resolve().then(() => __importStar(require('../services/auth.service')))).forgotPassword(req.body.email);
            res.json({ message: 'If the email exists, a reset link has been sent' });
        }
        catch (e) {
            res.status(e.status || 500).json({ message: e.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            await (await Promise.resolve().then(() => __importStar(require('../services/auth.service')))).resetPassword(req.body.email, req.body.token, req.body.password);
            res.json({ message: 'Password reset successful' });
        }
        catch (e) {
            res.status(e.status || 500).json({ message: e.message });
        }
    },
};
const isProd = process.env.NODE_ENV === 'production';
function setTokens(res, access, refresh) {
    res.cookie('accessToken', access, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refresh, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/api/auth/refresh', maxAge: 7 * 24 * 60 * 60 * 1000 });
}
function clearTokens(res) {
    res.clearCookie('accessToken', { sameSite: isProd ? 'none' : 'lax', secure: isProd });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh', sameSite: isProd ? 'none' : 'lax', secure: isProd });
}
//# sourceMappingURL=auth.controller.js.map