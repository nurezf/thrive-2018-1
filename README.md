# Thrive Project

This is a full-stack e-commerce application built with Next.js for the frontend and Node.js/Express for the backend, using Prisma as the ORM for PostgreSQL database.

## Prerequisites

- Node.js (version 18 or higher)
- npm
- PostgreSQL database
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd thrive-2018-1
   ```

2. Set up the backend:

   ```bash
   cd backend
   npm install
   ```

   - Create a .env file in the backend directory with the following variables:

     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
     PORT=8000
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

   - Set up the database:
     ```bash
     npx prisma generate
     npx prisma migrate dev
     ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

1. Start the backend server:

   ```bash
   cd backend
   npm start
   ```

   The backend will run on http://localhost:8000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## API Documentation

The backend provides RESTful APIs for user authentication, categories, products, sales, and more. Refer to backend/README.md for detailed API endpoints.

## Technologies Used

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, Prisma, PostgreSQL
- Authentication: JWT,
- File Upload: Multer, Cloudinary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
