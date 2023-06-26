import { Router } from 'express';
import multer from 'multer';

import { multerConfig } from './config/multer';

import * as AuthController from './controllers/auth';
import * as DefaultController from './controllers/default';
import * as MediaController from './controllers/media';

const router = Router();

const upload = multer(multerConfig);

router.get('/', DefaultController.healthCheck);

router.post('/auth/tokenproof', AuthController.tokenProof);
router.post('/auth/tokenproof/callback', AuthController.tokenProofCallback);

router.post('/media/upload', upload.single('file'), MediaController.upload);
router.post('/media/upload/image', upload.single('file'), MediaController.uploadImage);
router.post('/media/upload/gif', upload.single('file'), MediaController.uploadGif);
router.post('/media/convert/gif', upload.single('file'), MediaController.convertGifToVideo);

export default router;
