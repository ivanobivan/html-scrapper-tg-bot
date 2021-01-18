import TelegramBot from "node-telegram-bot-api";
import https from "https";

import {months, commands, serviceWords, ServiceWords, resources} from "./var";
import {HabrData, habrScrapper} from "./api";
import Timer = NodeJS.Timer;

//@ts-ignore
const scrapperBot = new TelegramBot(process.env.TG_TOKEN, {
    polling: true
});

let lastPostTime = 0;
let timer: Timer | null = null;

scrapperBot.onText(/\/help/, message => {
    scrapperBot.sendMessage(message.chat.id, "keybord updated", {
        reply_markup: {
            keyboard: commands
        }
    });
});

scrapperBot.onText(/\/post (\d)?/, async (message, match) => {
    const count = match ? parseInt(match[1], 10) : 1;
    const res = await getSpecificData<HabrData>("habr.com", "/ru/users/alexzfort/posts/", habrScrapper, count);
    const header = count > 2 ? "weeks" : "week";
    const body = res.map(e => `Publish date: ${e.date}\nLink: ${e.link}`).join("\n---------------\n");
    scrapperBot.sendMessage(message.chat.id, `Post list by last ${count} ${header}\n${body}`);
});

scrapperBot.onText(/\/last/, async message => {
    const res = await getSpecificData<HabrData>("habr.com", "/ru/users/alexzfort/posts/", habrScrapper, 1);
    const date = res[0].date;
    const word = date.match(/[а-яё]{2,}/);
    let article = "";
    if (word) {
        let time;
        if (months.includes(word[0])) {
            const index = months.findIndex(e => e.toLowerCase() === word[0]) + 1;
            const trueIndex = index < 10 ? `0${index}` : index.toString();
            const appDate = date
                .replace(/[а-яё]{2,}/, trueIndex)
                .replace(/[а-яё]+/, "")
                .replace(/(\d{2}) (\d{2}) (\d{4})  (\d{2}):(\d{2})/, "$3-$2-$1T$4:$5-03:00");
            time = Date.parse(appDate);
        } else if (serviceWords.includes(word[0])) {
            const index = serviceWords.find(e => e.toLowerCase() === word[0]);
            if (index === ServiceWords.today) {
                const tick = date.match(/\d\d:\d\d/);
                if (tick && tick.length) {
                    const current = new Date();
                    const month = current.getMonth() < 10 ? `0${current.getMonth()}` : current.getMonth().toString();
                    const appDate = `${current.getFullYear()}-${month}-${current.getDate()}T${tick[0]}-03:00`;
                    time = Date.parse(appDate);
                }
            }
        }

        if (time && lastPostTime < time) {
            lastPostTime = time;
            article = "It's NEW\n";
        }
    }
    scrapperBot.sendMessage(message.chat.id, res.map(e => `<i>${article}</i>Publish date: ${e.date}\nLink: ${e.link}`).join(""), {
        parse_mode: "HTML"
    });
});

scrapperBot.onText(/\/ping/, message => {
    scrapperBot.sendMessage(message.chat.id, "available");
});

scrapperBot.onText(/\/start/, message => {
    scrapperBot.sendMessage(message.chat.id, "timer enabled");
    timer = setTimeout(function thread() {
        const date = new Date();
        if (date.getHours() === 0) {
            scrapperBot.sendMessage(message.chat.id, `Hi, check what's new on next resources\n ${resources.join("\n")}`);
        }
        setTimeout(thread, 3600000);
    }, 1000);
});

scrapperBot.onText(/\/stop/, message => {
    if (timer) {
        clearTimeout(timer);
        scrapperBot.sendMessage(message.chat.id, "Timer disabled");
    } else {
        scrapperBot.sendMessage(message.chat.id, "Timer didn't start");
    }
});

scrapperBot.onText(/\/news/, message => {
    scrapperBot.sendMessage(message.chat.id, `Hi, check what's new on next resources\n${resources.join("\n")}`);
});

const getSpecificData = async <T>(
    host: string,
    path: string,
    callback: (data: string, ...args: Array<any>) => T,
    ...args: Array<any>
): Promise<T> => {
    return new Promise((resolve, reject) => {
        const request = https.request({host, path}, res => {
            let data = "";

            res.on("data", (chunk: string) => {
                data += chunk;
            });

            res.on("end", () => {
                resolve(callback(data, args));
            });
        });
        request.on("error", e => {
            reject(e);
        });
        request.end();
    });
};