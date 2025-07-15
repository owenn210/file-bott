const axios = require('axios');
const fs = require("fs");
const path = require("path");

let dataPath = path.join(__dirname, "/data/autodown.json");

let appData = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, "utf-8")) : {};

const apps = [
  { name: "TikTok", key: "tiktok" },
  { name: "SoundCloud", key: "soundcloud" },
  { name: "Douyin", key: "douyin" },
  { name: "Instagram", key: "instagram" },
  { name: "Facebook", key: "facebook" },
  { name: "Capcut", key: "capcut" },
  { name: "Threads", key: "threads" },
  { name: "Twitter", key: "twitter" },
  { name: "Pinterest", key: "pinterest" },
  { name: "Youtube", key: "youtube" }
];

exports.config = {
    name: "autodown",
    version: "2.4",
    hasPermission: 0,
    credits: "DC Nam",
    description: "Tải tự động nội dung từ nhiều nền tảng và video CapCut.",
    commandCategory: "Tiện Ích",
    usages: [],
    cooldowns: 5,
    dependencies: {
      "axios": ""
    }
};

exports.run = async function (o) {
    const { api, event } = o;
    const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID);

    let threadID = event.threadID;
    let response = "Chọn ứng dụng để bật/tắt tự động tải xuống:\n";

    apps.forEach((app, index) => {
        const status = appData[threadID] && appData[threadID][app.key] ? "✅ BẬT" : "❌ TẮT";
        response += `${index + 1}. ${app.name} - ${status}\n`;
    });

    response += "\nHãy reply số thứ tự để thay đổi trạng thái (hoặc nhập 'all' để bật/tắt tất cả).";

    send(response, (err, info) => {
        if (err) console.error(err);

        global.client.handleReply.push({
            type: "autodown",
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            threadID: threadID,
            apps,
        });
    });
};

exports.handleReply = async function (o) {
    const { api, event, handleReply } = o;
    const send = (msg, callback) => api.sendMessage(msg, event.threadID, callback, event.messageID);

    if (handleReply.author !== event.senderID) return;

    const choice = event.body.trim().toLowerCase();

    if (choice === "all") {
        let allEnabled = true;

        apps.forEach(app => {
            const appKey = app.key;
            if (!appData[handleReply.threadID] || !appData[handleReply.threadID][appKey]) {
                allEnabled = false;
            }
        });

        if (allEnabled) {
            apps.forEach(app => {
                const appKey = app.key;
                if (!appData[handleReply.threadID]) {
                    appData[handleReply.threadID] = {};
                }
                appData[handleReply.threadID][appKey] = false;
            });

            send("Đã tắt tự động tải xuống cho tất cả các ứng dụng.");
        } else {
            apps.forEach(app => {
                const appKey = app.key;
                if (!appData[handleReply.threadID]) {
                    appData[handleReply.threadID] = {};
                }
                appData[handleReply.threadID][appKey] = true;
            });

            send("Đã bật tự động tải xuống cho tất cả các ứng dụng.");
        }

        fs.writeFileSync(dataPath, JSON.stringify(appData, null, 2));
        return;
    }

    const choices = choice.split(" ").map(num => parseInt(num));
    const invalidChoice = choices.find(choice => isNaN(choice) || choice < 1 || choice > handleReply.apps.length);
    if (invalidChoice) {
        return send("Lựa chọn không hợp lệ, vui lòng nhập số hợp lệ.");
    }

    choices.forEach(choice => {
        const selectedApp = handleReply.apps[choice - 1];
        const appKey = selectedApp.key;

        if (!appData[handleReply.threadID]) {
            appData[handleReply.threadID] = {};
        }

        appData[handleReply.threadID][appKey] = !appData[handleReply.threadID][appKey];
    });

    fs.writeFileSync(dataPath, JSON.stringify(appData, null, 2));
    send("Đã cập nhật trạng thái tự động tải xuống cho các ứng dụng đã chọn.");
};

exports.handleEvent = async function (o) {
    try {
        const str = o.event.body;
        if (!str) {
            return;
        }

        const send = (msg) => o.api.sendMessage(msg, o.event.threadID, o.event.messageID);
        const head = (app) => `[ AUTODOWN - ${app.toUpperCase()} ]\n──────────────────`;
        const links = str.match(/(https?:\/\/[^)\s]+)/g) || [];
        const threadID = o.event.threadID;

        for (const link of links) {
            if (/(^https:\/\/)((vm|vt|www|v)\.)?(tiktok)\.com\//.test(str)) {
                if (!appData[threadID] || !appData[threadID]['tiktok']) {
                    console.log(`Tính năng tự động tải TikTok đã tắt cho nhóm ${threadID}.`);
                    continue;
                }

                try {
                    const res = await axios.get(`https://gau-api.click/download?url=${encodeURIComponent(str)}`);
                    let attachment = [];

                    if (res.data && res.data.media_url) {
                        attachment.push(await global.tools.streamURL(res.data.media_url, 'mp4'));
                    }

                    o.api.sendMessage({
                        body: `${head('TIKTOK')}\n⩺ Tiêu đề: ${res.data.title}\n⩺ Tác giả: ${res.data.author}`,
                        attachment
                    }, o.event.threadID);
                    
                    console.log(`Tải TikTok từ ${str} thành công`);
                } catch (error) {
                    console.error(`Lỗi khi tải TikTok từ ${str}: ${error.message}`);
                }
            } else if (/facebook\.com|fb\.watch/.test(str)) {
                if (!appData[threadID] || !appData[threadID]['facebook']) {
                    console.log(`Tính năng tự động tải Facebook đã tắt cho nhóm ${threadID}.`);
                    continue;
                }

                try {
                    const res = await axios.get(`https://gau-api.click/download?url=${encodeURIComponent(str)}`);
                    let attachment = [];

                    if (res.data && res.data.media_url) {
                        attachment.push(await global.tools.streamURL(res.data.media_url, 'mp4'));
                    }

                    send({
                        body: `${head('FACEBOOK')}\n⩺ Tiêu đề: ${res.data.title || "null"}`,
                        attachment
                    });
                    console.log(`Tải Facebook từ ${str} thành công.`);
                } catch (error) {
                    console.log(`Lỗi khi tải nội dung Facebook từ ${str}: ${error.message}`);
                }
            } else if (/instagram\.com\/(stories|p|reel)/.test(str)) {
                if (!appData[threadID] || !appData[threadID]["instagram"]) {
                    console.log(`Tính năng tự động tải Instagram đã tắt cho nhóm ${threadID}.`);
                    continue;
                }

                try {
                    const res = await axios.get(`https://gau-api.click/download?url=${encodeURIComponent(str)}`);
                    let attachments = [];

                    if (res.data && res.data.media_url) {
                        attachments.push(await global.tools.streamURL(res.data.media_url, 'mp4'));
                    }

                    send({
                        body: `${head('INSTAGRAM')}\n⩺ Tiêu đề: ${res.data.title || "null"}`,
                        attachment: attachments
                    });
                    console.log(`Tải Instagram từ ${link} thành công`);
                } catch (error) {
                    console.error(`Lỗi khi tải Instagram từ ${str}: ${error.message}`);
                }
            } else if (/capcut/.test(str)) {
                if (!appData[threadID] || !appData[threadID]['capcut']) {
                    console.log(`Tính năng tự động tải CapCut đã tắt cho nhóm ${threadID}.`);
                    continue;
                }

                try {
                    const res = await axios.get(`https://gau-api.click/download?url=${encodeURIComponent(str)}`);
                    let attachment = [];

                    if (res.data && res.data.media_url) {
                        attachment.push(await global.tools.streamURL(res.data.media_url, 'mp4'));
                    }

                    send({
                        body: `${head('CAPCUT')}\n⩺ Tiêu đề: ${res.data.title || "null"}`,
                        attachment
                    });

                    console.log(`Tải CapCut từ ${link} thành công.`);
                } catch (error) {
                    console.error(`Lỗi khi tải video CapCut từ ${link}: ${error.message}`);
                }
            } else if (/twitter/.test(str)) {
                if (!appData[threadID] || !appData[threadID]['twitter']) {
                    console.log(`Tính năng tự động tải Twitter đã tắt cho nhóm ${threadID}.`);
                    continue;
                }

                try {
                    const res = await axios.get(`https://gau-api.click/download?url=${encodeURIComponent(str)}`);
                    let attachment = [];

                    if (res.data && res.data.media_url) {
                        attachment.push(await global.tools.streamURL(res.data.media_url, 'mp4'));
                    }

                    send({
                        body: `${head("TWITTER")}\n⩺ Tiêu đề: ${res.data.title || 'N/A'}`,
                        attachment
                    });

                    console.log(`Tải Twitter từ ${link} thành công.`);
                } catch (error) {
                    console.log(`Lỗi khi tải nội dung Twitter từ ${link}: ${error.message}`);
                }
            }
        }
    } catch (e) {
        console.error('Lỗi khi thực hiện xử lý sự kiện: ' + e);
    }
};

exports.handleReaction = async function (o) {
    const { threadID: t, messageID: m, reaction: r } = o.event;
    const { handleReaction: _ } = o;
    if (r != "😆") return;

    o.api.sendMessage({
        body: `[ MP3 - TIKTOK ]\n⩺ ID: ${_.data.music_info.id}\n⩺ Tiêu đề: ${_.data.music_info.title}\n⩺ Thời gian: ${convertHMS(_.data.music_info.duration)}`,
        attachment: await global.tools.streamURL(_.data.music, "mp3")
    }, t, m);
};

function convertHMS(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
}