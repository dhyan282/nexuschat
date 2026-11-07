import { Request, Response } from 'express';
import * as svc from '../services/message.service';

export const messageController = {
  list: async (req: any, res: Response) => res.json(await svc.listMessages(req.params.conversationId, req.userId, req.query.before as string, Number(req.query.limit || 30))),
  create: async (req: any, res: Response) => res.status(201).json(await svc.createMessage(req.body, req.userId)),
  edit: async (req: any, res: Response) => res.json(await svc.editMessage(req.params.id, req.userId, req.body.content)),
  delete: async (req: any, res: Response) => { await svc.deleteMessage(req.params.id, req.userId); res.json({ ok: true }); },
  react: async (req: any, res: Response) => res.json(await svc.addReaction(req.params.id, req.userId, req.body.emoji)),
  read: async (req: any, res: Response) => { await svc.markRead(req.params.conversationId, req.userId, req.body.messageId); res.json({ ok: true }); },
  search: async (req: any, res: Response) => res.json(await svc.searchMessages(req.userId, String(req.query.q || ''))),
};
