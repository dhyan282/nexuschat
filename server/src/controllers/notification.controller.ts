import { Request, Response } from 'express';
import * as svc from '../services/notification.service';

export const notificationController = {
  list: async (req: any, res: Response) => res.json(await svc.listNotifications(req.userId)),
  read: async (req: any, res: Response) => { await svc.markRead(req.params.id, req.userId); res.json({ ok: true }); },
  readAll: async (req: any, res: Response) => { await svc.markAllRead(req.userId); res.json({ ok: true }); },
  delete: async (req: any, res: Response) => { await svc.deleteNotification(req.params.id, req.userId); res.json({ ok: true }); },
  unreadCount: async (req: any, res: Response) => res.json({ count: await svc.unreadCount(req.userId) }),
};
