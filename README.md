# RSS-parser

## About The Project

This is a parser of RSS news feeds for subsequent publication in Telegram via the Bot API. Written in NodeJS and TypeScript.

_Read in other languages: [English](https://github.com/Magomed-R/rss-parser-typescript/blob/main/README.md), [Russian](https://github.com/Magomed-R/rss-parser-typescript/blob/main/README.ru.md)_

## Setting up the environment

Before running, you need to configure the parser and bot:

1. Open a terminal, clone the project:

      `https://github.com/Magomed-R/rss-parser-typescript/`

2. Go to the directory with the project:

      `cd rss-parser-typescript`

3. Create a bot at https://t.me/botFather and get a token, then add it into the `BOT_TOKEN` field in the .env file
4. Add the IDs of the telegram channels in which posts from the feed will be received in the `channels` field, separated by commas. There should be no commas at the end of the line
5. Add links to your RSS-feeds in the links.txt file, the new link should start on a new line.

## Running

### Run via docker (recommended):

1. Build image:

`docker build -t rss-parser:latest .`

2. Run the container:

`docker run -d --name rss-parser -v ./.env:/program/.env -v ./links.txt:/program/links.txt -v ./cache.json:/program/cache. json rss-parser: latest `

If you use Linux, then everything is much simpler for you - run 2 commands: `make build` and `make run`

### Running without docker

1. Install [NodeJS](https://nodejs.org/) if you have not already done so
2. Install dependencies using `npm i` or `pnpm i`
3. Run the project using `npm run start:prod` or `pnpm start:prod`