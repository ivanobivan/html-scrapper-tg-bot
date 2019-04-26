import TelegramBot from "node-telegram-bot-api";
import path from "path";
import fs from "fs";
import https from "https";


export interface BotConfig {
    token: string;
    proxy?: string;
    strictSSL?: boolean;
    url: string;
    siteList: Array<{host: string, path: string}>
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
                let result: Array<string> = [];
                const timeList = data.match(/<span class="post__time".*span>/gi);
                const linklist = data.match(/<a href=".*" class="post__title_link".*>/gi);
                if (timeList && timeList.length) {
                    const element = timeList[0];
                    const first = element.match(/\d{2}.*\d{2}/);
                    if (first && first.length) {
                        result.push(first[0]);
                    }
                }
                if (linklist && linklist.length) {
                    const element = linklist[0];
                    const first = element.match(/https:.*[\/][^\w]\s/);
                    if (first && first.length) {
                        const replaced = first[0].replace("\"","");
                        result.push(replaced);
                    }
                }
                resolve(result.join(" "));
            });
        });
        request.on("error", (e) => {
            reject(e);
        });
        request.end();
    });
};
