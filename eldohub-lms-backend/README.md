# Eldohub LMS Backend

A production-ready Learning Management System (LMS) backend built with Node.js, Express, and MongoDB.

## 🌟 Features

### 👥 User Management
- **Multi-role authentication** (Student, Instructor, Admin)
- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt
- User profile management
- Email verification

### 📚 Course Management
- Create, update, publish courses
- Hierarchical structure (Course → Module → Lesson)
- Draft and published states
- Course categories and levels
- Instructor course management

### 📖 Content Management
- Video lessons with Cloudinary integration
- Text-based lessons
- Lesson attachments
- Lesson ordering and navigation
- Free and premium lessons

### ✅ Assessments
- **Quizzes**: MCQ, True/False, Short Answer
- Automatic quiz grading
- Multiple quiz attempts
- **Assignments**: File submissions
- Manual assignment grading
- Assignment feedback

### 📊 Progress Tracking
- Course enrollment
- Lesson completion tracking
- Automatic progress percentage calculation
- Course completion detection
- Student dashboard

### 🎓 Certificates
- PDF certificate generation
- Unique certificate IDs
- Auto-generated on course completion
- Certificate download capability

### 📧 Notifications
- Enrollment confirmation emails
- Assignment grade notification
- Course completion certificate email
- Configurable email templates

### 🔐 Security
- Role-based access control (RBAC)
- Input validation and sanitization
- Error handling and logging
- CORS protection
- Rate limiting ready

## 🚀 Tech Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **File Storage**: Cloudinary
- **PDF Generation**: PDFKit
- **Validation**: express-validator

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- MongoDB (Atlas or local)
- Cloudinary account
- Email service provider

### Setup

1. **Clone and install dependencies**
```bash
cd eldohub-lms-backend
npm install
# or
bun install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**
```bash
npm run dev
# or
bun run dev
```

Server runs at `http://localhost:5000`

## 📋 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_ACCESS_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_secret_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

See `.env.example` for all options.

## 🏗️ Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── courseController.js
│   ├── moduleController.js
│   ├── lessonController.js
│   ├── enrollmentController.js
│   ├── quizController.js
│   ├── assignmentController.js
│   └── certificateController.js
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Course.js
│   ├── Module.js
│   ├── Lesson.js
│   ├── Enrollment.js
│   ├── Quiz.js
│   ├── QuizAttempt.js
│   ├── Assignment.js
│   ├── Submission.js
│   ├── Certificate.js
│   └── LessonProgress.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── moduleRoutes.js
│   ├── lessonRoutes.js
│   ├── enrollmentRoutes.js
│   ├── quizRoutes.js
│   ├── assignmentRoutes.js
│   └── certificateRoutes.js
├── services/            # Business logic
│   ├── authService.js
│   ├── courseService.js
│   ├── enrollmentService.js
│   ├── quizService.js
│   ├── assignmentService.js
│   └── certificateService.js
├── middlewares/         # Custom middlewares
│   ├── auth.js
│   └── validation.js
├── utils/               # Helper functions
│   ├── errorHandler.js
│   ├── tokenUtils.js
│   ├── emailService.js
│   └── certificateGenerator.js
├── config/              # Configuration
│   ├── index.js
│   └── database.js
├── app.js               # Express app
└── server.js            # Entry point
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/change-password
```

### Courses
```
GET    /api/courses
GET    /api/courses/:courseId
POST   /api/courses
PUT    /api/courses/:courseId
POST   /api/courses/:courseId/publish
DELETE /api/courses/:courseId
GET    /api/courses/instructor/my-courses
```

### Modules
```
POST   /api/courses/:courseId/modules
GET    /api/courses/:courseId/modules
PUT    /api/courses/:courseId/modules/:moduleId
DELETE /api/courses/:courseId/modules/:moduleId
```

### Lessons
```
POST   /api/courses/:courseId/modules/:moduleId/lessons
GET    /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
PUT    /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
```

### Enrollments
```
POST   /api/enrollments/:courseId/enroll
GET    /api/enrollments/my/enrollments
GET    /api/enrollments/:courseId/enrollments
POST   /api/enrollments/:courseId/lessons/:lessonId/complete
GET    /api/enrollments/:courseId/progress
```

### Quizzes
```
POST   /api/courses/:courseId/quizzes/:lessonId
POST   /api/courses/:courseId/quizzes/:quizId/submit
GET    /api/courses/:courseId/quizzes/:quizId/attempts
GET    /api/courses/:courseId/quizzes/:quizId/best-attempt
```

### Assignments
```
POST   /api/courses/:courseId/assignments/:lessonId
POST   /api/courses/:courseId/assignments/:assignmentId/submit
POST   /api/courses/:courseId/assignments/submissions/:submissionId/grade
GET    /api/courses/:courseId/assignments/submissions/:submissionId
GET    /api/courses/:courseId/assignments/:assignmentId/submissions
GET    /api/courses/:courseId/assignments/my/submissions/:courseId
```

### Certificates
```
POST   /api/certificates/:enrollmentId/generate
GET    /api/certificates/:certificateId
GET    /api/certificates/my/certificates
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## 🔑 Key Models

### User
- Multi-role support (student, instructor, admin)
- Email verification
- Profile information
- Activity tracking

### Course
- Title, description, category
- Instructor reference
- Status (draft/published)
- Pricing and level
- Enrollment tracking

### Enrollment
- Student-Course relationship
- Progress percentage
- Completion status
- Certificate association

### Quiz & QuizAttempt
- Multiple question types
- Auto-grading
- Attempt tracking
- Scoring

### Assignment & Submission
- File submissions
- Grading workflow
- Feedback system
- Late submission handling

### Certificate
- Unique certificate IDs
- PDF generation
- Student records

## 🔒 Authentication

### JWT Flow
1. User registers or logs in
2. Receives access token (15 min) + refresh token (7 days)
3. Access token in Authorization header for protected routes
4. Token auto-refreshes when expired

### Protected Routes
All endpoints requiring `authenticate` middleware require valid JWT token.

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token expiration and rotation
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Secure password change flow
- ✅ Error handling without sensitive info leakage

## 📚 Database Indexes

Optimized indexes on:
- User email (unique)
- Course status & category
- Module course reference
- Lesson module & course
- Enrollment student & course (unique pair)
- Quiz/Assignment lesson & course

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### Quick Deploy (Heroku)
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
# Set all env variables
git push heroku main
```

## 🤝 Frontend Integration

### Setup API Client
```typescript
import { apiClient, authAPI, courseAPI } from './lib/apiClient';

// Login
const response = await authAPI.login(email, password);
apiClient.setToken(response.data.accessToken);
```

### Example Usage
```typescript
// Get all courses
const { data } = await courseAPI.getAllCourses({ page: 1, limit: 10 });

// Enroll in course
await enrollmentAPI.enrollCourse(courseId);

// Submit quiz
await quizAPI.submitQuizAttempt(courseId, quizId, { answers, timeTaken });
```

See `frontend/src/lib/apiClient.ts` for complete API client.

## 📊 Database Schema

The backend uses Mongoose for schema validation and management. All models include:
- Timestamps (createdAt, updatedAt)
- Proper indexing
- Validation rules
- Relationships via references

## 🧪 Testing

```bash
npm test
```

(Test suite can be configured with Jest)

## 🐛 Error Handling

All errors follow standardized format:
```json
{
  "success": false,
  "message": "Error description",
  "data": {}
}
```

Custom error handling for:
- Validation errors
- JWT errors
- MongoDB errors
- Not found errors
- Authorization errors

## 📝 Logging

Uses console logging with prefixes:
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 📝 Info

Production logging can be enhanced with Winston or Pino.

## 🔄 Async/Await Pattern

All route handlers use async wrapper:
```javascript
export const handler = asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error handler
});
```

## 📱 Mobile API Ready

API designed for mobile consumption:
- Pagination support
- Efficient data serialization
- Consistent response format
- Token-based auth
- CORS enabled

## 🎯 Performance

- Database connection pooling
- Mongoose indexes
- Pagination for large datasets
- Efficient queries with population
- File uploads via Cloudinary CDN

## 🤖 Email Templates

Pre-configured templates:
- Enrollment confirmation
- Assignment feedback
- Course completion & certificate
- Easily customizable

## 📄 License

MIT

## 📧 Support

For issues and questions, please create an issue on the repository.

## 🙏 Contributing

Contributions welcome! Please submit pull requests with:
- Clear description
- Tests
- Documentation updates

---

**Built with ❤️ for the Eldohub Academy**
