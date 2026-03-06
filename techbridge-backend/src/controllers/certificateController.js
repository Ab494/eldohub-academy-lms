import { CertificateService } from '../services/certificateService.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const generateCertificate = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const certificate = await CertificateService.generateCertificate(enrollmentId);

  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully',
    data: certificate,
  });
});

export const getCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;
  const certificate = await CertificateService.getCertificate(certificateId);

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  res.status(200).json({
    success: true,
    data: certificate,
  });
});

export const getMyCertificates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await CertificateService.getStudentCertificates(
    req.userId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});
