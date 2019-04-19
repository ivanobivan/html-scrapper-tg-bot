export interface BotConfig {
    token: string;
    proxy?: string;
    strictSSL: boolean;
}

export default {
    token: "",
    proxy: "",
    strictSSL: false
} as BotConfig