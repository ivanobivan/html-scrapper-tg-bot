import { ScrapperData } from ".";

export const habrScrapper = (text: string, extractCount: number = 1): ScrapperData[] => {
    return getEntryObjectList(
        text,
        [
            /<a href=".*" class="post__title_link".*>(.*?)<\/a>/gi,
            /<span class="post__time">(.*?)<\/span>/gi,
            /<a href="(.*?)" class="post__title_link".*>.*<\/a>/gi,
        ],
        extractCount
    );
};

const getEntryObjectList = (text: string, regExpList: RegExp[], extractCount: number): ScrapperData[] => {
    const result: ScrapperData[] = [];
    const lineList: string[][] = [];
    regExpList.forEach(regExp => {
        lineList.push(getEntryList(text, regExp, extractCount));
    });
    for (let i = 0; i < extractCount; i++) {
        result.push(extractHabrData(
            lineList[0][i],
            lineList[1][i],
            lineList[2][i],
        ));
    }
    return result;
}

const getEntryList = (text: string, regExp: RegExp, extractCount: number) => {
    const matchList = text.match(regExp);
    if (matchList && matchList.length) {
        return matchList.splice(0, extractCount);
    }
    return [];
}

const extractHabrData = (titleLine: string, dateLine: string, linkLine: string): ScrapperData => {
    const title = titleLine.match(/<a.*>(.*?)<\/a>/);
    const date = dateLine.match(/<span.*>(.*?)<\/span>/);
    const link = linkLine.match(/href=\"(.*?)\"/);
    return {
        title: title && title[1],
        date: date && date[1],
        link: link && link[1]
    }
}