# Gemini Bridge: Phased Development Roadmap

**Version:** 1.0.0  
**Status:** In Progress  
**Architect:** Gemini CLI (Senior Backend Architect)

---

## 📝 Tóm tắt trạng thái dự án (Project Status Summary)
Gemini Bridge hiện là một middleware hoạt động ổn định ở mức **MVP (Minimum Viable Product)**. 
- ✅ **Đã xong**: Tích hợp Groq AI, Notion SDK, Telegram Bot, và Messenger Webhook. Pipeline cơ bản (Message -> AI Extraction -> Notion Logging -> Response) đã hoạt động.
- ⚠️ **Chưa bắt đầu**: Xác thực (Auth), Xử lý ngữ cảnh (Conversation Context), Bảo mật Webhook, và Giám sát chi phí.
- 🔴 **Rủi ro**: Độ trễ từ Notion API ảnh hưởng đến trải nghiệm người dùng; Thiếu lớp Validation cho dữ liệu đầu vào.

---

## 🛠 Lộ trình Phát triển

### Giai đoạn 1 — Cơ sở hạ tầng cốt lõi (Core Infrastructure)
**Mục tiêu:** Chuẩn hóa pipeline dữ liệu và đảm bảo tính nhất quán giữa các nền tảng.

- [x] ✅ `setup-base-proxy` — Cấu trúc Express server và định tuyến cơ bản.
- [x] ✅ `ai-integration` — Tích hợp Groq SDK cho việc xử lý LLM.
- [ ] `message-normalization` — Xây dựng lớp Middleware chuẩn hóa format tin nhắn từ các platform.
    - *Tại sao:* Giúp logic nghiệp vụ không bị phụ thuộc vào API riêng biệt của Telegram/Messenger.
    - **Tệp ảnh hưởng:** `src/server/services/message.normalizer.ts` (mới), `src/server/controllers/webhook.controller.ts`.
- [ ] `request-validation` — ⚠️ Triển khai Zod validation cho mọi incoming webhook request.
    - **Tệp ảnh hưởng:** `src/server/controllers/webhook.controller.ts`.

**Tiêu chí hoàn thành:** Mọi tin nhắn từ mọi nền tảng đều đi qua một logic xử lý AI chung duy nhất.

---

### Giai đoạn 2 — Độ tin cậy & Tính chính xác (Reliability & Correctness)
**Mục tiêu:** Bảo mật endpoint và tăng khả năng chịu lỗi của hệ thống.

- [ ] `webhook-security` — ⚠️ Xác thực chữ ký `X-Hub-Signature` (Messenger) và `Secret Token` (Telegram).
    - **Tệp ảnh hưởng:** `src/server/controllers/webhook.controller.ts`.
- [ ] `retry-logic` — 🔴 Triển khai Exponential Backoff cho các cuộc gọi đến Notion/AI.
    - **Tệp ảnh hưởng:** `src/server/services/notion.service.ts`, `src/server/services/ai.service.ts`.
- [ ] `error-boundary` — Xây dựng Global Error Handler trả về mã lỗi HTTP chuẩn và thông báo thân thiện.
    - **Tệp ảnh hưởng:** `src/server/index.ts` (middleware).

**Tiêu chí hoàn thành:** Hệ thống từ chối 100% request giả mạo và tự phục hồi sau các lỗi mạng tạm thời.

---

### Giai đoạn 3 — Lưu trữ & Lịch sử (Storage & History)
**Mục tiêu:** Hỗ trợ hội thoại đa bước (Multi-turn conversation).

- [ ] `context-retrieval` — ⚠️ Truy vấn lịch sử từ Notion để làm ngữ cảnh (prompt context) cho AI.
    - **Tệp ảnh hưởng:** `src/server/services/ai.service.ts`, `src/server/services/notion.service.ts`.
- [ ] `session-management` — Quản lý trạng thái hội thoại theo `senderId`.
    - **Tệp ảnh hưởng:** `src/server/services/session.service.ts` (mới).
- [ ] `notion-optimization` — Thiết kế lại database schema trong Notion để tối ưu hóa việc query theo User.

**Tiêu chí hoàn thành:** AI có thể trả lời dựa trên thông tin người dùng đã gửi trong quá khứ.

---

### Giai đoạn 4 — Khả năng giám sát & Vận hành (Observability)
**Mục tiêu:** Quản trị chi phí và hiệu năng.

- [ ] `cost-tracking` — ⚠️ Log số lượng token tiêu thụ của từng request vào Notion.
    - **Tệp ảnh hưởng:** `src/server/services/ai.service.ts`.
- [ ] `structured-logging` — Tích hợp Winston/Pino để quản lý log tập trung trên Vercel.
- [ ] `rate-limiting` — Giới hạn số lượng request trên mỗi người dùng (API Throttling).

**Tiêu chí hoàn thành:** Có báo cáo chi tiết về lượng token và chi phí API theo từng ngày/người dùng.

---

### Giai đoạn 5 — Mở rộng quy mô & Tiện ích (Scale & Extension)
**Mục tiêu:** Tối ưu hóa trải nghiệm người dùng và tính sẵn sàng cao.

- [ ] `streaming-response` — ⚠️ Hỗ trợ trả về kết quả dạng stream (SSE) cho Frontend.
    - **Tệp ảnh hưởng:** `src/server/controllers/ai.controller.ts`.
- [ ] `multi-model-fallback` — Cơ chế tự động chuyển sang Gemini nếu Groq bị lỗi.
- [ ] `auth-system` — Kích hoạt JWT Authentication cho các route quản trị dashboard.
    - **Tệp ảnh hưởng:** `src/server/routes/index.ts`.

**Tiêu chí hoàn thành:** Hệ thống hỗ trợ đa Model và bảo mật tuyệt đối cho Dashboard.

---

## 🔴 Rủi ro kiến trúc & Giải pháp
1. **Notion Latency**: Query lịch sử từ Notion rất chậm (>1s). 
   *Giải pháp:* Cân nhắc dùng Redis làm Cache layer cho 5-10 tin nhắn gần nhất.
2. **Serverless Timeout**: Vercel Functions có giới hạn thời gian (10s-60s). AI generation đôi khi vượt mức này.
   *Giải pháp:* Dùng cơ chế Webhook Async (nhận request -> trả 200 ngay -> xử lý background -> gửi tin nhắn lại sau).
