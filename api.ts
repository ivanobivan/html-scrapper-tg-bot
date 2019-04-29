export type HabrData = Array<{date: string; link: string}>;

export const habrScrapper = (data: string, args: Array<any>): HabrData => {
    const result: Array<{date: string; link: string}> = [];
    const timeList = data.match(/<span class="post__time".*span>/gi);
    const linklist = data.match(/<a href=".*" class="post__title_link".*>/gi);
    const count = args[0];
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
        result.push({date, link});
    }
    return result;
};
