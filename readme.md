# Wallet API 🏦

## [Live API Documentation](https://wallet-lzvg.onrender.com/api-docs/) 📝


## Overview 📝

The Wallet API provides endpoints for user management and tracking personal finances through
transactions. Users can register, login, view profile info, and log out. Once authenticated, they
can perform CRUD operations on transactions, filter transactions, and get aggregated data like total
income, expenses, and totals per category.

## Endpoints 🛣️

**Users**

- ✅ **POST /users/register**: Register a new user
- ✅ **POST /users/login**: Login an existing user
- ✅ **POST /users/refresh**: Refresh Tokens - requires valid refresh token
- 🔒 **GET /users/profile**: Get profile of authenticated user
- 🔒 **GET /users/logout**: Logout authenticated user

**Transactions**

- 🔒 **GET /transactions**: Get all transactions for authenticated user
- 🔒 **POST /transactions**: Create a new transaction
- 🔒 **DELETE /transactions/{id}**: Delete transaction by ID
- 🔒 **PATCH /transactions/{id}**: Update transaction by ID
- 🔒 **GET /transactions/{month}/{year}**: Filter transactions by month and year
- 🔒 **GET /transactions/categories/totals**: Get totals and sum per category
- 🔒 **GET /transactions/categories/{month}/{year}**: Get totals and sum per category for given
  month/year

**Authentication** 🔑 The API uses JWT tokens for authentication. Register and login endpoints
provide new tokens. Provide the Bearer token in the Authorization header to authenticate requests.

**Error Handling** 

- ❌ Validation errors return 400 with a ValidationError response.
- ❌ Unauthorized requests return 401 status.
- ❌ NotFound errors return 404 status.
- ❌ Other server errors return 500 status.

**Libraries** 📚 You can interact with the API using any HTTP client like:

- 📮 **Postman**
- 🐚 **curl**
- 🌐 **Axios**
- 🌪️ **Unirest**

Client libraries can also be generated from the OpenAPI spec for convenience.
