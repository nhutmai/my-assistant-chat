# Lộ trình thực hành CI/CD + Docker trên máy local

> Mục tiêu: nắm vững toàn bộ flow CI/CD ngay trên máy local trước khi đẩy lên GitHub Actions / VPS thật.

---

## Tổng quan flow

```
Local code
  → Dockerfile
  → docker compose
  → build image
  → run container
  → health check
  → giả lập CI local
  → giả lập deploy local
```

Sau khi làm tốt trên local, GitHub Actions chỉ là phiên bản tự động hoá của đúng những lệnh này.

---

## Bước 0 — Chuẩn bị project

Dùng project Next.js có sẵn, hoặc tạo mới:

```bash
npx create-next-app@latest cicd-local-demo
cd cicd-local-demo
npm install
npm run dev
```

Mở `http://localhost:3000`, kiểm tra chạy được, rồi dừng bằng `Ctrl + C`.

---

## Bước 1 — Tạo Dockerfile

> **Lưu ý:** Bản dưới đây dùng cách copy toàn bộ `node_modules` từ build stage. Nếu project bật `output: "standalone"` trong `next.config.js`, xem phần ghi chú cuối bước này để dùng Dockerfile nhỏ gọn hơn.

Tạo file `Dockerfile` ở thư mục gốc:

```dockerfile
# Stage 1: Cài dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build ứng dụng
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# Stage 3: Image production (chỉ giữ những gì cần để chạy)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Cài thêm curl để dùng cho health check
RUN apk add --no-cache curl

COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
# next.config.js cần thiết cho Next.js khi chạy production
COPY --from=build /app/next.config.js ./

EXPOSE 3000
CMD ["npm", "start"]
```

> **Ghi chú — `output: "standalone"`:** Nếu `next.config.js` có `output: "standalone"`, stage runner có thể thay bằng:
> ```dockerfile
> COPY --from=build /app/.next/standalone ./
> COPY --from=build /app/.next/static ./.next/static
> COPY --from=build /app/public ./public
> CMD ["node", "server.js"]
> ```
> Image này nhỏ hơn nhiều vì không cần copy `node_modules`.

---

## Bước 2 — Tạo `.dockerignore`

```
node_modules
.next
.git
.github
Dockerfile
docker-compose.yml
npm-debug.log
.env
.env.local
```

Mục đích: không copy những thứ không cần vào Docker image, giúp build nhanh hơn và image nhỏ hơn.

---

## Bước 3 — Kiểm tra `package.json`

Đảm bảo có đủ ba script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## Bước 4 — Build Docker image

```bash
docker build -t frontend-local:1.0 .
```

| Phần lệnh | Ý nghĩa |
|---|---|
| `docker build` | Tạo image từ Dockerfile |
| `-t frontend-local:1.0` | Đặt tên `frontend-local`, tag `1.0` |
| `.` | Build từ thư mục hiện tại |

Kiểm tra image vừa tạo:

```bash
docker images
```

---

## Bước 5 — Chạy container từ image

```bash
docker run -d \
  --name frontend-local-container \
  -p 3000:3000 \
  frontend-local:1.0
```

| Option | Ý nghĩa |
|---|---|
| `-d` | Chạy nền (detached) |
| `--name` | Đặt tên container |
| `-p 3000:3000` | Map port máy thật : port trong container |

Kiểm tra:

```bash
docker ps                              # xem container đang chạy
docker logs frontend-local-container   # xem log
```

Dọn dẹp:

```bash
docker stop frontend-local-container
docker rm frontend-local-container
```

---

## Bước 6 — Tạo `docker-compose.yml`

Thay vì gõ `docker run` dài dòng mỗi lần, dùng Docker Compose:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: frontend-local:1.0
    container_name: frontend-local-container
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

Lệnh thường dùng:

```bash
docker compose up -d --build   # build image và chạy
docker compose ps              # kiểm tra trạng thái
docker compose logs -f frontend  # xem log real-time
docker compose down            # dừng và xoá container
```

---

## Bước 7 — Thêm health check

> **Lý do dùng `curl` thay `wget`:** Image `node:20-alpine` không có `wget` mặc định. Ở Bước 1 đã cài `curl` vào image, nên health check dùng `curl` sẽ ổn định hơn.

Cập nhật `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: frontend-local:1.0
    container_name: frontend-local-container
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-sf", "http://localhost:3000"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

> `start_period: 30s` cho Next.js production đủ thời gian khởi động trước khi Docker bắt đầu đếm `retries`.

Chạy lại và kiểm tra trạng thái:

```bash
docker compose up -d --build
docker ps   # cột STATUS sẽ hiện "healthy" hoặc "starting"
```

---

## Bước 8 — Giả lập CI local

Tạo thư mục và file script:

```bash
mkdir scripts
touch scripts/ci-local.sh
chmod +x scripts/ci-local.sh
```

Nội dung `scripts/ci-local.sh`:

```bash
#!/bin/bash
set -e

echo "=== [CI] Step 1: Install dependencies ==="
npm ci

echo "=== [CI] Step 2: Lint ==="
npm run lint || echo "[WARN] No lint script or lint failed, continuing..."

echo "=== [CI] Step 3: Build app ==="
npm run build

echo "=== [CI] Step 4: Build Docker image ==="
docker build -t frontend-local:ci .

echo "=== [CI] Step 5: Run container for smoke test ==="
docker rm -f frontend-ci-test 2>/dev/null || true

docker run -d \
  --name frontend-ci-test \
  -p 3001:3000 \
  frontend-local:ci

echo "=== [CI] Step 6: Wait for container to start ==="
sleep 15   # chờ Next.js production khởi động

echo "=== [CI] Step 7: Health check ==="
PASSED=false
for i in 1 2 3 4 5; do
  if curl -sf http://localhost:3001 > /dev/null; then
    echo "[OK] Health check passed on attempt $i"
    PASSED=true
    break
  fi
  echo "[WAIT] Attempt $i failed, retrying in 5s..."
  sleep 5
done

docker rm -f frontend-ci-test

if [ "$PASSED" = true ]; then
  echo "=== [CI] PASSED ==="
  exit 0
else
  echo "=== [CI] FAILED ==="
  exit 1
fi
```

> **Điểm sửa so với bản gốc:**
> - Thêm `sleep 15` sau `docker run` để tránh health check chạy trước khi Next.js kịp lắng nghe.
> - Dùng biến `PASSED` để luôn `docker rm` container dù pass hay fail, tránh container thây ma.

Chạy:

```bash
./scripts/ci-local.sh
```

---

## Bước 9 — Giả lập deploy local

Tạo file `scripts/deploy-local.sh`:

```bash
#!/bin/bash
set -e

IMAGE_NAME=frontend-local
TAG=latest
CONTAINER_NAME=frontend-local-container
PORT=3000

echo "=== [DEPLOY] Step 1: Build new image ==="
docker build -t $IMAGE_NAME:$TAG .

echo "=== [DEPLOY] Step 2: Stop old container ==="
docker rm -f $CONTAINER_NAME 2>/dev/null || true

echo "=== [DEPLOY] Step 3: Start new container ==="
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  --restart unless-stopped \
  $IMAGE_NAME:$TAG

echo "=== [DEPLOY] Step 4: Wait for startup ==="
sleep 15

echo "=== [DEPLOY] Step 5: Health check ==="
for i in 1 2 3 4 5; do
  if curl -sf http://localhost:$PORT > /dev/null; then
    echo "[OK] Deploy successful on attempt $i"
    exit 0
  fi
  echo "[WAIT] Attempt $i failed, retrying in 5s..."
  sleep 5
done

echo "[FAIL] Health check failed after all retries"
docker logs $CONTAINER_NAME
exit 1
```

```bash
chmod +x scripts/deploy-local.sh
./scripts/deploy-local.sh
```

---

## Bước 10 — Thực hành versioning và rollback

```bash
# Build version 1
docker build -t frontend-local:v1 .
docker run -d --name frontend-v1 -p 3000:3000 frontend-local:v1
```

Sửa giao diện (đổi text trong `app/page.tsx`), rồi:

```bash
# Build version 2
docker build -t frontend-local:v2 .
docker rm -f frontend-v1
docker run -d --name frontend-v2 -p 3000:3000 frontend-local:v2
```

Nếu v2 lỗi → rollback:

```bash
docker rm -f frontend-v2
docker run -d --name frontend-v1 -p 3000:3000 frontend-local:v1
```

> Đây là lý do cần **giữ image cũ** (`v1`, `v2`, ...) thay vì chỉ dùng tag `latest`. Trên thực tế, người ta hay tag theo commit hash hoặc build number.

---

## Bước 11 — Thêm PostgreSQL vào Docker Compose

Dùng khi project có backend/database:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: frontend-local-container
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://appuser:secretpassword@postgres:5432/myapp
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    container_name: postgres-local
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

volumes:
  postgres_data:
```

> **Quan trọng:** Trong Docker Compose, các service gọi nhau bằng **tên service**, không phải `localhost`.
> Connection string phải dùng `@postgres:5432`, không phải `@localhost:5432`.

---

## Bước 12 — 5 bài tập thực hành

### Bài 1: Build và chạy bằng Docker thuần

```bash
docker build -t frontend-local:1.0 .
docker run -d --name frontend-local -p 3000:3000 frontend-local:1.0
docker logs frontend-local
```

✅ Đạt: truy cập `http://localhost:3000` thành công.

---

### Bài 2: Chạy bằng Docker Compose

```bash
docker compose up -d --build
docker compose ps
```

✅ Đạt: cột `STATUS` hiện `healthy`, truy cập `http://localhost:3000` thành công.

---

### Bài 3: Viết và chạy CI local

```bash
./scripts/ci-local.sh
```

✅ Đạt: script chạy qua đủ các bước, exit 0 khi health check pass; exit 1 nếu build hoặc health check lỗi.

---

### Bài 4: Viết và chạy deploy local

```bash
./scripts/deploy-local.sh
```

✅ Đạt: build image mới, restart container, health check thành công.

---

### Bài 5: Rollback thủ công

1. Build `frontend-local:v1` → run → truy cập OK.
2. Sửa UI → build `frontend-local:v2` → run.
3. Giả lập v2 lỗi (ví dụ `docker stop frontend-v2`).
4. Rollback: run lại `frontend-local:v1`.

✅ Đạt: site chạy lại từ v1 sau khi v2 bị dừng.

---

## Checklist tự kiểm tra

Sau khi thực hành xong, tự trả lời được các câu hỏi sau:

- [ ] `docker build` làm gì?
- [ ] `docker run` khác `docker compose up` như thế nào?
- [ ] Image khác Container ở điểm gì?
- [ ] Volume dùng để làm gì?
- [ ] `-p 3000:3000` nghĩa là gì?
- [ ] `COPY` trong Dockerfile copy từ đâu vào đâu?
- [ ] `CMD` chạy ở bước nào trong vòng đời container?
- [ ] Build ARG khác Environment variable như thế nào?
- [ ] Health check dùng để làm gì? Tại sao cần `start_period`?
- [ ] Rollback bằng image tag hoạt động ra sao?

---

## Liên hệ với GitHub Actions thực tế

Sau khi làm local tốt, GitHub Actions chỉ thay bạn chạy những lệnh này tự động:

```
npm ci
npm run build
docker build -t <registry>/<image>:<tag> .
docker push <registry>/<image>:<tag>
ssh vào VPS
  └─ docker compose pull
  └─ docker compose up -d
  └─ health check
```

> **Local script của bạn = GitHub Actions phiên bản thủ công.**
> Hiểu local script → đọc GitHub Actions YAML sẽ rất dễ dàng.
