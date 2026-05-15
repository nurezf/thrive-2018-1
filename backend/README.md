# Thrive Project

## User Authentication

- Register:  
  POST http://localhost:8000/api/users/register

- Sign In:  
  POST http://localhost:8000/api/users/login

- Get All Users (admin only):  
  GET http://localhost:8000/api/users

---

## Categories

- Create Category:  
  POST http://localhost:8000/api/categories/create

- Get All Categories:  
  GET http://localhost:8000/api/categories

- Update Category:  
  PUT http://localhost:8000/api/categories/update/:category_id

- Delete Category:  
  DELETE http://localhost:8000/api/categories/delete/:category_id

---

## Products

- Create Product:  
  POST http://localhost:8000/api/product

- Get All Products:  
  GET http://localhost:8000/api/product

- Get Single Product:  
  GET http://localhost:8000/api/product/:id

---

## Product Images

- Add Product Image:  
  POST http://localhost:8000/api/product/:product_id/images

- Get All Images for Product:  
  GET http://localhost:8000/api/product/:product_id/images

- Get Single Image:  
  GET http://localhost:8000/api/product/:product_id/images/:image_id

- Update Image:  
  PUT http://localhost:8000/api/product/:product_id/images/:image_id

- Delete Image:  
  DELETE http://localhost:8000/api/product/:product_id/images/:image_id

---

## Sales

- Create Sale:  
  POST http://localhost:8000/api/sales/create

- Approve Sale:  
  POST http://localhost:8000/api/sales/:sales_id/approve

- Reject Sale:  
  POST http://localhost:8000/api/sales/:sales_id/reject

- Get Sales:  
  GET http://localhost:8000/api/sales

- Get Sale Product Quantity:  
  GET http://localhost:8000/api/sales/product

- Get Sale Product Quantity by Sales ID:  
  GET http://localhost:8000/api/sales/product/:sales_id

## Environment Variables (.env)

DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=8000
JWT_SECRET="your_jwt_secret"
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

## Installation and Setup

### Install Dependencies

Open a terminal in your backend folder and run:
npm install

### Set Up Environment Variables

Create a .env file in the backend directory and configure it with the variables shown above. Replace the placeholder values with your actual credentials.

### Run Database Migrations (Prisma)

npx prisma generate
npx prisma migrate dev

## Running the Server

### Start the Server

npm start

This will start the server using nodemon for development with auto-reload.

Your server should now be running at http://localhost:8000.

### API Documentation

You can access the Swagger UI for API documentation at http://localhost:8000/api-docs (if configured).
