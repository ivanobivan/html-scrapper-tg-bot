import TelegramBot from "node-telegram-bot-api";
import path from "path";
import fs from "fs";
import https from "https";


export interface BotConfig {
    token: string;
    proxy?: string;
    strictSSL?: boolean;
    url: string;
    siteList: Array<{ host: string, path: string }>
}

const filePath = path.join(__dirname, "config.json");
const json = fs.readFileSync(filePath, "utf-8");
const config: BotConfig = JSON.parse(json);

const scrapperBot = new TelegramBot(config.token, {
    polling: true,
    request: {
        url: config.url,
        proxy: config.proxy,
        strictSSL: config.strictSSL
    }
});

const commands: Array<{ name: string; description: string }> = [
    {
        name: "post",
        description: ""
    },
    {
        name: "post",
        description: ""
    },
    {
        name: "post",
        description: ""
    }
];

scrapperBot.onText(/\/help/, (message) => {
    scrapperBot.sendMessage(message.chat.id,
        `Available command list:\n ${commands.map((e, i) => `${i} - /${e.name}: ${e.description}\n`)}`
    );
});

scrapperBot.onText(/\/post (\d)?/, async (message, match) => {
    const count = match ? parseInt(match[1]) : 1;
    const res = await getPostData(count);
    const header = count > 2 ? "weeks" : "week";
    const body = res.map(e => `Publish date: ${e.date}\nLink: ${e.link}`).join("\n---------------\n");
    scrapperBot.sendMessage(message.chat.id,
        `Post list by last ${count} ${header}\n${body}`
    );
});

scrapperBot.onText(/\/post/, async (message) => {
    const res = await getPostData(1);
    scrapperBot.sendMessage(message.chat.id, res.map(e => `Publish date: ${e.date}\nLink: ${e.link}`).join(""));
});

scrapperBot.onText(/\/ping/, (message) => {
    scrapperBot.sendMessage(message.chat.id, "available");
});

scrapperBot.onText(/\/timer/, (message) => {
    setTimeout(function thread() {
        scrapperBot.sendMessage(message.chat.id, "Time to check new posts", {
            reply_markup: {
                keyboard: [
                    [{text: "/post"}]
                ]

            }
        });
        setTimeout(thread, 10000);
    }, 10000);

});


const getPostData = async (count: number): Promise<Array<{ date: string; link: string; }>> => {
    return new Promise((resolve, reject) => {
        const request = https.request({host: "habr.com", path: "/ru/users/alexzfort/posts/"}, (res) => {
            let data: string = "";

            res.on("data", (chunk: string) => {
                data += chunk;
            });

            res.on("end", () => {
                let result: Array<{ date: string; link: string; }> = [];
                const timeList = data.match(/<span class="post__time".*span>/gi);
                const linklist = data.match(/<a href=".*" class="post__title_link".*>/gi);

                for (let i = 0; i < count; i++) {
                    let date = "";
                    let link = "";
                    if (timeList && timeList.length) {
                        const element = timeList[i];
                        const first = element.match(/\d{2}.*\d{2}/);
                        if (first && first.length) {
                            date = first[0];
                        }
                    }
                    if (linklist && linklist.length) {
                        const element = linklist[i];
                        const first = element.match(/https:[^"]*/);
                        if (first && first.length) {
                            link = first[0];
                        }
                    }
                    result.push({date, link})
                }
                resolve(result);
            });
        });
        request.on("error", (e) => {
            reject(e);
        });
        request.end();
    });
};
