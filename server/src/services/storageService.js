import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

// Ensure upload directories exist
function ensureUploadDirs() {
  const dirs = [
    UPLOADS_ROOT,
    path.join(UPLOADS_ROOT, 'avatars'),
    path.join(UPLOADS_ROOT, 'documents')
  ];
  dirs.forEach(d => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });
}

ensureUploadDirs();

/**
 * Storage Provider Abstraction
 * In production or cloud deployments, replace or extend LocalDiskStorageProvider
 * with S3StorageProvider or GCSStorageProvider implementing this interface.
 */
class LocalDiskStorageProvider {
  constructor(baseDir = UPLOADS_ROOT) {
    this.baseDir = baseDir;
  }

  async saveFile({ subfolder, originalname, buffer, filename }) {
    const targetDir = path.join(this.baseDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const finalFilename = filename || `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(originalname)}`;
    const fullPath = path.join(targetDir, finalFilename);

    await fs.promises.writeFile(fullPath, buffer);
    const publicUrl = `/uploads/${subfolder}/${finalFilename}`;

    return {
      filename: finalFilename,
      path: fullPath,
      url: publicUrl,
      size: buffer.length
    };
  }

  async deleteFile(publicUrl) {
    if (!publicUrl || !publicUrl.startsWith('/uploads/')) return false;
    const relPath = publicUrl.replace('/uploads/', '');
    const fullPath = path.join(this.baseDir, relPath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }

  getFileUrl(subfolder, filename) {
    return `/uploads/${subfolder}/${filename}`;
  }
}

export const storageProvider = new LocalDiskStorageProvider();

// Multer memory storage configuration for clean provider decoupling
const memoryStorage = multer.memoryStorage();

// Multer middleware for avatar upload (Images: JPEG, PNG, WEBP, GIF, up to 5MB)
export const uploadAvatarMiddleware = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg\+xml/;
    const mimeMatch = allowed.test(file.mimetype);
    const extMatch = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mimeMatch || extMatch) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed for avatar uploads.'));
  }
}).single('avatar');

// Multer middleware for document upload (PDF, PNG, JPG, DOCX, up to 15MB)
export const uploadDocumentMiddleware = multer({
  storage: memoryStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const allowedExts = /\.(pdf|png|jpe?g|doc|docx|txt)$/i;
    if (file.originalname.match(allowedExts)) {
      return cb(null, true);
    }
    cb(new Error('Allowed document formats: PDF, PNG, JPG, DOC, DOCX, TXT.'));
  }
}).single('file');
