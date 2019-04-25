import TelegramBot from "node-telegram-bot-api";
import path from "path";
import fs from "fs";
import https from "https";
import jsdom from "jsdom";


export interface BotConfig {
    token: string;
    proxy?: string;
    strictSSL?: boolean;
    url: string;
}

const filePath = path.join(__dirname, "config.json");
const json = fs.readFileSync(filePath, "utf-8");
const config:BotConfig = JSON.parse(json);

const scrapperBot = new TelegramBot(config.token, {
    polling: true,
    request: {
        url: config.url,
        proxy: config.proxy,
        strictSSL: config.strictSSL
    }
});

scrapperBot.onText(/\/post/,  async (message) => {
    const res = await getPostData();
    scrapperBot.sendMessage(message.chat.id, res);
});


const getPostData = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const request = https.request({host: "habr.com", path: "/ru/users/alexzfort/posts/"}, (res) => {
            let data: string = "";

            res.on("data", (chunk: string) => {
                data += chunk;
            });

            res.on("end", () => {
                const dom = new jsdom.JSDOM(data);
                const postList = <HTMLUListElement> dom.window.document.querySelector(".content-list");
                const firstElementChild = <HTMLLIElement> postList.firstElementChild;
                const postTime = <HTMLSpanElement> firstElementChild.querySelector(".post__time");
                const link = <HTMLLinkElement> firstElementChild.querySelector(".post__title_link");
                resolve(`${postTime.textContent} ${link}`);
            });
        });
        request.on("error", (e) => {
            reject(e);
        });
        request.end();
    });
};
