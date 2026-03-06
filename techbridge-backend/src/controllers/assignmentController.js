import { AssignmentService } from '../services/assignmentService.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { Assignment } from '../models/Assignment.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const assignmentData = {
    ...req.body,
    lesson: lessonId,
  };

  const assignment = new Assignment(assignmentData);
  await assignment.save();

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: assignment,
  });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { fileUrl, fileName } = req.body;

  if (!fileUrl) {
    throw new AppError('File URL is required', 400);
  }

  const submission = await AssignmentService.submitAssignment(
    assignmentId,
    req.userId,
    fileUrl,
    fileName
  );

  res.status(201).json({
    success: true,
    message: 'Assignment submitted successfully',
    data: submission,
  });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  if (grade === undefined) {
    throw new AppError('Grade is required', 400);
  }

  const submission = await AssignmentService.gradeSubmission(
    submissionId,
    grade,
    feedback,
    req.userId
  );

  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    data: submission,
  });
});

export const getSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await AssignmentService.getSubmission(submissionId);

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  res.status(200).json({
    success: true,
    data: submission,
  });
});

export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await AssignmentService.getAssignmentSubmissions(
    assignmentId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getMySubmissions = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await AssignmentService.getStudentSubmissions(
    req.userId,
    courseId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getMyAssignments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await AssignmentService.getStudentAssignments(
    req.userId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});
