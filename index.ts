import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import schedule, { Job } from "node-schedule";

import { habrScrapper } from "./habrScrappers";
import Parser  from 'rss-parser';

const parser = new Parser();

export type ScrapperData = {title: OptionalString, link: OptionalString, date: OptionalString};
export type OptionalString = string | undefined | null;

//@ts-ignore
const scrapperBot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

enum NAMES {
    START = "/start",
    STOP = "/stop",
    HELP = "/help",
    PING = "/ping",
    HABR = "/habr",
    NEWS = "/news"
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
        },
        {
            text: NAMES.NEWS
        }
    ]
];

const resources = {
    HABR_FRONTEND: "https://habr.com/ru/users/alexzfort/posts/",
    HABR_NEWS: "https://habr.com/ru/news/",
    MDN_NEWS: "https://hacks.mozilla.org/",
    3: "https://news.ycombinator.com/"
};

const fetchData = async <T>(url: string, scrapper: Function, extractCount: number): Promise<T> => {
    const data = await fetch(url);
    const text = await data.text();
    return scrapper(text, extractCount);
};

const getHabrData = async (link: string, extractCount: number = 1): Promise<string> => {
    const habrData: ScrapperData[] = await fetchData<ScrapperData[]>(link, habrScrapper, extractCount);
    return habrData.reduce((line, data) => {
        line += `${getHabrDataAsString(data)}\n`;
        return line;
    }, "");
}

const getHabrDataAsString = (habrData: ScrapperData) => {
    return `<b>Publish date: ${habrData.date}</b>\nTitle: ${habrData.title}\nLink: ${habrData.link}\n`
}


const collectNews = async () => {
    const result: string[] = [];
    result.push("--------Habr news--------");
    const habrData = await getHabrData(resources.HABR_FRONTEND);
    if (habrData) {
        result.push(habrData);
    }
    const habrDataNews = await getHabrData(resources.HABR_NEWS, 10);
    if (habrDataNews) {
        result.push(habrDataNews);
    }
    result.push("--------MDN news--------");
    return result;
}

let job: Job;

scrapperBot.onText(/\/start/, message => {
    scrapperBot.sendMessage(message.chat.id, "bot lauched");
    job = schedule.scheduleJob('30 7 * * *', async () => {
        const newsList = await collectNews();
        scrapperBot.sendMessage(message.chat.id, newsList.join("\n"), { parse_mode: "HTML" });
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
    const result = await getHabrData(resources.HABR_FRONTEND);
    if (result) {
        scrapperBot.sendMessage(message.chat.id, result, { parse_mode: "HTML" });
    }
});

scrapperBot.onText(/\/news/, async message => {
    const feed = await parser.parseURL('https://www.reddit.com/.rss');
    console.log(feed.title);
  
    feed.items.forEach(item => {
      console.log(item.title + ':' + item.link)
    });
    /* const newsList = await collectNews();
    scrapperBot.sendMessage(message.chat.id, newsList.join("\n"), { parse_mode: "HTML" }); */
});

scrapperBot.onText(/\/ping/, message => {
    scrapperBot.sendMessage(message.chat.id, "pong");
});