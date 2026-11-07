import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const fileController = {
  upload: async (req: any, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    const out: any[] = [];
    for (const f of files) {
      if (env.CLOUDINARY_CLOUD_NAME) {
        const url = await new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'nexuschat', resource_type: 'auto' }, (err, result) => {
            if (err || !result) reject(err); else resolve(result.secure_url);
          });
          stream.end(f.buffer);
        });
        out.push({ url, name: f.originalname, type: f.mimetype, size: f.size });
      } else {
        const filename = `${Date.now()}-${f.originalname.replace(/\s+/g, '_')}`;
        fs.writeFileSync(path.join(uploadDir, filename), f.buffer);
        out.push({ url: `/uploads/${filename}`, name: f.originalname, type: f.mimetype, size: f.size });
      }
    }
    res.status(201).json(out.length === 1 ? out[0] : out);
  },
  delete: (_req: any, res: Response) => res.json({ ok: true }),
};
