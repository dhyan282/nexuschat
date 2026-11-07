"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
if (env_1.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
}
exports.fileController = {
    upload: async (req, res) => {
        const files = req.files || (req.file ? [req.file] : []);
        const out = [];
        for (const f of files) {
            if (env_1.env.CLOUDINARY_CLOUD_NAME) {
                const url = await new Promise((resolve, reject) => {
                    const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'nexuschat', resource_type: 'auto' }, (err, result) => {
                        if (err || !result)
                            reject(err);
                        else
                            resolve(result.secure_url);
                    });
                    stream.end(f.buffer);
                });
                out.push({ url, name: f.originalname, type: f.mimetype, size: f.size });
            }
            else {
                const filename = `${Date.now()}-${f.originalname.replace(/\s+/g, '_')}`;
                fs_1.default.writeFileSync(path_1.default.join(uploadDir, filename), f.buffer);
                out.push({ url: `/uploads/${filename}`, name: f.originalname, type: f.mimetype, size: f.size });
            }
        }
        res.status(201).json(out.length === 1 ? out[0] : out);
    },
    delete: (_req, res) => res.json({ ok: true }),
};
//# sourceMappingURL=file.controller.js.map