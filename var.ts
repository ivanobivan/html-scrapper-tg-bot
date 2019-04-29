export const months = ['января', 'февраля', 'марта', 'апреля', 'майя', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export enum ServiceWords {
    today = "сегодня"
}

export const serviceWords = ["сегодня"];
export const commands: Array<{ name: string; signature?: string; description: string }> = [
    {
        name: "post",
        signature: "(number)",
        description: ""
    },
    {
        name: "last",
        description: "get last post"
    },
    {
        name: "help",
        description: "get help"
    },
    {
        name: "ping",
        description: "simple ping"
    }
];
