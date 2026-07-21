# Gemini Bridge — Product Roadmap

> Cập nhật: 2026-05-22 | Trạng thái: MVP đã hoàn thiện, chuẩn bị hardening & scale

---

## 1. Đánh giá hiện trạng

### Module đã hoàn thiện

| Module | File | Trạng thái |
|--------|------|-----------|
| AI Generation (Groq) | `src/server/services/ai.service.ts` | ✅ Hoàn thiện |
| Notion Logging | `src/server/services/notion.service.ts` | ✅ Hoàn thiện |
| PostgreSQL Persistence | `src/server/services/postgres.service.ts` | ✅ Hoàn thiện (opt-in) |
| Telegram Webhook | `src/server/services/telegram.service.ts` | ✅ Hoàn thiện |
| Messenger Webhook | `src/server/services/messenger.service.ts` | ✅ Hoàn thiện |
| Frontend (React 19) | `src/App.tsx` | ✅ Hoàn thiện |
| Dark Mode | `src/index.css`, `src/App.tsx` | ✅ Hoàn thiện |
| Axios Client | `src/lib/api.ts` | ✅ Hoàn thiện |
| CI/CD Pipeline | `.github/workflows/ci.yml` | ✅ Hoàn thiện |
| Docker / Vercel deploy | `Dockerfile`, `vercel.json` | ✅ Hoàn thiện |
| Input Validation (Zod) | `src/server/schemas/`, `middlewares/validate.ts` | ✅ Hoàn thiện |
| Rate Limiting | `src/server/middlewares/rateLimiter.ts` | ✅ Hoàn thiện |
| JWT Authentication | `src/server/middlewares/authMiddleware.ts`, `controllers/auth.controller.ts` | ✅ Hoàn thiện |
| Identity & Votes | `controllers/identity-votes.controller.ts`, `services/identity-votes.service.ts` | ✅ Hoàn thiện |

### Phần còn dang dở / thiếu

| Vấn đề | Vị trí | Ghi chú |
|--------|--------|---------|
| Structured logging | Toàn bộ services | Chỉ dùng `console.log/error`, không có log aggregation |
| Unit tests | Không có | Chỉ có `test-api.ts` manual |
| CORS config | `src/server/index.ts` | Không thấy cấu hình explicit |
| Request tracing | Toàn bộ | Không có correlation ID giữa các service |
| Monitoring / APM | Không có | Không có uptime tracking, alerting |

### Technical debt đáng chú ý

1. **Dual persistence chưa đồng bộ**: PostgreSQL và Notion lưu song song nhưng không có fallback hay reconciliation nếu một bên fail.
2. **AI prompt không có schema validation**: Controller nhận `prompt` bất kỳ, không sanitize hay giới hạn độ dài.
3. **Error message leak**: `res.status(500).json({ error: err.message })` có thể lộ internal details.
4. **PostgreSQL mặc định tắt**: Logic business quan trọng (lưu log) phụ thuộc vào biến môi trường tùy chọn — dễ bị bỏ sót khi deploy.
5. **Notion Latency**: Query từ Notion chậm (>1s), ảnh hưởng trải nghiệm khi volume tăng.
6. **Serverless Timeout**: Vercel Functions có giới hạn 10-60s — AI generation có thể vượt mức này.

---

## 2. Roadmap tính năng tiếp theo

> Ưu tiên: **Impact cao + Effort thấp** trước. Tính năng bảo mật & ổn định ưu tiên trên tính năng mới.

| # | Tính năng | Mô tả ngắn | Module liên quan | Độ phức tạp | Ưu tiên |
|---|-----------|-----------|-----------------|-------------|---------|
| 1 | **Input Validation Middleware** | Validate schema các request với Zod trước khi vào controller | `middlewares/validate.ts`, routes | S | ✅ Xong |
| 2 | **Structured Logging** | Thay `console.log` bằng `pino` — log JSON có level, timestamp, request ID | `services/`, `middlewares/logger.ts` | S | P1 |
| 3 | **Rate Limiting** | Giới hạn request/IP cho `/api/ai/generate` và webhook endpoints | `middlewares/rateLimit.ts`, routes | S | ✅ Xong |
| 4 | **CORS Configuration** | Explicit allowlist origin cho production | `src/server/index.ts` | S | P1 |
| 5 | **Error Sanitization** | Không trả `err.message` raw, dùng error code thống nhất | `controllers/`, `server/index.ts` | S | P2 |
| 6 | **Webhook Signature Verification** | Verify HMAC signature cho Telegram và Messenger webhook | `middlewares/webhookAuth.ts` | M | P2 |
| 7 | **JWT Authentication** | Bật auth middleware (infrastructure đã có), bảo vệ `/api/ai/generate` và `/api/logs` | `middlewares/auth.ts`, routes | M | ✅ Xong |
| 8 | **Retry Logic** | Exponential backoff cho Groq và Notion API calls | `ai.service.ts`, `notion.service.ts` | S | P2 |
| 9 | **Unit Test Suite** | Test các service (ai, notion, telegram) với mock | `src/server/services/*.test.ts` | M | P2 |
| 10 | **Health Check Endpoint** | `GET /health` trả về trạng thái các service (Notion, Postgres, Groq) | `routes/index.ts`, controllers | S | P3 |
| 11 | **Log Pagination** | Thay limit cứng 20 bằng cursor-based pagination | `log.controller.ts`, `notion.service.ts` | M | P3 |
| 12 | **Real-time Log Streaming** | SSE để push log mới về frontend không cần polling | `services/stream.service.ts`, `App.tsx` | M | P3 |
| 13 | **Notion Dashboard Link** | Deep-link từ log entry trên UI về Notion page tương ứng | `App.tsx`, `notion.service.ts` | S | P3 |
| 14 | **Cost Tracking** | Log số token tiêu thụ mỗi request vào Notion | `ai.service.ts` | S | P3 |
| 15 | **Multi-language AI Response** | Tự động detect ngôn ngữ user và trả lời đúng ngôn ngữ | `ai.service.ts` | S | P3 |
| 16 | **Async Webhook Processing** | Nhận request → trả 200 ngay → xử lý background → reply sau (tránh timeout Vercel) | `webhook.controller.ts` | M | P3 |
| 17 | **Category Analytics UI** | Chart thống kê chi tiêu theo category trên frontend | `App.tsx`, new component | L | P4 |
| 18 | **Multi-model Fallback** | Tự động chuyển sang Gemini nếu Groq bị lỗi | `ai.service.ts`, `.env` | M | P4 |
| 19 | **Session / Context Management** | Lưu lịch sử hội thoại theo `senderId` làm context cho AI | `services/session.service.ts` (mới) | L | P4 |

---

## 3. Dependencies & Rủi ro

### Dependency map

```
P1: Input Validation ──────► P2: JWT Auth        (validation cần có trước để auth middleware compose được)
P1: Structured Logging ─────► P2: Unit Tests      (cần logger mock trong tests)
P1: Rate Limiting ──────────► P2: Webhook Sig.    (bảo vệ webhook layer by layer)
P2: JWT Auth ───────────────► P4: Analytics UI    (UI cần biết user để filter data)
P3: Log Pagination ─────────► P3: SSE Streaming   (pagination + streaming cần consistent cursor)
P2: Retry Logic ────────────► P3: Async Webhook   (retry + async xử lý Vercel timeout)
```

### Rủi ro kỹ thuật cần giải quyết trước

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Dual persistence inconsistency | Cao | Thêm `Promise.allSettled` log chi tiết; cân nhắc event queue nhẹ (Bull/BullMQ) |
| Groq API downtime không được xử lý | Cao | Thêm retry logic với exponential backoff trong `ai.service.ts` |
| Serverless Timeout (Vercel 10-60s) | Cao | Async webhook: nhận → 200 ngay → xử lý background → reply sau |
| Notion rate limit (3 req/s) | Trung bình | Queue request hoặc batch write khi volume tăng |
| Auth disabled trong production | Trung bình | Bật JWT trước khi expose API ra ngoài internet |
| No structured log → khó debug production | Trung bình | Migrate sang `pino` ngay, trước khi codebase lớn hơn |
| Error message leak internal details | Trung bình | Sanitize tất cả error response, chỉ trả error code |

---

## 4. Breakdown triển khai tính năng #1: Input Validation Middleware

> **Mục tiêu**: Thêm Zod validation cho tất cả request body trước khi vào controller, trả lỗi 400 rõ ràng.
> **Ước tính**: ~30 phút | **Dependency**: Không có

### Chuẩn bị

- [ ] Chạy `npm install zod`
- [ ] Chạy `npm run lint` để xác nhận baseline sạch

### Tạo file mới

- [ ] `src/server/schemas/ai.schema.ts` — schema cho `POST /api/ai/generate`:
  ```ts
  export const aiGenerateSchema = z.object({
    prompt: z.string().min(1).max(2000)
  });
  ```
- [ ] `src/server/schemas/webhook.schema.ts` — schema cơ bản cho Telegram Update và Messenger Event
- [ ] `src/server/middlewares/validate.ts` — factory function:
  ```ts
  export const validateBody = (schema: ZodSchema) => (req, res, next) => { ... }
  ```

### Chỉnh sửa file hiện có

- [ ] `src/server/routes/index.ts` — thêm `validateBody(aiGenerateSchema)` vào `POST /api/ai/generate`
- [ ] `src/server/routes/index.ts` — thêm validation cho `POST /api/webhook/telegram` và `POST /api/webhook/messenger`
- [ ] `src/server/controllers/ai.controller.ts` — xóa manual type check nếu có, trust middleware đã validate
- [ ] `API_DOCUMENTATION.md` — cập nhật error response 400 với format `{ error: "Validation failed", details: [...] }`

### Kiểm tra

- [ ] Test payload hợp lệ → 201 như cũ
- [ ] Test `prompt` rỗng → 400 với `details`
- [ ] Test `prompt` quá dài (>2000 chars) → 400
- [ ] Test webhook với body sai format → 400, không crash server
- [ ] Chạy `npm run lint` để đảm bảo type-safe

---

**Bước tiếp theo ngay bây giờ**: Cài `zod`, tạo `src/server/middlewares/validate.ts` và `src/server/schemas/ai.schema.ts`, sau đó wire vào route `/api/ai/generate` — đây là tính năng impact cao nhất với effort thấp nhất, ngay lập tức tăng độ ổn định và bảo mật cho toàn bộ API layer.
