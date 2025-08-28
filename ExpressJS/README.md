# Express.js API với Forgot Password và Database Switching

## Tính năng

### 1. Forgot Password

- **POST** `/api/v1/forgot-password` - Gửi email reset password
- **POST** `/api/v1/reset-password` - Reset password với token

### 2. Database Switching

Hỗ trợ chuyển đổi giữa MongoDB và MySQL

## Cài đặt

```bash
npm install
```

## Cấu hình

### 1. Database

Trong file `.env`, cấu hình:

```env
# Database Configuration
DB_TYPE=mongodb  # hoặc mysql
MONGO_DB_URL="mongodb://admin:123456@localhost:27017"

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=baitap4

# Email Configuration (cho forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 2. Chuyển đổi Database

#### Sử dụng npm scripts:

```bash
# Chuyển sang MongoDB
npm run db:mongo

# Chuyển sang MySQL
npm run db:mysql

# Kiểm tra database hiện tại
npm run db:status
```

#### Sử dụng trực tiếp:

```bash
# Chuyển sang MongoDB
node db-switch.js mongo

# Chuyển sang MySQL
node db-switch.js mysql

# Kiểm tra database hiện tại
node db-switch.js status
```

## API Endpoints

### Authentication

- **POST** `/api/v1/register` - Đăng ký user mới
- **POST** `/api/v1/login` - Đăng nhập
- **POST** `/api/v1/forgot-password` - Quên mật khẩu
- **POST** `/api/v1/reset-password` - Reset mật khẩu

### User Management

- **GET** `/api/v1/user` - Lấy danh sách user (cần auth)
- **GET** `/api/v1/account` - Lấy thông tin account hiện tại (cần auth)

## Sử dụng

### 1. Khởi động server

```bash
npm run dev
```

### 2. Test Forgot Password API

#### Gửi yêu cầu forgot password:

```bash
curl -X POST http://localhost:8080/api/v1/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

#### Reset password:

```bash
curl -X POST http://localhost:8080/api/v1/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "your-reset-token", "newPassword": "newpassword123"}'
```

### 3. Chuyển đổi Database

#### Từ MongoDB sang MySQL:

```bash
npm run db:mysql
npm run dev  # Restart server
```

#### Từ MySQL về MongoDB:

```bash
npm run db:mongo
npm run dev  # Restart server
```

## Lưu ý

1. **Email Configuration**: Cần cấu hình SMTP để gửi email reset password
2. **MySQL Database**: Cần tạo database `baitap4` trước khi chạy với MySQL
3. **Restart Server**: Sau khi chuyển đổi database, cần restart server
4. **Token Expiry**: Reset password token có thời hạn 1 giờ

## Database Schema

### User Model (MongoDB & MySQL)

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "User"),
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

## Cấu trúc Project

```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── userController.js    # User controllers
├── models/
│   └── user.js             # User models (MongoDB & MySQL)
├── services/
│   ├── userService.js      # User business logic
│   └── emailService.js     # Email service
├── routes/
│   └── api.js              # API routes
└── server.js               # Main server file

db-switch.js                # Database switching tool
```
