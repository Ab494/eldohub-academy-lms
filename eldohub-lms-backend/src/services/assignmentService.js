import { Submission } from '../models/Submission.js';
import { Assignment } from '../models/Assignment.js';
import { AppError } from '../utils/errorHandler.js';
import { sendEmail, assignmentGradeEmailTemplate } from '../utils/emailService.js';
import { User } from '../models/User.js';

export class AssignmentService {
  static async submitAssignment(assignmentId, studentId, fileUrl, fileName) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    // Check if student already submitted
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (submission && submission.status === 'graded') {
      if (assignment.maxSubmissions <= 1) {
        throw new AppError('You have already submitted this assignment', 400);
      }
    }

    const isLate = new Date() > assignment.dueDate;

    submission = new Submission({
      assignment: assignmentId,
      student: studentId,
      course: assignment.course,
      fileUrl,
      fileName,
      isLate,
      status: 'submitted',
    });

    await submission.save();

    return submission;
  }

  static async gradeSubmission(submissionId, grade, feedback, gradedBy) {
    const submission = await Submission.findById(submissionId)
      .populate('student', 'email firstName lastName')
      .populate('assignment', 'title course');

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    if (grade < 0 || grade > 100) {
      throw new AppError('Grade must be between 0 and 100', 400);
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedBy = gradedBy;
    submission.gradedDate = new Date();
    submission.status = 'graded';

    await submission.save();

    // Send grade notification email
    try {
      const emailHtml = assignmentGradeEmailTemplate(
        submission.student.firstName,
        submission.assignment.title,
        submission.assignment.title,
        grade,
        feedback
      );
      await sendEmail(
        submission.student.email,
        'Assignment Graded',
        emailHtml
      );
    } catch (error) {
      console.error('Error sending grade email:', error);
    }

    return submission;
  }

  static async getSubmission(submissionId) {
    return Submission.findById(submissionId)
      .populate('student', 'firstName lastName email')
      .populate('assignment')
      .populate('gradedBy', 'firstName lastName');
  }

  static async getAssignmentSubmissions(assignmentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Submission.countDocuments({ assignment: assignmentId });

    return {
      submissions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async getStudentSubmissions(studentId, courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({
      student: studentId,
      course: courseId,
    })
      .populate('assignment', 'title dueDate')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Submission.countDocuments({
      student: studentId,
      course: courseId,
    });

    return {
      submissions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
