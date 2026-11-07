import { Request, Response } from 'express';
import { registerUser, loginUser, refreshTokens, logoutUser, logoutAll } from '../services/auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const data = (req as any).validated?.body || req.body;
      const result = await registerUser(data);
      setTokens(res, result.accessToken, result.refreshToken);
      res.status(201).json({ user: result.user, accessToken: result.accessToken });
    } catch (e: any) { res.status(e.status || 500).json({ message: e.message }); }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;
      const result = await loginUser(identifier, password);
      setTokens(res, result.accessToken, result.refreshToken);
      res.json({ user: result.user, accessToken: result.accessToken });
    } catch (e: any) { res.status(e.status || 500).json({ message: e.message }); }
  },
  refresh: async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await refreshTokens(token);
      setTokens(res, result.accessToken, result.refreshToken);
      res.json({ accessToken: result.accessToken });
    } catch (e: any) { res.status(e.status || 500).json({ message: e.message }); }
  },
  logout: async (req: Request, res: Response) => {
    await logoutUser(req.cookies?.refreshToken);
    clearTokens(res);
    res.json({ message: 'Logged out' });
  },
  logoutAll: async (req: any, res: Response) => {
    await logoutAll(req.userId);
    clearTokens(res);
    res.json({ message: 'Logged out from all devices' });
  },
  forgotPassword: async (req: Request, res: Response) => {
    try {
      await (await import('../services/auth.service')).forgotPassword(req.body.email);
      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (e: any) { res.status(e.status || 500).json({ message: e.message }); }
  },
  resetPassword: async (req: Request, res: Response) => {
    try {
      await (await import('../services/auth.service')).resetPassword(req.body.email, req.body.token, req.body.password);
      res.json({ message: 'Password reset successful' });
    } catch (e: any) { res.status(e.status || 500).json({ message: e.message }); }
  },
};

const isProd = process.env.NODE_ENV === 'production';
function setTokens(res: Response, access: string, refresh: string) {
  res.cookie('accessToken', access, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, maxAge: 15*60*1000 });
  res.cookie('refreshToken', refresh, { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd, path: '/api/auth/refresh', maxAge: 7*24*60*60*1000 });
}
function clearTokens(res: Response) {
  res.clearCookie('accessToken', { sameSite: isProd ? 'none' : 'lax', secure: isProd });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh', sameSite: isProd ? 'none' : 'lax', secure: isProd });
}

export { registerSchema };
