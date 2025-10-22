# 🏪 Product Management System

A full-stack web application for managing products and categories with a modern, responsive interface. Built with Vue.js, Node.js, and MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Validation Rules](#-validation-rules)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎯 Core Functionality
- **Product Management**: Create, read, update, and delete products
- **Category Management**: Organize products by categories
- **Product Details**: Comprehensive product information display
- **Category Analytics**: Statistics and insights for each category

### 🔍 Advanced Features
- **Real-time Search**: Search products and categories with debounced API calls
- **Pagination**: Efficient data loading with server-side pagination
- **Form Validation**: Comprehensive client-side validation with real-time feedback
- **Responsive Design**: Mobile-first design that works on all devices
- **Stock Management**: Track quantity and stock status (In Stock, Low Stock, Out of Stock)

### 💼 Business Features
- **Category Statistics**: Total products, values, and stock analysis
- **Product Analytics**: Price calculations and inventory insights
- **Visual Indicators**: Color-coded stock status and validation feedback
- **Navigation**: Seamless navigation between products and categories

## 🛠 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **Axios** - HTTP client for API communication
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger middleware

### DevOps
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker applications

## 📁 Project Structure

```
Product-Management/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable Vue components
│   │   │   ├── HelloWorld.vue
│   │   │   └── Navigation.vue
│   │   ├── router/          # Vue Router configuration
│   │   │   └── index.ts
│   │   ├── services/        # API service layer
│   │   │   └── api.ts
│   │   ├── views/           # Page components
│   │   │   ├── Categories.vue
│   │   │   ├── CategoryDetail.vue
│   │   │   ├── NotFound.vue
│   │   │   ├── ProductDetails.vue
│   │   │   └── Products.vue
│   │   ├── App.vue          # Root component
│   │   ├── main.ts          # Application entry point
│   │   └── style.css        # Global styles
│   ├── public/              # Static assets
│   ├── Dockerfile          # Frontend container configuration
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── server/                  # Node.js backend application
│   ├── configs/            # Configuration files
│   │   └── mongodb.js
│   ├── controllers/        # Route controllers
│   │   ├── CategoryController.js
│   │   └── ProductController.js
│   ├── models/             # MongoDB models
│   │   ├── categories.js
│   │   └── products.js
│   ├── routes/             # API routes
│   │   └── routes.js
│   ├── services/           # Business logic layer
│   │   ├── CategoryService.js
│   │   └── ProductService.js
│   ├── Dockerfile          # Backend container configuration
│   ├── index.js            # Server entry point
│   └── package.json        # Backend dependencies
├── docker-compose.yml      # Multi-container configuration
└── README.md              # Project documentation
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized deployment)
- **MongoDB** (if running locally without Docker)

## 🚀 Installation

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/SiraphopSangkrit/Product-Management.git
   cd Product-Management
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/SiraphopSangkrit/Product-Management.git
   cd Product-Management
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # In server directory
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

5. **Start MongoDB** (if running locally)

6. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🎮 Usage

### Products Management

1. **View Products**: Navigate to the main page to see all products
2. **Add Product**: Click "Add New Product" button and fill in the form
3. **Edit Product**: Click "Edit" button on any product row
4. **Delete Product**: Click "Delete" button and confirm
5. **View Details**: Click "View" button to see detailed product information
6. **Search Products**: Use the search bar to find specific products
7. **Filter by Category**: Use the category dropdown to filter products

### Categories Management

1. **View Categories**: Navigate to Categories page
2. **Add Category**: Click "Add New Category" button
3. **Edit Category**: Click "Edit" button on any category row
4. **Delete Category**: Click "Delete" button and confirm
5. **View Category Details**: Click "View" button to see category analytics
6. **Search Categories**: Use the search bar to find specific categories

### Category Analytics

- **Total Products**: Number of products in the category
- **Total Value**: Combined value of all products
- **Average Price**: Mean price across all products
- **Stock Status**: Low stock and out-of-stock counts

## 📚 API Documentation

### Products Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products with pagination and search |
| GET | `/api/product/:id` | Get product by ID |
| POST | `/api/product` | Create new product |
| PUT | `/api/product/:id` | Update product |
| DELETE | `/api/product/:id` | Delete product |

### Categories Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories with pagination and search |
| GET | `/api/category/:id` | Get category by ID |
| POST | `/api/category` | Create new category |
| PUT | `/api/category/:id` | Update category |
| DELETE | `/api/category/:id` | Delete category |

### Query Parameters

- `search`: Search term for name filtering
- `page`: Page number for pagination
- `limit`: Number of items per page
- `categoryId`: Filter products by category (products endpoint only)

## 🔒 Validation Rules

### Product Names
- ✅ **Required**: Cannot be empty
- ✅ **Length**: 2-100 characters
- ✅ **Pattern**: Letters only (no spaces, numbers, or special characters)
- ❌ **Invalid examples**: "Product 1", "Product_Name", "Product-123"
- ✅ **Valid examples**: "ProductName", "SmartPhone", "Laptop"

### Category Names
- ✅ **Required**: Cannot be empty
- ✅ **Length**: 2-50 characters
- ✅ **Pattern**: Letters only (no spaces, numbers, or special characters)
- ❌ **Invalid examples**: "Category 1", "Tech_Items", "Home-Goods"
- ✅ **Valid examples**: "Electronics", "Clothing", "Books"

### Product Details
- **Description**: Optional, maximum 500 characters
- **Price**: Required, $0.00 - $999,999.99, maximum 2 decimal places
- **Quantity**: Required, whole numbers, 0 - 999,999
- **Category**: Required, must select from existing categories


**Made with ❤️ by [Siraphop Sangkrit](https://github.com/SiraphopSangkrit)**

