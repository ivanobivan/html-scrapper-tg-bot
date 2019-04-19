import TelegramBot from "node-telegram-bot-api";
import config from "./config";

const scrapperBot = new TelegramBot(config.token, {
    polling: true,
    request: {
        proxy: config.proxy,
        strictSSL: config.strictSSL
    }
});

scrapperBot.onText(/\/test/, (message) => {
    scrapperBot.sendMessage(message.chat.id, "Everything is ok");
});

scrapperBot.onText(/\/get/, (message) => {
    scrapperBot.sendMessage(message.chat.id, "GET");
});

scrapperBot.onText(/\/photo/, (message) => {
    scrapperBot.sendPhoto(message.chat.id, "https://avatars1.githubusercontent.com/u/25548022?s=460&v=4");
});


scrapperBot.on("message", (message: TelegramBot.Message) => {
    const text = message.text;
    const chatId = message.chat.id;
    scrapperBot.sendMessage(chatId, `In response: ${text && text.toUpperCase()}`);
});