import { Request, Response } from 'express';
import * as svc from '../services/admin.service';

export const adminController = {
  stats: async (_req: any, res: Response) => res.json(await svc.stats()),
  users: async (req: any, res: Response) => res.json(await svc.listUsers(req.query.q as string)),
  suspend: async (req: any, res: Response) => res.json(await svc.suspendUser(req.params.id)),
  activate: async (req: any, res: Response) => res.json(await svc.activateUser(req.params.id)),
  delete: async (req: any, res: Response) => { await svc.deleteUser(req.params.id); res.json({ ok: true }); },
};
