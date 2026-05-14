
# Nihal-Electronic-e-commerce-project

## User Authentication
- **Register**:  
  `POST http://localhost:8000/api/users/register`

- **get all user admin only**:  
  `GET http://localhost:8000/api/users`
-**get user with role delivery(admin)**
  `GET http://localhost:8000/api/users/delivery`  

- **Sign In**:  
  `POST http://localhost:8000/api/users/signin`

- **refresh token**
  `POST /api/users/refresh (Validate refresh token)`

- **logout**
 ` POST /api/users/logout `

 - **update profile**
 ` PUT /api/users/profile `

 - **change password**
 ` PUT /api/users/password `

## Social Authentication
- **Google Login**:  
  `GET http://localhost:8000/api/auth/google`

- **Facebook Login**:  
  `GET http://localhost:8000/api/auth/facebook`

- **get decoded token**
  `http://localhost:8000/api/users/decode/:token`

---

## Categories
- **Create Category**:  
  `POST http://localhost:8000/api/categories`

- **Get All Categories**:  
  `GET http://localhost:8000/api/categories`

- **Get Single Category**:  
  `GET http://localhost:8000/api/categories/:category_id`

- **Update Category**:  
  `PUT http://localhost:8000/api/categories/:category_id`

- **Delete Category**:  
  `DELETE http://localhost:8000/api/categories/:category_id`

---

## Products
- **Create Product**:  
  `POST http://localhost:8000/api/products`

- **Get All Products**:  
  `GET http://localhost:8000/api/products`

- **Get Single Product**:  
  `GET http://localhost:8000/api/products/:product_id`

- **Update Product**:  
  `PUT http://localhost:8000/api/products/:product_id`

- **Delete Product**:  
  `DELETE http://localhost:8000/api/products/:product_id`

- **Get related Products**:  
  `http://localhost:8000/api/products/:product_id/related`
---


## Product Images
- **Add Product Image**:  
  `POST http://localhost:8000/api/products/:product_id/images`

- **Get All Images for Product**:  
  `GET http://localhost:8000/api/products/:product_id/images`

- **Get Single Image**:  
  `GET http://localhost:8000/api/products/:product_id/images/:image_id`

- **Update Image**:  
  `PUT http://localhost:8000/api/products/:product_id/images/:image_id`

- **Delete Image**:  
  `DELETE http://localhost:8000/api/products/:product_id/images/:image_id`

---



## Address
- **Add Address**:  
  `POST http://localhost:8000/api/addresses`

- **Get Address**:  
  `GET http://localhost:8000/api/addresses`

- **Update Address**:  
  `PUT http://localhost:8000/api/addresses/:addressId`

- **Delete Address**:  
  `DELETE http://localhost:8000/api/addresses/:addressId`

---

## Shipping Method
- **Add Shipping Methodt**:  
  `POST http://localhost:8000/api/shipping-methods`

- **Get Shipping Method**:  
  `GET http://localhost:8000/api/shipping-methods`

- **Update Shipping Method**:  
  `PUT http://localhost:8000/api/shipping-methods/:shippingMethodId`

- **Delete Shipping Method**:  
  `DELETE http://localhost:8000/api/shipping-methods/:shippingMethodId`

---

## Order
- **Add Order**:  
  `POST http://localhost:8000/api/orders`

- **Get Orders**:  
  `GET POST http://localhost:8000/api/orders`

- **Get Single Orders**:  
  `GET POST http://localhost:8000/api/orders/:orderId`  

- **Update order status**:  
  `PUT http://localhost:8000/api/orders/:orderId`

- **get All orders(admin)**
  `PUT http://localhost:8000/api/orders/amdin/all`

---

## delivery
-**Get delivery for order**
 `GET /api/deliveries/:orderId `
-**Admin assign staff** 
 `PUT /api/deliveries/:orderId/assign` 
-**Update status/track** 
 `PUT /api/deliveries/:deliveryId/track` 
 
--- 

## reviews or ratings
- **Add rating**:  
  `POST http://localhost:8000/api/reviews`

- **Get rating**:  
  `GET http://localhost:8000/api/reviews/:productId`


---
## Loved product
- **Add and remove**:
 `POST http://localhost:8000/api/loved/toggle`
- **Get loved products**:
 `GET http://localhost:8000/api/loved`
-**Check loved product**
`http://localhost:8000/api/loved/check/:productId`

---

## payment
- **create payment**
`POST http://localhost:8000/api/payments/:orderId`
`form-data: {
  "amout": "",
  "method":"card" || "mobile_money" || "cash" || "bank_transfer",
  "transaction_id": "",
  "bank_name": "",
  "account_number": "",
  "receipt_screenshot": "file"
}`

-**Get payment for order**
`http://localhost:8000/api/payments/:orderId`

-**Update payment status (admin)**
`PUT http://localhost:8000/api/payments/:paymentId/status`
`data: { "status": "completed" || "pending" || "failed" }`

-**Verify bank payment (admin)**
`PUT http://localhost:8000/api/payments/:paymentId/verify-bank`
`data:{ "verified": true, "notes": "Receipt confirmed" }`

-**get payment list(admin)**
`GET http://localhost:8000/api/payments`


## Environment Variables (`.env`)
```env
DATABASE_URL="mysql://root:1234@localhost:3306/ElectroShop"
PORT=8000
GOOGLE_CLIENT_ID="645889207349-09hdhs2bc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-tFhTs1VPYPrb2b"
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
JWT_SECRET="/slBa/Ifb2Obf7j1n/+qe7P6bgMxDAwszevFgFsOOJ8lWjDEnBeNSvM3NnZ/UeQhYmAduixRAPF0R+NkAbJDSA=="



To run your Node.js project:

Install dependencies
Open a terminal in your backend folder and run:

Set up environment variables
Make sure your .env file is present and configured (as shown in your README).

Run database migrations (if using Prisma):

Start the server:

or, for development with auto-reload:

Your server should now be running at http://localhost:8000.