import path from "path";
import fs from "fs";

const filePath = path.join(__dirname, "test.txt");
const testFile = fs.readFileSync(filePath, "utf-8");

let result: Array<{ date: string; link: string; }> = [];
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
        const first = element.match(/https:[^"]*/);
        if(first && first.length) {
            link = first[0];
        }
    }
    result.push({date, link})
}
console.log("За неделю");
console.log(result.map(e => `Publish date: ${e.date}\nLink: ${e.link}`).join("\n---------------\n"));