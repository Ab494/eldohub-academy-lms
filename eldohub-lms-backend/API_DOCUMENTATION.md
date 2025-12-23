# Eldohub LMS Backend - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student" // or "instructor"
  }
  ```
- **Response:** User object with access and refresh tokens

### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with tokens

### Refresh Token
- **POST** `/auth/refresh-token`
- **Body:**
  ```json
  {
    "refreshToken": "<refresh_token>"
  }
  ```
- **Response:** New access and refresh tokens

### Get Current User
- **GET** `/auth/me`
- **Auth:** Required
- **Response:** Current user object

### Update Profile
- **PUT** `/auth/profile`
- **Auth:** Required
- **Body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "1234567890",
    "bio": "I am a student"
  }
  ```
- **Response:** Updated user object

### Change Password
- **POST** `/auth/change-password`
- **Auth:** Required
- **Body:**
  ```json
  {
    "oldPassword": "oldpass123",
    "newPassword": "newpass123"
  }
  ```

### Logout
- **POST** `/auth/logout`
- **Auth:** Required

---

## Course Endpoints

### Get All Courses
- **GET** `/courses`
- **Query Parameters:**
  - `category` - Filter by category
  - `level` - Filter by level (beginner, intermediate, advanced)
  - `instructor` - Filter by instructor ID
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 10)
- **Response:** List of published courses with pagination

### Get Course by ID
- **GET** `/courses/:courseId`
- **Response:** Course object with full details

### Create Course
- **POST** `/courses`
- **Auth:** Required (instructor, admin)
- **Body:**
  ```json
  {
    "title": "Advanced React",
    "description": "Learn advanced React patterns",
    "category": "Programming",
    "level": "advanced",
    "price": 99.99,
    "thumbnail": "https://..."
  }
  ```
- **Response:** Created course object

### Update Course
- **PUT** `/courses/:courseId`
- **Auth:** Required (instructor who created it)
- **Body:** Same as create (all fields optional)

### Publish Course
- **POST** `/courses/:courseId/publish`
- **Auth:** Required (instructor who created it)
- **Note:** Course must have at least one lesson

### Get My Courses (Instructor)
- **GET** `/courses/instructor/my-courses`
- **Auth:** Required (instructor, admin)
- **Query:** `page`, `limit`

### Delete Course
- **DELETE** `/courses/:courseId`
- **Auth:** Required (instructor who created it)

---

## Module Endpoints

### Create Module
- **POST** `/courses/:courseId/modules`
- **Auth:** Required (instructor)
- **Body:**
  ```json
  {
    "title": "Module 1: Basics",
    "description": "Introduction to React basics",
    "order": 1
  }
  ```

### Get Course Modules
- **GET** `/courses/:courseId/modules`
- **Response:** Array of modules with lessons

### Update Module
- **PUT** `/courses/:courseId/modules/:moduleId`
- **Auth:** Required (instructor)
- **Body:** Same as create

### Delete Module
- **DELETE** `/courses/:courseId/modules/:moduleId`
- **Auth:** Required (instructor)
- **Note:** Cascades delete to all lessons

---

## Lesson Endpoints

### Create Lesson
- **POST** `/courses/:courseId/modules/:moduleId/lessons`
- **Auth:** Required (instructor)
- **Body:**
  ```json
  {
    "title": "Lesson 1: JSX",
    "description": "Understanding JSX",
    "type": "video", // video, text, quiz, assignment
    "content": "Lesson content here",
    "videoUrl": "https://cloudinary.../video.mp4",
    "videoDuration": 1200,
    "order": 1,
    "isFree": false
  }
  ```

### Get Lesson
- **GET** `/courses/:courseId/modules/:moduleId/lessons/:lessonId`

### Update Lesson
- **PUT** `/courses/:courseId/modules/:moduleId/lessons/:lessonId`
- **Auth:** Required (instructor)
- **Body:** Same as create (all fields optional)

### Delete Lesson
- **DELETE** `/courses/:courseId/modules/:moduleId/lessons/:lessonId`
- **Auth:** Required (instructor)

---

## Enrollment Endpoints

### Enroll in Course
- **POST** `/enrollments/:courseId/enroll`
- **Auth:** Required (student)
- **Response:** Enrollment object

### Get My Enrollments
- **GET** `/enrollments/my/enrollments`
- **Auth:** Required
- **Query:** `page`, `limit`
- **Response:** List of student's enrollments

### Get Course Enrollments
- **GET** `/enrollments/:courseId/enrollments`
- **Auth:** Required (instructor of course)
- **Query:** `page`, `limit`
- **Response:** List of enrolled students

### Mark Lesson Complete
- **POST** `/enrollments/:courseId/lessons/:lessonId/complete`
- **Auth:** Required (student)
- **Response:** Updated enrollment with progress

### Get Progress
- **GET** `/enrollments/:courseId/progress`
- **Auth:** Required (student)
- **Response:** Enrollment progress object

---

## Quiz Endpoints

### Create Quiz
- **POST** `/courses/:courseId/quizzes/:lessonId`
- **Auth:** Required (instructor)
- **Body:**
  ```json
  {
    "title": "Quiz 1",
    "description": "Test your knowledge",
    "passingScore": 60,
    "timeLimit": 30,
    "attemptsAllowed": 2,
    "questions": [
      {
        "question": "What is React?",
        "type": "mcq",
        "options": ["A", "B", "C"],
        "correctAnswer": "A",
        "points": 1
      }
    ]
  }
  ```

### Submit Quiz Attempt
- **POST** `/courses/:courseId/quizzes/:quizId/submit`
- **Auth:** Required (student)
- **Body:**
  ```json
  {
    "courseId": "...",
    "answers": [
      {
        "answer": "A"
      }
    ],
    "timeTaken": 600
  }
  ```
- **Response:** Quiz attempt with score and status

### Get Quiz Attempts
- **GET** `/courses/:courseId/quizzes/:quizId/attempts`
- **Auth:** Required (student)
- **Response:** List of student's quiz attempts

### Get Best Attempt
- **GET** `/courses/:courseId/quizzes/:quizId/best-attempt`
- **Auth:** Required (student)
- **Response:** Best quiz attempt

---

## Assignment Endpoints

### Create Assignment
- **POST** `/courses/:courseId/assignments/:lessonId`
- **Auth:** Required (instructor)
- **Body:**
  ```json
  {
    "title": "Assignment 1",
    "description": "Build a React component",
    "dueDate": "2024-12-31T23:59:59Z",
    "instructions": "Create a card component",
    "totalPoints": 100,
    "maxSubmissions": 2
  }
  ```

### Submit Assignment
- **POST** `/courses/:courseId/assignments/:assignmentId/submit`
- **Auth:** Required (student)
- **Body:**
  ```json
  {
    "fileUrl": "https://cloudinary.../file.pdf",
    "fileName": "assignment1.pdf"
  }
  ```
- **Response:** Submission object

### Grade Submission
- **POST** `/courses/:courseId/assignments/submissions/:submissionId/grade`
- **Auth:** Required (instructor)
- **Body:**
  ```json
  {
    "grade": 85,
    "feedback": "Good work! Consider..."
  }
  ```

### Get Submission
- **GET** `/courses/:courseId/assignments/submissions/:submissionId`
- **Auth:** Required

### Get Assignment Submissions
- **GET** `/courses/:courseId/assignments/:assignmentId/submissions`
- **Auth:** Required (instructor)
- **Query:** `page`, `limit`

### Get My Submissions
- **GET** `/courses/:courseId/assignments/my/submissions/:courseId`
- **Auth:** Required (student)
- **Query:** `page`, `limit`

---

## Certificate Endpoints

### Generate Certificate
- **POST** `/certificates/:enrollmentId/generate`
- **Auth:** Required (student)
- **Note:** Only available when course is 100% completed
- **Response:** Certificate object

### Get Certificate
- **GET** `/certificates/:certificateId`
- **Response:** Certificate details

### Get My Certificates
- **GET** `/certificates/my/certificates`
- **Auth:** Required (student)
- **Query:** `page`, `limit`
- **Response:** List of student's certificates

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "data": {}
}
```

### Common Status Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, already enrolled)
- `500` - Server Error

---

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## User Roles & Permissions

### Student
- Register/login
- Enroll in courses
- View enrolled courses
- Complete lessons
- Take quizzes
- Submit assignments
- View certificates

### Instructor
- Create courses
- Manage course content (modules/lessons)
- Publish courses
- View enrollments
- Grade assignments
- View student progress

### Admin
- Manage all users
- Approve/publish courses
- View analytics
- All instructor permissions

---

## Pagination

Paginated endpoints return:
```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 100,
    "pages": 10,
    "currentPage": 1
  }
}
```

---

## Rate Limiting
Currently no rate limiting. Consider implementing in production.

## CORS
Frontend URL configured in `.env` - ensure your frontend is whitelisted.
