
/**
 * Script kiểm thử API tự động
 * Cách chạy: npx tsx test-api.ts
 */

const BASE_URL = "http://0.0.0.0:3000/api";

async function runTests() {
  console.log("🚀 Bắt đầu kiểm thử API...");

  let cookie = "";

  // 1. Test Login
  try {
    console.log("\n[1] Đang kiểm tra Đăng nhập...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "password123" }),
    });

    const loginData = await loginRes.json();
    if (loginRes.ok) {
      console.log("✅ Đăng nhập thành công!");
      // Lấy cookie từ header Set-Cookie
      cookie = loginRes.headers.get("set-cookie") || "";
    } else {
      console.error("❌ Đăng nhập thất bại:", loginData.message);
      return;
    }
  } catch (err) {
    console.error("❌ Lỗi kết nối server (Hãy đảm bảo server đang chạy):", err);
    return;
  }

  // 2. Test Generate AI (Có Auth)
  try {
    console.log("\n[2] Đang kiểm tra Gọi Gemini API (Có Authentication)...");
    const aiRes = await fetch(`${BASE_URL}/ai/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": cookie 
      },
      body: JSON.stringify({ prompt: "Chào bạn, hãy giới thiệu ngắn gọn về Node.js" }),
    });

    const aiData = await aiRes.json();
    if (aiRes.ok) {
      console.log("✅ Gọi AI thành công!");
      console.log("🤖 Phản hồi:", aiData.data.substring(0, 100) + "...");
    } else {
      console.error("❌ Lỗi AI:", aiData.message);
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi AI:", err);
  }

  // 3. Test Unauthorized (Không Auth)
  try {
    console.log("\n[3] Kiểm tra bảo mật (Gọi API không có Cookie)...");
    const failRes = await fetch(`${BASE_URL}/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hack me" }),
    });

    if (failRes.status === 401) {
      console.log("✅ Bảo mật hoạt động tốt! (Trả về 401 Unauthorized)");
    } else {
      console.error("❌ Lỗ hổng bảo mật! Server không chặn yêu cầu không có auth.");
    }
  } catch (err) {
    console.error("❌ Lỗi kiểm tra bảo mật:", err);
  }

  console.log("\n🏁 Hoàn tất kiểm thử.");
}

runTests();
