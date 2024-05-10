"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const rss_parser_1 = __importDefault(require("rss-parser"));
const fs_1 = __importDefault(require("fs"));
const grammy_1 = require("grammy");
const chalk_1 = __importDefault(require("chalk"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const axios_1 = __importDefault(require("axios"));
const parser = new rss_parser_1.default();
const bot = new grammy_1.Bot(process.env.BOT_TOKEN);
let visited_pages;
if (fs_1.default.existsSync(process.env.cache)) {
    visited_pages = new Set(JSON.parse(fs_1.default.readFileSync(process.env.cache, "utf-8")).visited_pages);
}
else {
    fs_1.default.writeFileSync(process.env.cache, '{ "visited_pages": [] }', "utf-8");
    visited_pages = new Set();
}
async function main() {
    (0, dotenv_1.config)();
    const links = fs_1.default.readFileSync(process.env.links, "utf-8").split("\n");
    let iter = 0;
    links.forEach(async (link, i) => {
        try {
            let ribbon = await parser.parseURL(link);
            if (ribbon.items[0].title?.includes("�")) {
                let { data } = await axios_1.default.get(link, {
                    responseType: "arraybuffer",
                });
                data = iconv_lite_1.default.decode(Buffer.from(data), "windows-1251");
                data = iconv_lite_1.default.encode(data, "utf-8").toString();
                ribbon = await parser.parseString(data);
            }
            ribbon.items.forEach(async (item, j) => {
                if (!visited_pages.has(item.link)) {
                    visited_pages.add(item.link);
                    save_vp();
                    let content = item.contentSnippet;
                    if (!content)
                        content = item.content;
                    const status = await send_in_channels({
                        title: item.title,
                        link: item.link,
                        content: content,
                    });
                    if (status === "success") {
                        iter++;
                    }
                    else if (status === "flood error") {
                        console.log(chalk_1.default.red.bold("FLOOD ERROR!"));
                        return;
                    }
                }
            });
            if (iter === 0) {
                console.log(chalk_1.default.green("There's nothing new now"));
            }
            else {
                console.log(chalk_1.default.green(iter + " posts sended in channel!"));
            }
            iter = 0;
        }
        catch (e) {
            console.log(e);
        }
    });
}
async function send_in_channels(item) {
    const channels = process.env.channels.split(",").map((el) => el.trim());
    let text = "";
    text += `*${item.title}* \n\n`;
    if (item.content) {
        text += item.content + "\n\n";
    }
    if (text.length > 3600) {
        text = text.slice(0, 3600) + "...\n\n";
    }
    text += item.link;
    channels.forEach(async (channel) => {
        await bot.api
            .sendMessage(channel, text, {
            link_preview_options: { is_disabled: true },
            parse_mode: "Markdown",
        })
            .catch((err) => {
            if (err.status_code === 429) {
                return "flood error";
            }
        });
    });
    return "success";
}
function save_vp() {
    const cache = JSON.parse(fs_1.default.readFileSync(process.env.cache, "utf-8"));
    cache.visited_pages = Array.from(visited_pages);
    fs_1.default.writeFileSync(process.env.cache, JSON.stringify(cache), "utf-8");
}
main();
setInterval(() => main(), Number(process.env.interval) * 1000);
