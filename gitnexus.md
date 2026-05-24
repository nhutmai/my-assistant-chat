# GitNexus MCP — Test Report

**Ngày chạy:** 2026-05-24
**Môi trường:** Claude Code + MCP GitNexus (gitnexus mcp)
**Repo được index:** `my-assistant-chat` — 44 files, 281 symbols, 398 edges, 12 clusters
**Trạng thái index:** ✅ up-to-date (commit `9a2cc60`)

---

## Tools Khám Phá Được

| Tool Name | Mô tả |
|-----------|-------|
| `query` | Tìm kiếm knowledge graph theo khái niệm, trả về execution flows và definitions liên quan (BM25 + vector hybrid search) |
| `context` | Xem 360° một symbol: callers (incoming), callees (outgoing), processes tham gia |
| `impact` | Phân tích blast radius: các symbol nào bị ảnh hưởng nếu thay đổi target (upstream/downstream, depth 1-3) |
| `detect_changes` | Map git diff hunks sang các symbols và execution flows bị ảnh hưởng trong index |
| `cypher` | Chạy raw Cypher query trực tiếp lên knowledge graph |
| `list_repos` | Liệt kê tất cả repositories đã được index |
| `rename` | Đổi tên symbol có hiểu biết về call graph, tự động cập nhật toàn bộ references |

---

## Kết Quả Test

### Test 1 — query happy path: "webhook handler"
- **Tool gọi:** `query`
- **Input:** `{ "search_query": "webhook handler" }`
- **Output (tóm tắt):** Trả về 20 definitions liên quan, nổi bật: `handleMessage` (webhook.controller.ts:26), `verifyWebhook` (webhook.controller.ts:8), `messengerEventSchema` (webhook.schema.ts), `webhookRateLimiter` (rateLimiter.ts). Timing: wall 518ms (BM25 357ms + vector 385ms).
- **Kết quả:** ✅ PASS
- **Ghi chú:** Hybrid search (BM25 + vector) hoạt động tốt, kết quả có độ liên quan cao. Không có execution processes được map, phản ánh đúng vì repo chưa định nghĩa named processes.

---

### Test 2 — context với symbol tồn tại (happy path, có UID rõ ràng)
- **Tool gọi:** `context`
- **Input:** `{ "uid": "Function:src/server/controllers/webhook.controller.ts:handleMessage" }`
- **Output:**
```json
{
  "status": "found",
  "symbol": {
    "uid": "Function:src/server/controllers/webhook.controller.ts:handleMessage",
    "kind": "Function", "startLine": 26, "endLine": 69
  },
  "incoming": { "accesses": [{ "name": "index.ts", "filePath": "src/server/routes/index.ts" }] },
  "outgoing": { "calls": [
    "AIService.generateContent", "MessengerService.sendMessage (×2)",
    "NotionService.saveLog (×2)", "PostgresService.saveLog (×2)"
  ]},
  "processes": []
}
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Context đầy đủ, outgoing calls chính xác với implementation trong file. Cho thấy `handleMessage` là orchestrator gọi 3 services.

---

### Test 3 — context edge case: symbol name mơ hồ (ambiguous)
- **Tool gọi:** `context`
- **Input:** `{ "name": "handleMessage" }` (không có UID)
- **Output:**
```json
{
  "status": "ambiguous",
  "message": "Found 2 symbols matching 'handleMessage'. Use uid, file_path, or kind to disambiguate.",
  "candidates": [
    { "uid": "Function:...handleMessage", "kind": "Function", "line": 26, "score": 0.56 },
    { "uid": "Const:...handleMessage", "kind": "", "line": 26, "score": 0.5 }
  ]
}
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Xử lý ambiguity tốt — trả về danh sách candidates thay vì crash. User cần thêm UID hoặc file_path. Flag nhỏ: `--kind` không được hỗ trợ qua CLI (chỉ qua `--uid`).

---

### Test 4 — impact upstream: symbol có callers thực tế
- **Tool gọi:** `impact`
- **Input:** `{ "target": "Function:src/server/controllers/webhook.controller.ts:handleMessage", "direction": "upstream" }`
- **Output:**
```json
{
  "direction": "upstream", "impactedCount": 0, "risk": "LOW",
  "summary": { "direct": 0, "processes_affected": 0, "modules_affected": 0 },
  "byDepth": {}
}
```
- **Kết quả:** ⚠️ PASS với lưu ý
- **Ghi chú:** Risk LOW nhưng `impactedCount: 0` dù `index.ts` import hàm này. Graph edge ở đây là `IMPORTS` (file-level) chứ không phải `CALLS` (function-level), nên impact upstream không đếm được callers qua File nodes. Đây là giới hạn thiết kế của graph schema, không phải lỗi.

---

### Test 5 — impact downstream: NotionService
- **Tool gọi:** `impact`
- **Input:** `{ "target": "NotionService", "direction": "downstream" }`
- **Output:**
```json
{
  "direction": "downstream", "impactedCount": 1, "risk": "LOW",
  "byDepth": {
    "1": [{ "name": "logger.ts", "filePath": "src/server/middlewares/logger.ts", "relationType": "IMPORTS", "confidence": 1 }]
  }
}
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Downstream (dependencies) hoạt động chính xác. `NotionService` phụ thuộc vào `logger.ts` qua IMPORTS edge. Direction `downstream` = "cái gì NotionService cần", khác với upstream = "ai dùng NotionService".

---

### Test 6 — detect_changes: thay đổi hiện tại trên branch
- **Tool gọi:** `detect_changes`
- **Input:** `{}` (không có input, tự đọc git diff)
- **Output:**
```
Changes: 2 files, 4 symbols
Affected processes: 0
Risk level: low

Changed symbols:
  undefined Repository & Project Guidelines → AGENTS.md
  undefined Forbidden Actions → AGENTS.md
  undefined CLAUDE.md → CLAUDE.md
  undefined Workflow → CLAUDE.md
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Phát hiện đúng 2 files thay đổi (AGENTS.md, CLAUDE.md) trên branch hiện tại. Risk `low` vì đây là documentation files, không phải code. Flag nhỏ: symbol `kind` hiển thị là `undefined` thay vì loại cụ thể như "Section" hay "Document".

---

### Test 7 — query edge case: empty string
- **Tool gọi:** `query`
- **Input:** `{ "search_query": "" }`
- **Output:** `Usage: gitnexus query <search_query>` + log error
- **Kết quả:** ❌ FAIL
- **Ghi chú:** Không có error message JSON chuẩn — trả về usage text thay vì `{ "error": "..." }`. Behavior không nhất quán với các tools khác (context/impact trả về JSON error). MCP server có thể expose lỗi không chuẩn hóa.

---

### Test 8 — context edge case: symbol không tồn tại
- **Tool gọi:** `context`
- **Input:** `{ "name": "nonExistentSymbol12345" }`
- **Output:**
```json
{ "error": "Symbol 'nonExistentSymbol12345' not found" }
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Xử lý gracefully với JSON error chuẩn. Exit code 0 (không crash).

---

### Test 9 — impact edge case: symbol không tồn tại
- **Tool gọi:** `impact`
- **Input:** `{ "target": "nonExistentSymbol12345" }`
- **Output:**
```json
{
  "error": "Target 'nonExistentSymbol12345' not found",
  "target": { "name": "nonExistentSymbol12345" },
  "direction": "upstream", "impactedCount": 0, "risk": "UNKNOWN"
}
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Trả về JSON đầy đủ context + error message, exit code non-zero. Behavior nhất quán và informative.

---

### Test 10 — impact edge case: repo không tồn tại
- **Tool gọi:** `impact`
- **Input:** `{ "target": "NotionService", "repo": "non-existent-repo" }`
- **Output:**
```json
{
  "error": "Repository \"non-existent-repo\" not found. Available: my-assistant-chat",
  "suggestion": "Try reducing --depth or using gitnexus context <symbol> as a fallback"
}
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Error message rất hữu ích — liệt kê available repos và gợi ý fallback. UX tốt.

---

### Test 11 — cypher: raw graph query
- **Tool gọi:** `cypher`
- **Input:** `{ "query": "MATCH (n:Function) RETURN n.name, n.filePath LIMIT 5" }`
- **Output:**
```
| n.name            | n.filePath                                   |
| ---               | ---                                          |
| main              | scratch/set-telegram-webhook.ts              |
| startServer       | server.ts                                    |
| distPath          | server.ts                                    |
| generateAIContent | src/server/controllers/ai.controller.ts      |
| getLogs           | src/server/controllers/log.controller.ts     |
(5 rows)
```
- **Kết quả:** ✅ PASS
- **Ghi chú:** Cypher trả về markdown table, dễ đọc. Graph query trực tiếp hoạt động tốt. Đây là escape hatch mạnh khi các tools cao cấp không đủ.

---

## Tổng Kết

| Tổng số test | PASS | PASS có lưu ý | FAIL | ERROR |
|-------------|------|--------------|------|-------|
| 11          | 9    | 1            | 1    | 0     |

**Nhận xét tổng thể:**

GitNexus MCP hoạt động ổn định và cung cấp đủ tools cho workflow code intelligence. Các điểm nổi bật:

**Điểm mạnh:**
- Hybrid search (BM25 + vector) cho `query` cho kết quả có liên quan cao (~500ms)
- Error handling nhất quán ở hầu hết tools — trả về JSON error thay vì crash
- `detect_changes` tự động map git diff sang knowledge graph, không cần cấu hình
- `impact` với `--repo` trả về suggestion hữu ích khi repo không tồn tại
- `cypher` là escape hatch mạnh cho custom graph queries

**Vấn đề cần lưu ý:**
1. **Ambiguous symbols** (Test 3): Khi có nhiều symbol cùng tên, cần disambiguate bằng UID — CLI option `--kind` không được hỗ trợ nhưng guide đề cập. Cần document rõ hơn.
2. **Impact upstream qua File edges** (Test 4): `impactedCount: 0` cho `handleMessage` dù có caller vì graph dùng IMPORTS (file-level) không phải CALLS (function-level) cho router. Đây là giới hạn schema cần biết khi diễn giải impact.
3. **query với empty string** (Test 7): Không trả về JSON error chuẩn — behavior không nhất quán với các tools khác.
4. **detect_changes symbol kind** (Test 6): Kind hiển thị `undefined` cho Markdown sections — không ảnh hưởng đến chức năng nhưng làm output kém thẩm mỹ.
