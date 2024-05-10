import { config } from "dotenv";
config();

import Parser from "rss-parser";
import fs from "fs";
import { Bot } from "grammy";
import chalk from "chalk";
import iconv from "iconv-lite";
import axios from "axios";

const parser = new Parser();
const bot = new Bot(process.env.BOT_TOKEN!);

let visited_pages: Set<string>;

if (fs.existsSync(process.env.cache!)) {
    visited_pages = new Set(
        JSON.parse(fs.readFileSync(process.env.cache!, "utf-8")).visited_pages
    );
} else {
    fs.writeFileSync(process.env.cache!, '{ "visited_pages": [] }', "utf-8");
    visited_pages = new Set();
}

async function main() {
    config();

    const links = fs.readFileSync(process.env.links!, "utf-8").split("\n");
    let iter = 0;

    links.forEach(async (link, i) => {
        try {
            let ribbon: {
                [key: string]: any;
            } & Parser.Output<{
                [key: string]: any;
            }> = await parser.parseURL(link);

            if (ribbon.items[0].title?.includes("�")) {
                let { data } = await axios.get(link, {
                    responseType: "arraybuffer",
                });

                data = iconv.decode(Buffer.from(data), "windows-1251");
                data = iconv.encode(data, "utf-8").toString();

                ribbon = await parser.parseString(data);
            }

            ribbon.items.forEach(async (item, j) => {
                if (!visited_pages.has(item.link!)) {
                    visited_pages.add(item.link!);
                    save_vp();

                    let content = item.contentSnippet;

                    if (!content) content = item.content;

                    const status = await send_in_channels({
                        title: item.title!,
                        link: item.link!,
                        content: content,
                    });

                    if (status === "success") {
                        iter++;
                    } else if (status === "flood error") {
                        console.log(chalk.red.bold("FLOOD ERROR!"));
                        return;
                    }
                }
            });

            if (iter === 0) {
                console.log(chalk.green("There's nothing new now"));
            } else {
                console.log(chalk.green(iter + " posts sended in channel!"));
            }

            iter = 0;
        } catch (e) {
            console.log(e);
        }
    });
}

async function send_in_channels(item: {
    title: string;
    content?: string;
    link: string;
}): Promise<string> {
    const channels = process.env.channels!.split(",").map((el) => el.trim());

    let text: string = "";
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
    const cache: { visited_pages: string[] } = JSON.parse(
        fs.readFileSync(process.env.cache!, "utf-8")
    );
    cache.visited_pages = Array.from(visited_pages);
    fs.writeFileSync(process.env.cache!, JSON.stringify(cache), "utf-8");
}

main();
setInterval(() => main(), Number(process.env.interval!) * 1000);
