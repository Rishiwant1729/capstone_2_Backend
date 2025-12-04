# CritiCore Backend - Book Summary API

A Node.js/Express backend with PostgreSQL database for managing books and generating AI-powered summaries from PDF uploads.

## 🚀 Features

- ✅ **Authentication & Authorization**: JWT-based user signup, login, and session management
- ✅ **File Upload**: Secure PDF file upload using Multer
- ✅ **Text Extraction**: Extract content from uploaded PDFs using pdf-parse
- ✅ **Summary Generation**: Generate concise summaries from extracted text
- ✅ **User Dashboard**: Manage uploaded books and view generated summaries
- ✅ **RESTful API**: Clean, well-structured API endpoints

## 📋 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL (hosted on Aiven Cloud)
- **ORM**: Prisma
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **PDF Processing**: pdf-parse

## 📡 API Endpoints

### Authentication (Public)
```
POST   /api/auth/signup    - Register new user
POST   /api/auth/login     - Authenticate user
```

### Authentication (Protected)
```
GET    /api/auth/me        - Get current user profile
GET    /api/auth/users     - List all users
```

### Books (All Protected)
```
POST   /api/books/upload       - Upload a book (PDF/Text)
GET    /api/books              - Retrieve all uploaded books
GET    /api/books/:id/summary  - Get summary of a specific book
DELETE /api/books/:id/delete   - Delete a book and its summary
```

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd capstone_2_Backend-rishi
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
PORT=5001
```

4. **Run Prisma migrations**
```bash
npx prisma migrate dev --name init
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📂 Project Structure

```
capstone_2_Backend-rishi/
├── app.js                  # Express app configuration
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── src/
│   ├── server.js           # Server entry point
│   ├── prismaClient.js     # Prisma client instance
│   ├── controllers/
│   │   ├── authController.js
│   │   └── bookController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── bookRoutes.js
│   ├── utils/
│   │   ├── pdfExtract.js
│   │   └── summarizer.js
│   └── uploads/            # Uploaded PDF files
└── package.json
```

## 🗄️ Database Schema

### User
- `id` (Int, Primary Key)
- `email` (String, Unique)
- `name` (String, Optional)
- `password` (String, Hashed)
- `createdAt` (DateTime)

### Book
- `id` (Int, Primary Key)
- `title` (String, Required)
- `author` (String, Optional)
- `description` (String, Optional)
- `pdfPath` (String, Optional)
- `status` (String, Default: "uploaded")
- `ownerId` (Int, Foreign Key → User)
- `createdAt`, `updatedAt` (DateTime)

### Summary
- `id` (Int, Primary Key)
- `content` (String)
- `highlights` (String, Optional)
- `bookId` (Int, Unique, Foreign Key → Book)
- `createdById` (Int, Foreign Key → User)
- `createdAt`, `updatedAt` (DateTime)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens expire after 2 hours and are generated on signup/login.

## 📝 Example API Usage

### Signup
```bash
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Upload Book
```bash
curl -X POST http://localhost:5001/api/books/upload \
  -H "Authorization: Bearer <token>" \
  -F "title=My Book" \
  -F "author=John Author" \
  -F "pdf=@/path/to/file.pdf"
```

### Get Books
```bash
curl -X GET http://localhost:5001/api/books \
  -H "Authorization: Bearer <token>"
```

## 🚀 Deployment

The backend is ready for deployment on platforms like:
- **Render**
- **Railway**
- **Heroku**
- **AWS/GCP/Azure**

Make sure to set environment variables in your hosting platform.

## 📄 License

MIT

## 👨‍💻 Author

Rishi Kumar

