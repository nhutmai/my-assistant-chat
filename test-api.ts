
/**
 * Script kiểm thử API tự động
 * Cách chạy: npx tsx test-api.ts
 */

const BASE_URL = "http://127.0.0.1:3000/api";

async function runTests() {
  console.log("🚀 Bắt đầu kiểm thử API (Public Mode)...");

  // 1. Test Generate AI
  try {
    console.log("\n[1] Đang kiểm tra Gọi AI Service...");
    const aiRes = await fetch(`${BASE_URL}/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Ăn phở 50k" }),
    });

    const aiData = await aiRes.json();
    if (aiRes.ok && aiData.status === "success") {
      console.log("✅ Gọi AI thành công!");
      console.log("🤖 Phản hồi:", JSON.stringify(aiData.data, null, 2));
    } else {
      console.error("❌ Lỗi AI:", aiData.message || "Unknown error");
    }
  } catch (err) {
    console.error("❌ Lỗi khi gọi AI:", err);
  }

  // 2. Test Get Logs
  try {
    console.log("\n[2] Đang kiểm tra Lấy lịch sử Logs...");
    const logsRes = await fetch(`${BASE_URL}/logs`);
    const logsData = await logsRes.json();

    if (logsRes.ok && logsData.status === "success") {
      console.log("✅ Lấy logs thành công!");
      console.log(`📊 Số lượng bản ghi: ${logsData.data.length}`);
    } else {
      console.error("❌ Lỗi lấy logs:", logsData.message || "Unknown error");
    }
  } catch (err) {
    console.error("❌ Lỗi khi lấy logs:", err);
  }

  console.log("\n🏁 Hoàn tất kiểm thử.");
}

runTests();
