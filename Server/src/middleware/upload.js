import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(path.join(UPLOAD_DIR, 'resumes'), { recursive: true });

const storage = (sub = '') =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_DIR, sub)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base}${ext}`);
    },
  });

const IMAGE_TYPES = /^image\/(jpeg|png|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon|avif)$/;
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const uploadImage = multer({
  storage: storage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.test(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

export const uploadResume = multer({
  storage: storage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    DOC_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Resume must be a PDF or Word document (max 5 MB)')),
});
