# Nasabook Backend API

Backend API cho hệ thống quản lý sách Nasabook, được xây dựng với Node.js, Express và MongoDB.

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd nasabook-backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` trong thư mục gốc với các biến môi trường sau:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nasabook
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=1h
```

4. Khởi động server:
```bash
# Development mode với nodemon
npm run dev

# Production mode
npm start
```

## Cấu trúc Project

```
src/
├── app.js                 # Entry point của ứng dụng
├── business/             # Business logic layer
│   ├── models/          # Database models
│   └── services/        # Business logic services
├── config/              # Configuration files
├── data/               # Data access layer
├── fonts/              # Font files cho PDF generation
├── middlewares/        # Express middlewares
├── presentation/       # Presentation layer
│   ├── controllers/    # Route controllers
│   └── routes/         # API routes
└── utils/              # Utility functions
```

## API Documentation

Xem chi tiết API documentation tại [API.md](API.md)

## Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Các request cần gửi kèm token trong header:

```
Authorization: Bearer <your_jwt_token>
```

## Roles & Permissions

- **Manager**: Có quyền quản lý sách, tạo và xác nhận đơn nhập
- **Admin**: Có tất cả quyền của Manager
- **User**: Chỉ có quyền xem thông tin sách

## Error Handling

API trả về lỗi theo format:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

### Tạo JWT Token cho Testing

Sử dụng script `generate_token.js` để tạo token test:

```bash
node generate_token.js
```

### Testing

1. Đảm bảo MongoDB đang chạy
2. Khởi động server: `npm run dev`
3. Sử dụng Postman hoặc công cụ tương tự để test API

## License

MIT

---



