import { Request, Response } from 'express';
import * as svc from '../services/user.service';

export const userController = {
  me: async (req: any, res: Response) => res.json(await svc.getMe(req.userId)),
  updateMe: async (req: any, res: Response) => res.json(await svc.updateMe(req.userId, req.body)),
  search: async (req: any, res: Response) => res.json(await svc.searchUsers(String(req.query.q || ''), req.userId)),
  get: async (req: any, res: Response) => res.json(await svc.getUser(req.params.id)),
  block: async (req: any, res: Response) => { await svc.blockUser(req.userId, req.params.id); res.json({ ok: true }); },
  unblock: async (req: any, res: Response) => { await svc.unblockUser(req.userId, req.params.id); res.json({ ok: true }); },
  blocked: async (req: any, res: Response) => res.json(await svc.getBlocked(req.userId)),
};
