const axios = require("axios");

module.exports.config = {
  name: "ff",
  version: "2.0.0",
  hasPermission: 0,
  credits: "VLjnh",
  description: "Lấy thông tin hoặc kiểm tra tài khoản Free Fire",
  commandCategory: "Tiện ích",
  usages: "ff [ban/info] [UID]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  if (args.length < 2) {
    return api.sendMessage("Vui lòng nhập đúng cú pháp: ff [ban/info] [UID]", event.threadID);
  }

  const commandType = args[0].toLowerCase(); // "ban" hoặc "info"
  const ffId = args[1];

  if (!/^\d+$/.test(ffId)) {
    return api.sendMessage("UID phải là số!", event.threadID);
  }

  if (commandType === "ban") {
    await checkBanStatus(api, event, ffId);
  } else if (commandType === "info") {
    await getAccountInfo(api, event, ffId);
  } else {
    api.sendMessage("Lệnh không hợp lệ! Sử dụng: ff [ban/info] [UID]", event.threadID);
  }
};

// **Hàm kiểm tra tài khoản bị cấm**
async function checkBanStatus(api, event, ffId) {
  const banCheckUrl = `https://freefire-virusteam.vercel.app/isbanned?uid=${ffId}`;

  try {
    const response = await axios.get(banCheckUrl);
    const banData = response.data;

    if (banData && banData["Kiểm tra tài khoản bị cấm"]) {
      const banInfo = banData["Kiểm tra tài khoản bị cấm"];
      let resultMessage = "🚫 KIỂM TRA TRẠNG THÁI TÀI KHOẢN 🚫\n\n";
      resultMessage += `👤 Tên: ${banInfo["Tên"]}\n`;
      resultMessage += `🔹 UID: ${banInfo["UID"]}\n`;
      resultMessage += `🌍 Khu vực: ${banInfo["Khu vực"]}\n`;
      resultMessage += `🔴 Trạng thái: ${banInfo["Trạng thái"]}\n`;

      api.sendMessage(resultMessage, event.threadID);
    } else {
      api.sendMessage("Không thể kiểm tra trạng thái tài khoản.", event.threadID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("Lỗi khi kiểm tra trạng thái tài khoản.", event.threadID);
  }
}

// **Hàm lấy thông tin tài khoản**
async function getAccountInfo(api, event, ffId) {
  const apiUrl = `https://freefire-virusteam.vercel.app/info?uid=${ffId}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data) {
      let resultMessage = "🎮 THÔNG TIN TÀI KHOẢN FREE FIRE 🎮\n\n";
      resultMessage += `👤 Tên: ${data["Account Name"]}\n`;
      resultMessage += `🔹 UID: ${data["Account UID"]}\n`;
      resultMessage += `🔺 Level: ${data["Account Level"]} (Exp: ${data["Account XP"]})\n`;
      resultMessage += `🌍 Khu vực: ${data["Account Region"]}\n`;
      resultMessage += `👍 Lượt thích: ${data["Account Likes"]}\n`;
      resultMessage += `📅 Ngày tạo: ${data["Account Create Time"]}\n`;
      resultMessage += `🕒 Lần đăng nhập cuối: ${data["Account Last Login"]}\n`;
      resultMessage += `📝 Chữ ký: ${data["Account Signature"]}\n\n`;

      if (data["Equipped Pet Information"]) {
        const petInfo = data["Equipped Pet Information"];
        resultMessage += "🐾 PET HIỆN TẠI:\n";
        resultMessage += `📛 Tên: ${petInfo["Pet Name"]}\n`;
        resultMessage += `🔹 ID: ${petInfo["Pet ID"]}\n`;
        resultMessage += `🔺 Level: ${petInfo["Pet Level"]}\n`;
        resultMessage += `🔄 EXP: ${petInfo["Pet XP"]}\n`;
        resultMessage += `✅ Được chọn: ${petInfo["Selected?"] === "Yes" ? "Có" : "Không"}\n\n`;
      }

      if (data["Guild Information"]) {
        const guildInfo = data["Guild Information"];
        resultMessage += "🛡️ THÔNG TIN QUÂN ĐOÀN:\n";
        resultMessage += `🏅 Tên: ${guildInfo["Guild Name"]}\n`;
        resultMessage += `🔹 ID: ${guildInfo["Guild ID"]}\n`;
        resultMessage += `🔺 Level: ${guildInfo["Guild Level"]}\n`;
        resultMessage += `👥 Thành viên: ${guildInfo["Guild Current Members"]}/${guildInfo["Guild Capacity"]}\n\n`;

        if (data["Guild Leader Information"]) {
          const leaderInfo = data["Guild Leader Information"];
          resultMessage += "👑 CHỦ QUÂN ĐOÀN:\n";
          resultMessage += `👤 Tên: ${leaderInfo["Leader Name"]}\n`;
          resultMessage += `🔹 ID: ${leaderInfo["UID"]}\n`;
          resultMessage += `🔺 Level: ${leaderInfo["Leader Level"]} (Exp: ${leaderInfo["Leader XP"]})\n`;
          resultMessage += `📅 Ngày tạo: ${leaderInfo["Leader Ac Created Time"]}\n`;
          resultMessage += `🕒 Lần đăng nhập cuối: ${leaderInfo["Leader Last Login Time"]}\n`;
        }
      }

      api.sendMessage(resultMessage, event.threadID);
    } else {
      api.sendMessage("Không tìm thấy thông tin tài khoản.", event.threadID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("Lỗi khi lấy thông tin tài khoản.", event.threadID);
  }
}
