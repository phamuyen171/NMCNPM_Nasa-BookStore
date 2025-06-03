# Nasabook API Documentation

## Authentication

Tất cả các API endpoints (trừ login/register) đều yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Register (Chỉ dùng cho thiết lập ban đầu)
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "string",
  "password": "string",
  "role": "manager" | "admin"
}
```

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "string",
    "username": "string",
    "role": "string"
  }
}
```

### Books Management

#### Get All Books
- **URL**: `/api/books`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "_id": "string",
        "title": "string",
        "author": "string",
        "price": "number",
        "quantity": "number",
        "description": "string",
        "category": "string",
        "publisher": "string",
        "priceImport": "number",
        "status": "string",
        "coverImage": "string",
        "isDeleted": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "total": "number"
  }
}
```

#### Get Book by ID
- **URL**: `/api/books/:id`
- **Method**: `GET`
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "author": "string",
    "price": "number",
    "quantity": "number",
    "description": "string",
    "category": "string",
    "publisher": "string",
    "priceImport": "number",
    "status": "string",
    "coverImage": "string",
    "isDeleted": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### Create Book
- **URL**: `/api/books`
- **Method**: `POST`
- **Auth**: Required (Manager/Admin)
- **Body**:
```json
{
  "title": "string",
  "author": "string",
  "price": "number",
  "quantity": "number",
  "description": "string",
  "category": "string",
  "publisher": "string",
  "priceImport": "number",
  "status": "string",
  "coverImage": "string"
}
```

#### Update Book
- **URL**: `/api/books/:id`
- **Method**: `PUT`
- **Auth**: Required (Manager/Admin)
- **Body**: Các trường cần cập nhật

#### Delete Book
- **URL**: `/api/books/:id`
- **Method**: `DELETE`
- **Auth**: Required (Manager/Admin)

#### Batch Delete Books
- **URL**: `/api/books/batch-delete`
- **Method**: `POST`
- **Auth**: Required (Manager/Admin)
- **Body**:
```json
{
  "bookIds": ["string"]
}
```

### Import Orders

#### Get Low Stock Books
- **URL**: `/api/books/import-order/lowstock`
- **Method**: `GET`
- **Auth**: Required (Manager/Admin)
- **Response**:
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "_id": "string",
        "title": "string",
        "quantity": "number",
        "status": "string"
      }
    ]
  }
}
```

#### Create Import Order
- **URL**: `/api/books/import-order`
- **Method**: `POST`
- **Auth**: Required (Manager/Admin)
- **Body**:
```json
{
  "items": [
    {
      "bookId": "string",
      "quantity": "number"
    }
  ]
}
```

#### Confirm Import Order
- **URL**: `/api/books/import-order/confirm/:orderId`
- **Method**: `PUT`
- **Auth**: Required (Manager/Admin)
- **Response**: PDF file

#### Update Book Quantity (After Receiving)
- **URL**: `/api/books/import-order/receive/:orderId`
- **Method**: `PUT`
- **Auth**: Required (Manager/Admin)

#### Get Import Order PDF
- **URL**: `/api/books/import-order/:orderId/pdf`
- **Method**: `GET`
- **Auth**: Required (Manager/Admin)
- **Response**: PDF file

## Error Responses

Tất cả các API endpoints đều trả về lỗi theo format:

```json
{
  "success": false,
  "message": "Error message"
}
```

### Common Error Codes

- `400`: Bad Request - Dữ liệu gửi lên không hợp lệ
- `401`: Unauthorized - Chưa xác thực hoặc token không hợp lệ
- `403`: Forbidden - Không có quyền truy cập
- `404`: Not Found - Không tìm thấy tài nguyên
- `500`: Internal Server Error - Lỗi server

## Rate Limiting

API có giới hạn số lượng request để tránh quá tải:
- 100 requests/15 minutes cho mỗi IP
- 1000 requests/24 hours cho mỗi IP 