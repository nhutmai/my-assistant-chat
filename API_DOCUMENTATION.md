# Gemini Bridge API Documentation (v2.1.0)

Hệ thống cung cấp các API để trích xuất dữ liệu bằng AI, quản lý định hướng nhận diện (Identity & Votes) và tích hợp đa kênh (Web, Facebook Messenger, Telegram).

---

## 1. Authentication

Hệ thống sử dụng **JWT Authentication**. Các API yêu cầu xác thực cần truyền header `Authorization: Bearer <token>`.
Người dùng có thể đăng nhập bằng mật khẩu (Admin) hoặc qua OTP (kênh Messenger/Telegram).

### Đăng nhập bằng Password
- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Mô tả:** Đăng nhập dành cho tài khoản Admin sử dụng username và password.
- **Payload:**
  ```json
  {
    "username": "admin",
    "password": "your_password"
  }
  ```
- **Phản hồi (200):**
  ```json
  {
    "token": "jwt_token_string",
    "expiresIn": "24h"
  }
  ```

### Yêu cầu OTP
- **Endpoint:** `POST /api/auth/otp/request`
- **Auth Required:** No
- **Mô tả:** Gửi yêu cầu mã OTP qua kênh đã chọn (facebook hoặc telegram).
- **Payload:**
  ```json
  {
    "channel": "facebook",
    "username": "admin"
  }
  ```

### Xác thực OTP
- **Endpoint:** `POST /api/auth/otp/verify`
- **Auth Required:** No
- **Mô tả:** Xác thực mã OTP và nhận lại JWT token.
- **Payload:**
  ```json
  {
    "username": "admin",
    "otp": "123456",
    "channel": "facebook"
  }
  ```
- **Phản hồi (200):**
  ```json
  {
    "token": "jwt_token_string",
    "expiresIn": "24h"
  }
  ```

---

## 2. Health Check

### Kiểm tra trạng thái hệ thống
- **Endpoint:** `GET /api/health`
- **Auth Required:** No
- **Mô tả:** Kiểm tra trạng thái và version của hệ thống.
- **Phản hồi (200):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-07-21T10:00:00Z",
    "version": "2.1.0"
  }
  ```

---

## 3. AI & Logs Services

### Trích xuất dữ liệu bằng AI
- **Endpoint:** `POST /api/ai/generate`
- **Auth Required:** Yes
- **Mô tả:** Nhận prompt, gọi AI để phân loại và trích xuất dữ liệu, lưu vào Notion và Postgres.
- **Payload:**
  ```json
  {
    "prompt": "Ăn sáng phở thìn 50k"
  }
  ```
- **Phản hồi thành công (201):**
  ```json
  {
    "status": "success",
    "data": {
      "category": "chi tiêu",
      "title": "Ăn sáng phở thìn",
      "value": 50000,
      "date": "2024-05-20"
    },
    "message": "Content generated and logged successfully"
  }
  ```

### Lấy danh sách Logs
- **Endpoint:** `GET /api/logs`
- **Auth Required:** Yes
- **Mô tả:** Lấy danh sách các bản ghi mới nhất từ Notion Database.
- **Phản hồi (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "object": "page",
        "id": "...",
        "properties": { ... }
      }
    ]
  }
  ```

---

## 4. Identity & Votes

### Lấy Identity
- **Endpoint:** `GET /api/identity`
- **Auth Required:** Yes
- **Mô tả:** Lấy nội dung định hướng (Identity) của người dùng hiện tại.
- **Phản hồi (200):**
  ```json
  {
    "status": "success",
    "data": {
      "identity": "Nội dung identity..."
    }
  }
  ```

### Lưu Identity
- **Endpoint:** `PUT /api/identity`
- **Auth Required:** Yes
- **Mô tả:** Cập nhật hoặc lưu nội dung định hướng mới.
- **Payload:**
  ```json
  {
    "identity": "Nội dung mới..."
  }
  ```

### Lấy danh sách Votes
- **Endpoint:** `GET /api/votes`
- **Auth Required:** Yes
- **Mô tả:** Lấy danh sách các thói quen/hành động (votes) của người dùng.
- **Phản hồi (200):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "vote_id",
        "name": "Đọc sách 30p"
      }
    ]
  }
  ```

### Thêm Vote mới
- **Endpoint:** `POST /api/votes`
- **Auth Required:** Yes
- **Mô tả:** Tạo một vote mới.
- **Payload:**
  ```json
  {
    "name": "Tập thể dục"
  }
  ```

### Xóa Vote
- **Endpoint:** `DELETE /api/votes/:id`
- **Auth Required:** Yes
- **Mô tả:** Xóa một vote dựa vào `id`.

### Toggle Vote (Trong ngày)
- **Endpoint:** `POST /api/votes/:id/toggle`
- **Auth Required:** Yes
- **Mô tả:** Chuyển đổi trạng thái (hoàn thành/chưa hoàn thành) của một vote trong ngày hôm nay.

---

## 5. Webhooks (Đa kênh)

### Facebook Messenger Webhook
#### Xác thực (Verification)
- **Endpoint:** `GET /api/webhook/messenger`
- **Auth Required:** No
- **Tham số query:** `hub.mode`, `hub.verify_token`, `hub.challenge`
- **Mô tả:** Dùng để xác thực webhook với Facebook Developers.

#### Xử lý tin nhắn
- **Endpoint:** `POST /api/webhook/messenger`
- **Auth Required:** No
- **Mô tả:** Tiếp nhận sự kiện tin nhắn từ Facebook, xử lý qua AI, lưu vào Notion/Postgres và phản hồi qua Send API.

### Telegram Bot Webhook
- **Endpoint:** `POST /api/webhook/telegram`
- **Auth Required:** No
- **Mô tả:** Tiếp nhận Update từ Telegram Bot, xử lý tin nhắn, trích xuất dữ liệu, lưu trữ và gửi phản hồi.
- **Payload:** Cấu trúc chuẩn của Telegram Update Object.

---

## 6. Error Handling
Mọi lỗi phát sinh trong quá trình xử lý AI hoặc tích hợp dịch vụ đều được:
1. Log ra console hệ thống sử dụng thư viện pino/logger.
2. Tự động ghi vào Notion và Postgres với `category: "error"`.
3. Trả về mã lỗi 400/401/403/404/500 tương ứng cho client dưới định dạng:
   ```json
   {
     "status": "error",
     "message": "Nội dung lỗi chi tiết"
   }
   ```
