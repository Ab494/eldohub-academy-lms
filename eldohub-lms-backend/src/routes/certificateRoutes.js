import express from 'express';
import * as certificateController from '../controllers/certificateController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Generate certificate
router.post(
  '/:enrollmentId/generate',
  authenticate,
  certificateController.generateCertificate
);

// Get certificate
router.get(
  '/:certificateId',
  certificateController.getCertificate
);

// Get my certificates
router.get(
  '/my/certificates',
  authenticate,
  certificateController.getMyCertificates
);

export default router;
