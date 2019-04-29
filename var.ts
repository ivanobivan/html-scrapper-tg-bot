export const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Майя', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
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
