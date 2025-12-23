import { Certificate } from '../models/Certificate.js';
import { Enrollment } from '../models/Enrollment.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { AppError } from '../utils/errorHandler.js';
import { generateCertificatePDF } from '../utils/certificateGenerator.js';
import { sendEmail, courseCompletionEmailTemplate } from '../utils/emailService.js';
import { v4 as uuidv4 } from 'uuid';

export class CertificateService {
  static async generateCertificate(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title');

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== 'completed') {
      throw new AppError('Course not completed', 400);
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      student: enrollment.student._id,
      course: enrollment.course._id,
    });

    if (existingCert) {
      return existingCert;
    }

    const certificateId = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const completionDate = new Date(enrollment.completionDate).toLocaleDateString();

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(
      `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      enrollment.course.title,
      completionDate,
      certificateId
    );

    // In production, upload to Cloudinary
    // For now, we'll store a placeholder URL
    const certificateUrl = `/certificates/${certificateId}.pdf`;

    const certificate = new Certificate({
      student: enrollment.student._id,
      course: enrollment.course._id,
      certificateId,
      certificateUrl,
      completionDate: enrollment.completionDate,
    });

    await certificate.save();

    // Update enrollment with certificate ID
    enrollment.certificateId = certificateId;
    await enrollment.save();

    // Send certificate email
    try {
      const emailHtml = courseCompletionEmailTemplate(
        enrollment.student.firstName,
        enrollment.course.title,
        certificateId
      );
      await sendEmail(
        enrollment.student.email,
        'Certificate Issued!',
        emailHtml
      );
    } catch (error) {
      console.error('Error sending certificate email:', error);
    }

    return certificate;
  }

  static async getCertificate(certificateId) {
    return Certificate.findOne({ certificateId })
      .populate('student', 'firstName lastName email')
      .populate('course', 'title');
  }

  static async getStudentCertificates(studentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const certificates = await Certificate.find({ student: studentId })
      .populate('course', 'title category')
      .skip(skip)
      .limit(limit)
      .sort({ issuedDate: -1 });

    const total = await Certificate.countDocuments({ student: studentId });

    return {
      certificates,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
