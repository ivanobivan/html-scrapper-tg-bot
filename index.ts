import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import schedule, { Job } from "node-schedule";

import { HabrData, habrScrapper } from "./scrappers";
//@ts-ignore
const scrapperBot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

let lastPostTime = 0;

enum NAMES {
    START = "/start",
    STOP = "/stop",
    HELP = "/help",
    PING = "/ping",
    HABR = "/habr"
}

const commands = [
    [
        {
            text: NAMES.START
        },
        {
            text: NAMES.STOP
        },
        {
            text: NAMES.HELP
        },
        {
            text: NAMES.PING
        },
        {
            text: NAMES.HABR
        }
    ]
];

const resources = [
    "https://www.reddit.com/",
    "https://habr.com/ru/feed/",
    "https://developer.mozilla.org/ru/",
    "https://news.ycombinator.com/"
];

const months = ["января", "февраля", "марта", "апреля", "майя", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

const TODAY = "сегодня";

const fetchData = async <T>(url: string, scrapper: (data: string, ...args: Array<any>) => T): Promise<T> => {
    const data = await fetch(url);
    const text = await data.text();
    return scrapper(text);
};


let job: Job;

scrapperBot.onText(/\/start/, message => {
    job = schedule.scheduleJob('30 7 * * *', () => {
        scrapperBot.sendMessage(message.chat.id, `Hi, check what's new on next resources\n${resources.join("\n")}`);
    });
});

scrapperBot.onText(/\/stop/, message => {
    if (job) {
        job.cancel()
    }
});

scrapperBot.onText(/\/help/, message => {
    scrapperBot.sendMessage(message.chat.id, Object.values(NAMES).join("\n"), {
        reply_markup: {
            keyboard: commands
        }
    });
});

scrapperBot.onText(/\/habr/, async message => {
    const res = await fetchData<HabrData>("https://habr.com/ru/users/alexzfort/posts/", habrScrapper);
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
        } else if (TODAY === word[0]) {
            const tick = date.match(/\d\d:\d\d/);
            if (tick && tick.length) {
                const current = new Date();
                const month = current.getMonth() < 10 ? `0${current.getMonth()}` : current.getMonth().toString();
                const appDate = `${current.getFullYear()}-${month}-${current.getDate()}T${tick[0]}-03:00`;
                time = Date.parse(appDate);
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
    scrapperBot.sendMessage(message.chat.id, "pong");
});