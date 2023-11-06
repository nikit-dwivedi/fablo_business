const axios = require('axios');
const { getUserNotificationId } = require("../services/firebase.service");

async function sendNotification(userIDArray, messageDetails) {
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic NjQ1MzdmMzYtYmJmZS00ZjQwLWIxMzgtMzQ2MzljNDZkY2Fh"
    };
    const data = {
        app_id: "1b4778ad-4a99-499e-be8c-33f3356161a8",
        contents: { "en": messageDetails.message, "es": messageDetails.heading },
        headings: { "en": messageDetails.heading },
        channel_for_external_user_ids: "push",
        include_external_user_ids: userIDArray
    };
    const response = await axios.post("https://onesignal.com/api/v1/notifications", data, { headers });
    return response;
}

module.exports = {
    sendNotification
}