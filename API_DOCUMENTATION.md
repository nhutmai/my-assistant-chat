# Gemini Bridge API Documentation (v2.1.0)

Hệ thống cung cấp các API để trích xuất dữ liệu bằng AI và tích hợp đa kênh (Web, Facebook Messenger, Telegram).

---

## 1. Authentication (Lưu ý)
Hiện tại, hệ thống đang hoạt động ở chế độ **Public (AUTH=DISABLED)**. Các route xác thực JWT đề cập trong tài liệu cũ chưa được triển khai trong mã nguồn thực tế.

---

## 2. AI & Data Services

### Trích xuất dữ liệu từ Web
- **Endpoint:** `POST /api/ai/generate`
- **Mô tả:** Nhận prompt từ giao diện web, gọi Groq AI để phân loại và trích xuất dữ liệu, sau đó lưu vào Notion.
- **Payload:**
  ```json
  {
    "prompt": "Ăn sáng phở thìn 50k"
  }
  ```
- **Phản hồi thành công (200):**
  ```json
  {
    "success": true,
    "data": {
      "category": "chi tiêu",
      "title": "Ăn sáng phở thìn",
      "value": 50000,
      "date": "2024-05-20"
    }
  }
  ```

### Lấy lịch sử Logs
- **Endpoint:** `GET /api/logs`
- **Mô tả:** Lấy 20 bản ghi mới nhất từ Notion Database.
- **Phản hồi thành công (200):** Trả về mảng các object từ Notion API.

---

## 3. Webhooks (Đa kênh)

### Facebook Messenger Webhook
#### Xác thực (Verification)
- **Endpoint:** `GET /api/webhook/messenger`
- **Tham số query:** `hub.mode`, `hub.verify_token`, `hub.challenge`
- **Mô tả:** Dùng để xác thực webhook với Facebook Developers.
  
#### Xử lý tin nhắn (Message Processing)
- **Endpoint:** `POST /api/webhook/messenger`
- **Mô tả:** Tiếp nhận sự kiện tin nhắn từ Facebook, xử lý qua AI và lưu vào Notion, sau đó phản hồi cho người dùng qua Send API.

### Telegram Bot Webhook
- **Endpoint:** `POST /api/webhook/telegram`
- **Mô tả:** Tiếp nhận Update từ Telegram Bot. Xử lý tin nhắn văn bản, trích xuất dữ liệu AI, lưu vào Notion và gửi tin nhắn phản hồi cho người dùng.
- **Payload:** Cấu trúc chuẩn của Telegram Update Object.

---

## 4. Error Handling
Mọi lỗi phát sinh trong quá trình xử lý AI hoặc tích hợp dịch vụ đều được:
1. Log ra console hệ thống.
2. Tự động ghi vào Notion với `category: "error"` để hiển thị trên giao diện Web.
3. Trả về mã lỗi 400/500 tương ứng cho client.
