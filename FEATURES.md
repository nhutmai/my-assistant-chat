# Tổng hợp tính năng ứng dụng (Gemini Bridge v2.1.0)

Ứng dụng hiện tại là một hệ thống tích hợp AI để trích xuất dữ liệu từ ngôn ngữ tự nhiên và lưu trữ vào Notion. Dưới đây là các tính năng chính:

## 1. Xử lý AI (Groq Engine)
- **Model:** Sử dụng mô hình `llama-3.3-70b-versatile` thông qua Groq API (Base URL: `https://api.groq.com/openai/v1`).
- **Trích xuất dữ liệu có cấu trúc:**
    - Phân loại nội dung người dùng nhập vào thành 2 loại: `chi tiêu` hoặc `ghi chú`.
    - Tự động trích xuất các thông tin: `title` (tiêu đề), `value` (giá trị số), và `date` (ngày tháng).
- **Phản hồi chuẩn JSON:** Hệ thống luôn yêu cầu AI trả về kết quả định dạng JSON để dễ dàng xử lý phía backend.

## 2. Lưu trữ và Quản lý Logs (Notion Integration)
- **Tự động lưu trữ:** Mỗi khi người dùng gửi prompt và AI xử lý thành công, dữ liệu sẽ được tự động lưu vào một Database trên Notion.
- **Ánh xạ thuộc tính (Properties Mapping):**
    - `Prompt`: Nội dung gốc người dùng nhập.
    - `Category`: Loại (chi tiêu/ghi chú).
    - `Title`: Tiêu đề trích xuất.
    - `Value`: Số tiền hoặc giá trị (nếu có).
    - `Date`: Ngày phát sinh dữ liệu.
- **Truy vấn Logs:** Backend hỗ trợ lấy 20 bản ghi mới nhất từ Notion Database để hiển thị trên giao diện.

## 3. Giao diện người dùng (Frontend - React)
- **Thiết kế Hiện đại:** Sử dụng Tailwind CSS với theme tối (Dark mode), hiệu ứng mượt mà từ `framer-motion`.
- **Chế độ Console (Bảng điều khiển):**
    - Cho phép nhập prompt tự do.
    - Hiển thị kết quả xử lý của AI dưới dạng mã JSON trực quan.
    - Trạng thái loading và thông báo lỗi chi tiết.
- **Chế độ Logs (Lịch sử):**
    - Hiển thị danh sách các yêu cầu đã xử lý được lấy trực tiếp từ Notion.
    - Hỗ trợ làm mới (Refresh) dữ liệu thủ công.
    - Hiển thị ID bản ghi, thời gian tạo và nội dung đã trích xuất.

## 4. Kiến trúc Kỹ thuật (Backend - Express)
- **Ngôn ngữ:** TypeScript.
- **API Endpoints:**
    - `POST /api/ai/generate`: Nhận prompt, gọi AI và lưu vào Notion.
    - `GET /api/logs`: Lấy danh sách lịch sử từ Notion.
- **Bảo mật (Lưu ý):** Mặc dù tài liệu `API_DOCUMENTATION.md` có đề cập đến xác thực JWT, nhưng trong mã nguồn hiện tại (`src/server/routes/index.ts`), các route đang được để công khai (Public) và tính năng AUTH hiển thị là `DISABLED` trên giao diện.
- **Bảo mật & Cấu hình:** Sử dụng biến môi trường (`.env`) để quản lý API Keys.

## 5. Yêu cầu Hệ thống (Environment Variables)
Để ứng dụng hoạt động đầy đủ, cần cấu hình các biến sau:
- `GROQ_API_KEY`: Key truy cập Groq AI.
- `NOTION_API_KEY`: Token tích hợp Notion.
- `NOTION_DATABASE_ID`: ID của database trong Notion.
