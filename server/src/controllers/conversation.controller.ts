import { Request, Response } from 'express';
import * as svc from '../services/conversation.service';

export const conversationController = {
  list: async (req: any, res: Response) => res.json(await svc.listConversations(req.userId)),
  get: async (req: any, res: Response) => res.json(await svc.getConversation(req.params.id, req.userId)),
  create: async (req: any, res: Response) => res.status(201).json(await svc.createConversation(req.body, req.userId)),
  delete: async (req: any, res: Response) => { await svc.deleteConversation(req.params.id, req.userId); res.json({ ok: true }); },
  update: async (req: any, res: Response) => res.json(await svc.updateConversation(req.params.id, req.userId, req.body)),
  addMember: async (req: any, res: Response) => res.json(await svc.addMember(req.params.id, req.userId, req.body.userId)),
  removeMember: async (req: any, res: Response) => { await svc.removeMember(req.params.id, req.userId, req.params.userId); res.json({ ok: true }); },
};
