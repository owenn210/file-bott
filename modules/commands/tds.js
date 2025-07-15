const axios = require("axios");
const fs = require("fs");

let tokens = [];
let running = false;
let checkInterval = null;

exports.config = {
    name: "tds",
    version: "1.0",
    hasPermission: 0,
    credits: "VLjnh",
    description: "Quản lý token Trao Đổi Sub",
    commandCategory: "Tiện Ích",
    usages: ["/add [token]", "/del [token]", "/list", "/check [time]", "/stop"],
    cooldowns: 5
};

// Đọc danh sách token từ file (nếu có)
const filePath = "./data/tds_tokens.json";
if (fs.existsSync(filePath)) {
    tokens = JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Lưu danh sách token vào file
function saveTokens() {
    fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2));
}

// Lấy thông tin tài khoản từ API Trao Đổi Sub
async function getTdsInfo(token) {
    try {
        const res = await axios.get(`https://traodoisub.com/api/?fields=profile&access_token=${token}`);
        if (res.data.success === 200) {
            return {
                user: res.data.data.user || "Không có username",
                xu: res.data.data.xu || "0",
                xudie: res.data.data.xudie || "0"
            };
        }
    } catch (err) {
        console.error("Lỗi API Trao Đổi Sub:", err);
    }
    return null;
}

// Lệnh chính
exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const send = (msg) => api.sendMessage(msg, threadID, messageID);

    const command = args[0];
    const param = args[1];

    if (!command) {
        return send("📌 Lệnh hỗ trợ:\n➖ /add [token] - Thêm token\n➖ /del [token] - Xóa token\n➖ /list - Xem danh sách\n➖ /check [time] - Kiểm tra thông tin định kỳ\n➖ /stop - Dừng kiểm tra");
    }

    // Thêm token
    if (command === "add") {
        if (!param) return send("⚠️ Dùng: /add [Token Trao Đổi Sub]");
        send("🔄 Đang kiểm tra token, vui lòng chờ...");
        const info = await getTdsInfo(param);
        if (info) {
            tokens.push(param);
            saveTokens();
            send(`✅ **Đã Thêm Token Thứ ${tokens.length}**\n👤 Username: ${info.user}\n💰 Xu: ${info.xu}\n💀 Xu Die: ${info.xudie}`);
        } else {
            send("❌ Token không hợp lệ!");
        }
        return;
    }

    // Xóa token
    if (command === "del") {
        if (!param) return send("⚠️ Dùng: /del [Token Trao Đổi Sub]");
        if (tokens.includes(param)) {
            tokens = tokens.filter(t => t !== param);
            saveTokens();
            send(`🗑 **Đã xóa token!**\n🔑 ${param}`);
        } else {
            send("❌ Token không tồn tại!");
        }
        return;
    }

    // Hiển thị danh sách token
    if (command === "list") {
        if (tokens.length === 0) return send("⚠️ Không có token nào trong danh sách.");
        send("📜 **Danh sách Token:**\n" + tokens.map((t, i) => `🔑 ${i + 1}. ${t}`).join("\n"));
        return;
    }

    // Kiểm tra thông tin token định kỳ
    if (command === "check") {
        if (running) return send("⚠️ Kiểm tra đã chạy, hãy dùng /stop trước.");
        if (!param || isNaN(param)) return send("⚠️ Dùng: /check [Time (giây)]");
        if (tokens.length === 0) return send("⚠️ Bạn chưa thêm token nào! Dùng /add để thêm.");

        const delay = Math.max(parseInt(param), 5);
        running = true;
        send(`✅ Bắt đầu kiểm tra token mỗi ${delay} giây.`);

        checkInterval = setInterval(async () => {
            for (const token of tokens) {
                const info = await getTdsInfo(token);
                if (info) {
                    send(`🔄 **Cập nhật**\n👤 Username: ${info.user}\n💰 Xu: ${info.xu}\n💀 Xu Die: ${info.xudie}`);
                } else {
                    send(`⚠️ Lỗi khi lấy thông tin cho token: ${token}`);
                }
            }
        }, delay * 1000);

        return;
    }

    // Dừng kiểm tra
    if (command === "stop") {
        if (!running) return send("⚠️ Không có quá trình kiểm tra nào đang chạy.");
        running = false;
        clearInterval(checkInterval);
        send("🛑 **Đã dừng kiểm tra.**");
        return;
    }

    send("⚠️ Lệnh không hợp lệ!");
};
