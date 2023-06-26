import multer from 'multer';

export const multerConfig = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
};

export default multerConfig;
