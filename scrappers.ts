export type HabrData = Array<{ date: string; link: string }>;

export const habrScrapper = (text: string): HabrData => {
    const result: HabrData = [];
    const timeList = text.match(/<span class="post__time".*span>/gi);
    const linklist = text.match(/<a href=".*" class="post__title_link".*>/gi);
    let date = "";
    let link = "";
    if (timeList && timeList.length) {
        const element = timeList[0];
        const first = element.match(/\d{2}.*\d{2}/);
        if (first && first.length) {
            date = first[0];
        }
    }
    if (linklist && linklist.length) {
        const element = linklist[0];
        const first = element.match(/https:[^"]*/);
        if (first && first.length) {
            link = first[0];
        }
    }
    result.push({ date, link });
    return result;
};
