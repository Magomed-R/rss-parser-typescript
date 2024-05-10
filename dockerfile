FROM node

WORKDIR /program

COPY . /program/

RUN npm i

CMD npm run start:prod