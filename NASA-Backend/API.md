# API Documentation - Hệ thống Quản lý Sách & Tài khoản

## Base URL
```
http://localhost:3000/api
```

## Authentication & Authorization

Hiện tại, các API quản lý sách chưa yêu cầu xác thực đầy đủ (như mô tả ở phần 1.1). Khi tích hợp với module Auth, các endpoint cần phân quyền sẽ được bảo vệ bằng middleware.

Để đăng nhập và quản lý tài khoản/nhân viên, sử dụng các endpoint trong phần 3 và 4. Các endpoint này có thể yêu cầu xác thực.

### Yêu cầu xác thực (nếu cần thiết cho các endpoint cũ):

Các API endpoints yêu cầu xác thực sẽ cần JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Quản lý Sách

#### 1.1. Lấy danh sách sách
- **URL**: `/books`
- **Method**: `GET`
- **Description**: Lấy danh sách tất cả sách trong cửa hàng. Hỗ trợ phân trang, lọc và sắp xếp. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Query Parameters**: (Giữ nguyên)
  - `page` (optional): Số trang (mặc định: 1)
  - `limit` (optional): Số lượng sách trên mỗi trang (mặc định: 10)
  - `sortBy` (optional): Trường sắp xếp (ví dụ: `title`, `author`, `price`, `quantity`).
  - `order` (optional): Thứ tự sắp xếp (`1` cho ASC, `-1` cho DESC) (mặc định: 1)
  - `category` (optional): Lọc theo thể loại (hỗ trợ tìm kiếm một phần, không phân biệt hoa thường).
  - `author` (optional): Lọc theo tác giả.
  - `minPrice` (optional): Lọc giá từ.
  - `maxPrice` (optional): Lọc giá đến.
- **Response**: 
  ```json
  {
    "success": true,
    "data": { /* ... */ }
  }
  ```

#### 1.2. Tìm kiếm sách
- **URL**: `/books/search`
- **Method**: `GET`
- **Description**: Tìm kiếm sách theo tên, tác giả, thể loại hoặc nhà xuất bản (không phân biệt hoa thường). Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Query Parameters**: 
  - `searchTerm`: Từ khóa tìm kiếm (bắt buộc).
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Tìm kiếm thành công" OR "Không tìm thấy kết quả phù hợp",
    "data": { /* ... */ }
  }
  ```

#### 1.3. Lấy thông tin chi tiết sách
- **URL**: `/books/:id`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết của một cuốn sách theo ID. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `id`: ID của sách cần lấy thông tin.
- **Response**: 
  ```json
  {
    "success": true,
    "data": { /* ... */ }
  }
  ```

#### 1.4. Thêm sách mới
- **URL**: `/books`
- **Method**: `POST`
- **Description**: Thêm một hoặc nhiều cuốn sách mới vào hệ thống. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Body**: Có thể là một object (thêm 1 sách) hoặc một mảng các object (thêm nhiều sách), mỗi object có cấu trúc:
  ```json
  {
    "title": "string", (required)
    "author": "string", (required)
    "price": "number", (required, > 0)
    "quantity": "number", (required, >= 0)
    "description": "string", (optional)
    "category": "string", (required)
    "publisher": "string", (optional)
    "priceImport": "number", (required, > 0)
    "status": "string" (optional, default: 'Available' if quantity > 0, 'Out of Stock' if quantity === 0)
    "coverImage": "string" (optional, URL format validation)
  }
  ```
- **Response**: (Giữ nguyên)
  ```json
  {
    "success": true,
    "message": "Thêm sách thành công" OR "Đã thêm thành công X cuốn sách.",
    "data": { ... // Thông tin sách vừa thêm hoặc danh sách sách đã thêm }
  }
  ```

#### 1.5. Cập nhật thông tin sách
- **URL**: `/books/:id`
- **Method**: `PUT`
- **Description**: Cập nhật thông tin của một cuốn sách theo ID. Chỉ cần gửi các trường muốn cập nhật. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `id`: ID của sách cần cập nhật (bắt buộc).
- **Body**: Có thể bao gồm bất kỳ trường nào của sách với giá trị mới (tương tự 1.4).
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Cập nhật sách thành công",
    "data": { ... // Thông tin sách sau khi cập nhật }
  }
  ```

#### 1.6. Xóa sách (Soft Delete)
- **URL**: `/books/:id`
- **Method**: `DELETE`
- **Description**: Đánh dấu một cuốn sách là đã xóa mềm (`isDeleted: true`). Sách sẽ không còn hiển thị trong danh sách mặc định. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `id`: ID của sách cần xóa mềm (bắt buộc).
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Xóa sách thành công"
  }
  ```

#### 1.7. Tăng số lượng sách (Import More) - Chỉ nhập đơn lẻ
- **URL**: `/books/import/:id`
- **Method**: `PUT`
- **Description**: Tăng số lượng tồn kho cho một cuốn sách cụ thể. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `id`: ID của sách cần nhập thêm (bắt buộc).
- **Body**: 
  ```json
  {
    "quantity": "number" // Số lượng cần nhập thêm (bắt buộc, > 0)
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Đã nhập thêm X cuốn cho sách Y",
    "data": { ... // Thông tin sách sau khi cập nhật }
  }
  ```

#### 1.8. Đánh dấu sách ngừng kinh doanh (Mark as Discontinued)
- **URL**: `/books/discontinue/:id`
- **Method**: `PUT`
- **Description**: Đánh dấu một cuốn sách là đã ngừng kinh doanh. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `id`: ID của sách cần đánh dấu (bắt buộc).
- **Body**: (Không cần body)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Đã đánh dấu sách X ngừng kinh doanh",
    "data": { ... // Thông tin sách sau khi cập nhật }
  }
  ```

#### 1.9. Kiểm tra sách có còn hàng không (Is Available)
- **URL**: `/books/available/:id`
- **Method**: `GET`
- **Description**: Kiểm tra xem một cuốn sách có còn hàng và không bị ngừng kinh doanh không. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `id`: ID của sách cần kiểm tra (bắt buộc).
- **Response**: 
  ```json
  {
    "success": true,
    "data": "boolean" // true nếu sách còn hàng và không ngừng kinh doanh, false nếu ngược lại
  }
  ```

### 2. Quản lý Đơn Nhập Sách (Import Orders)

#### 2.1. Xem sách sắp hết/đã hết
- **URL**: `/books/lowstock`
- **Method**: `GET`
- **Description**: Lấy danh sách sách có số lượng tồn kho thấp hoặc đã hết. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Response**: 
  ```json
  {
    "success": true,
    "data": { /* ... */ }
  }
  ```

#### 2.2. Tạo đơn nhập sách
- **URL**: `/books/import-order`
- **Method**: `POST`
- **Description**: Tạo một đơn nhập sách mới. Có thể nhập nhiều loại sách cùng lúc trong một đơn. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Body**: 
  ```json
  {
    "items": [
      {
        "bookId": "string",    // ID sách (bắt buộc)
        "quantity": "number" // Số lượng cần nhập cho sách này (bắt buộc, từ 5 đến 1000 theo quy định)
      }
      // ... có thể có nhiều item trong mảng
    ]
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Đã tạo đơn nhập sách thành công",
    "data": { /* ... */ }
  }
  ```

#### 2.3. Xác nhận đơn nhập sách
- **URL**: `/books/import-order/confirm/:orderId`
- **Method**: `PUT`
- **Description**: Xác nhận một đơn nhập sách đang ở trạng thái pending. Sau khi xác nhận, số lượng sách trong kho sẽ được cập nhật và file PDF được tạo ra. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `orderId`: ID của đơn nhập cần xác nhận (bắt buộc).
- **Body**: (Không cần body)
- **Response**: File PDF (Content-Type: application/pdf). Nếu xác nhận thành công, backend sẽ trả về file PDF.

#### 2.4. Tải PDF đơn nhập sách
- **URL**: `/books/import-order/:orderId/pdf`
- **Method**: `GET`
- **Description**: Lấy file PDF của một đơn nhập sách đã xác nhận. Lưu ý: Endpoint này hiện tại chưa yêu cầu xác thực.
- **Parameters**: 
  - `orderId`: ID của đơn nhập cần tạo PDF (bắt buộc).
- **Response**: File PDF (Content-Type: application/pdf)

### 3. Quản lý tài khoản (Authentication)

#### 3.1 Đăng nhập

- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Nhân viên đăng nhập để sử dụng website.
- **Body**: 
  ```json
  {
    "username": "string",    // ID nhân viên (bắt buộc)
    "password": "string" // mật khẩu (bắt buộc, tối thiểu 8 kí tự)
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": { "token": "string" }
  }
  ```

#### 3.2 Thêm nhân viên (tạo tài khoản cho nhân viên)
- **URL**: `/auth/create-account`
- **Method**: `POST`
- **Description**: Cửa hàng trưởng dùng để tạo tài khoản cho nhân viên, đồng thời lưu thông tin nhân viên.
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string",
    "fullName": "string",
    "address": "string",
    "phone": "string",
    "CCCD": "string",
    "DoB": "Date",
    "role": "string" // giá trị: ['manager', 'staff', 'accountant']
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Tạo tài khoản thành công",
    "data": { /* ... */ }
  }
  ```

### 4. Quản lý nhân viên:

#### 4.1 Tạo các thông tin tự động cho nhân viên
- **URL**: `/staff/fill-staff-auto`
- **Method**: `POST`
- **Description**: Tự động tạo thông tin mã nhân viên, email, tên đăng nhập, mật khẩu khi nhập thông tin nhân viên mới
- **Body**: 
  ```json
  {
    "role": "string",
    "CCCD": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Tạo thông tin nhân viên tự động thành công",
    "data": { /* ... */ }
  }
  ```

### 5. Quản lý Hóa Đơn (Invoice Management)

#### 5.1. Lấy danh sách sách phổ biến
- **URL**: `/invoices/popular-books`
- **Method**: `GET`
- **Description**: Lấy danh sách các cuốn sách được bán chạy nhất.
- **Response**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "title": "string",
        "price": "number",
        "salesCount": "number",
        "quantity": "number"
      }
    ]
  }
  ```

#### 5.2. Tạo hóa đơn mới
- **URL**: `/invoices`
- **Method**: `POST`
- **Description**: Tạo một hóa đơn mới. Hệ thống sẽ tự động tạo khách hàng mới nếu số điện thoại chưa tồn tại.
- **Body**: 
  ```json
  {
    "items": [
      {
        "bookId": "string",    // ID sách (bắt buộc)
        "quantity": "number" // Số lượng sách (bắt buộc, > 0)
      }
    ],
    "customerPhone": "string", // Số điện thoại khách hàng (tùy chọn)
    "customerIdCard": "string",// CCCD khách hàng (tùy chọn, bắt buộc nếu tổng số lượng sách >= 20)
    "paymentMethod": "string"  // Phương thức thanh toán ("cash" hoặc "debt", bắt buộc)
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Tạo hóa đơn thành công",
    "data": {
      "invoiceID": "string",
      "subtotal": "number",
      "discount": "number",
      "total": "number",
      "status": "string",
      "customerPhone": "string",
      "customerType": "string",
      "points": "number",
      "paymentMethod": "string",
      "appliedPromotion": "string", // ID khuyến mãi đã áp dụng (nếu có)
      "promotionDiscount": "number", // Số tiền giảm giá từ khuyến mãi
      "createdBy": "string",
      "isDeleted": "boolean",
      "details": [
        {
          "bookId": "string",
          "bookTitle": "string",
          "quantity": "number",
          "pricePerUnit": "number",
          "subtotal": "number"
        }
      ]
    }
  }
  ```

#### 5.3. Lấy danh sách hóa đơn
- **URL**: `/invoices`
- **Method**: `GET`
- **Description**: Lấy danh sách tất cả hóa đơn. Hỗ trợ phân trang, lọc và sắp xếp.
- **Query Parameters**: 
  - `page` (optional): Số trang (mặc định: 1)
  - `limit` (optional): Số lượng hóa đơn trên mỗi trang (mặc định: 10)
  - `status` (optional): Lọc theo trạng thái hóa đơn (`paid` hoặc `debt`).
  - `customerPhone` (optional): Lọc theo số điện thoại khách hàng.
  - `startDate` (optional): Lọc hóa đơn từ ngày này (định dạng YYYY-MM-DD).
  - `endDate` (optional): Lọc hóa đơn đến ngày này (định dạng YYYY-MM-DD).
  - `keyword` (optional): Tìm kiếm theo `invoiceID` (nếu bắt đầu bằng "INV-") hoặc `customerPhone`.
  - `sortBy` (optional): Trường sắp xếp (ví dụ: `date`, `total`).
  - `sortOrder` (optional): Thứ tự sắp xếp (`1` cho ASC, `-1` cho DESC) (mặc định: -1 cho `date`).
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "invoices": [
        { /* ... invoice object ... */ }
      ],
      "total": "number",
      "page": "number",
      "totalPages": "number"
    }
  }
  ```

#### 5.4. Lấy chi tiết hóa đơn
- **URL**: `/invoices/:id`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết của một hóa đơn theo ID hoặc `invoiceID`.
- **Parameters**: 
  - `id`: ID của hóa đơn (có thể là `_id` hoặc `invoiceID`).
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "invoiceID": "string",
      // ... các trường khác của hóa đơn ...
      "details": [
        { /* ... invoice detail object ... */ }
      ],
      "promotionInfo": { // Thông tin khuyến mãi nếu có
        "_id": "string",
        "code": "string",
        "name": "string",
        "discountValue": "number"
      }
    }
  }
  ```

#### 5.5. Xóa hóa đơn (Soft Delete)
- **URL**: `/invoices/:id`
- **Method**: `DELETE`
- **Description**: Đánh dấu một hóa đơn là đã xóa mềm (`isDeleted: true`). Không thể xóa hóa đơn đang ở trạng thái 'debt'.
- **Parameters**: 
  - `id`: ID của hóa đơn (có thể là `_id` hoặc `invoiceID`).
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Xóa hóa đơn thành công"
  }
  ```

### 6. Quản lý Khách Hàng (Customer Management)

#### 6.1. Tạo mới hoặc lấy thông tin khách hàng
- **URL**: `/customers`
- **Method**: `POST`
- **Description**: Tìm kiếm khách hàng theo số điện thoại. Nếu không tìm thấy, tạo mới khách hàng chỉ với số điện thoại và tên mặc định. Nếu khách hàng đã tồn tại, có thể cập nhật điểm tích lũy và tổng chi tiêu.
- **Body**: 
  ```json
  {
    "phone": "string",         // Số điện thoại (bắt buộc, 10 chữ số)
    "points": "number",        // Số điểm muốn cộng thêm (tùy chọn, mặc định 0 nếu không tồn tại hoặc không được gửi)
    "totalSpent": "number"     // Tổng chi tiêu muốn cộng thêm (tùy chọn, mặc định 0 nếu không tồn tại hoặc không được gửi)
    // Lưu ý: Các trường "name", "type", "idCard" có thể được gửi nhưng KHÔNG được sử dụng để tạo khách hàng mới bởi API này.
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "data": { 
      "_id": "string",
      "phone": "string",
      "name": "Khách hàng mới", // Tên mặc định nếu là khách hàng mới được tạo
      "type": "normal",     // Loại mặc định nếu là khách hàng mới được tạo (có thể cần điều chỉnh ở service/model)
      "points": "number",
      "totalSpent": "number"
      // Các trường khác như "idCard" sẽ là null nếu không được xử lý trong service. 
    }
  }
  ```

#### 6.2. Thêm khách hàng mới
- **URL**: `/customers/add`
- **Method**: `POST`
- **Description**: Thêm một khách hàng mới vào hệ thống. Kiểm tra trùng lặp số điện thoại. 
- **Body**: 
  ```json
  {
    "phone": "string", // Số điện thoại (bắt buộc, 10 chữ số)
    "name": "string",  // Tên khách hàng (bắt buộc)
    "type": "string",  // "retail" hoặc "wholesale" (bắt buộc, mặc định ở service là "normal" nếu không truyền)
    "idCard": "string" // CCCD (tùy chọn, hiện tại controller nhận nhưng service chưa lưu)
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Thêm khách hàng thành công",
    "data": { 
      "_id": "string",
      "phone": "string",
      "name": "string",
      "type": "string", // "retail" hoặc "wholesale" (hoặc "normal" nếu service không được truyền đúng)
      "points": "number",
      "totalSpent": "number"
      // "idCard" sẽ không được lưu nếu service không được sửa để nhận nó.
    }
  }
  ```

#### 6.3. Tìm kiếm khách hàng theo số điện thoại
- **URL**: `/customers/phone/:phone`
- **Method**: `GET`
- **Description**: Lấy thông tin chi tiết của một khách hàng bằng số điện thoại.
- **Parameters**: 
  - `phone`: Số điện thoại của khách hàng (bắt buộc).
- **Response**: 
  ```json
  {
    "success": true,
    "data": { /* ... customer object ... */ }
  }
  ```

#### 6.4. Cập nhật điểm tích lũy và công nợ khách hàng
- **URL**: `/customers/points`
- **Method**: `POST`
- **Description**: Cập nhật điểm tích lũy và tổng chi tiêu hiện tại cho một khách hàng đã tồn tại. Nếu khách hàng không tìm thấy, một bản ghi khách hàng mới sẽ được tạo chỉ với số điện thoại.
- **Body**: 
  ```json
  {
    "phone": "string",         // Số điện thoại khách hàng (bắt buộc)
    "points": "number",        // Số điểm muốn cộng thêm (tùy chọn, mặc định 0)
    "totalSpent": "number"     // Tổng chi tiêu muốn cộng thêm (tùy chọn, mặc định 0)
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Cập nhật điểm và công nợ khách hàng thành công", // Message này có thể không phản ánh việc công nợ được cập nhật
    "data": { /* ... updated customer object ... */ }
  }
  ```

## Error Responses

Tất cả các API đều có thể trả về lỗi với format:
```json
{
  "success": false,
  "message": "Mô tả lỗi chi tiết"
}
```

### Các mã trạng thái HTTP và lỗi phổ biến:
- `200 OK`: Yêu cầu thành công.
- `201 Created`: Yêu cầu tạo tài nguyên thành công.
- `400 Bad Request`: Yêu cầu không hợp lệ (ví dụ: thiếu/sai dữ liệu, ID sai format, dữ liệu trùng lặp).
- `401 Unauthorized`: Chưa xác thực hoặc token không hợp lệ (áp dụng cho các endpoint yêu cầu Auth).
- `403 Forbidden`: Không có quyền truy cập (áp dụng cho các endpoint yêu cầu Auth và phân quyền).
- `404 Not Found`: Không tìm thấy tài nguyên được yêu cầu (ví dụ: không tìm thấy sách theo ID).
- `500 Internal Server Error`: Lỗi xảy ra ở phía server.

## Rate Limiting

API có giới hạn số lượng request để tránh quá tải:
- 100 requests/15 minutes cho mỗi IP
- 1000 requests/24 hours cho mỗi IP 