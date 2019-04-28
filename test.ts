import path from "path";
import fs from "fs";

import {months} from "./var";


/*const filePath = path.join(__dirname, "test.txt");
const testFile = fs.readFileSync(filePath, "utf-8");*/

/*let result: Array<{ date: string; link: string; }> = [];
const timeList = testFile.match(/<span class="post__time".*span>/gi);
const linklist = testFile.match(/<a href=".*" class="post__title_link".*>/gi);

for (let i = 0; i < 1; i++) {
    let date = "";
    let link = "";
    if (timeList && timeList.length) {
        const element = timeList[i];
        const first = element.match(/\d{2}.*\d{2}/);
        if(first && first.length) {
            date = first[0];
        }
    }
    if (linklist && linklist.length) {
        const element = linklist[i];
        const first = element.match(/https:[^"]*!/);
        if(first && first.length) {
            link = first[0];
        }
    }
    result.push({date, link})
}
console.log("За неделю");
console.log(result.map(e => `Publish date: ${e.date}\nLink: ${e.link}`).join("\n---------------\n"));*/

const date = "21 апреля 2019 в 23:05";
const currentMonth = date.match(/[а-яё]{2,}/);
if(currentMonth) {
    let index = months.findIndex(e => e.toLowerCase() === currentMonth[0]) + 1;
    const trueIndex = index < 10 ? `0${index}` : index.toString();
    const appDate = date
        .replace(/[а-яё]{2,}/, trueIndex)
        .replace(/[а-яё]+/,"")
        .replace(/(\d{2}) (\d{2}) (\d{4})  (\d{2}):(\d{2})/, "$3-$2-$1T$4:$5-03:00");
    console.log(Date.parse(appDate));
}
