# RSS-парсер

## О проекте

Это парсер новостных rss-лент для последующего постинга в Telegram через Bot API. Написан на NodeJS и TypeScript.

_Читайте на других языках: [английский](https://github.com/Magomed-R/rss-parser-typescript/blob/main/README.md), [русский](https://github.com/Magomed-R/rss-parser-typescript/blob/main/README.ru.md)_

## Настройка окружения

Перед запуском необходимо настроить парсер и бота:

1. Откройте терминал, склонируйте проект командой:

    `https://github.com/Magomed-R/rss-parser-typescript/`

2. Перейдите в папку с проектом:

    `cd rss-parser-typescript`

3. Создайте бота в https://t.me/botFather и получите токен, затем вставьте его в поле `BOT_TOKEN` в файле .env
4. Добавьте ID телеграм каналов, в которые будут поступать посты из лент в поле `channels` через запятую. В конце строки никаких запятых быть не должно
5. Добавьте ссылки на ваши RSS-ленты в файле links.txt, каждая ссылка должна начинаться с новой строки

## Запуск

### Запуск через docker (рекомендуется):

1. Соберите образ контейнера:

`docker build -t rss-parser:latest .`

2. Запустите контейнер:

`docker run -d --name rss-parser -v ./.env:/program/.env -v ./links.txt:/program/links.txt -v ./cache.json:/program/cache.json rss-parser:latest`

Если вы пользуетесь Linux, то для вас всё много проще - запустите 2 команды: `make build` и `make run`

### Запуск без docker

1. Установите [NodeJS](https://nodejs.org/), если вы этого ещё не сделали
2. Установите зависимости командой `npm i` или `pnpm i`
3. Запустите проект командой `npm run start:prod` или `pnpm start:prod`
