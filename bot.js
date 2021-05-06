const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser');
const parser = require('./parser.js');

require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
let bot;

if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}
bot.on('message', (msg) => {
    console.log(msg);
    const chatId = msg.chat.id;
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message from server');
});

// Matches "/word whatever"
bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const word = match[1];
  axios
    .get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=673612&date=07-05-2021',
        {
            headers:{
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'cache-control':'no-cache',
                'scheme':'https',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true
        }

    ).then(response => {
        console.log(response)
      const parsedHtml = parser(response.data);
     // bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
    })
    .catch(error => {
        console.log(error);
     // const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;

      // bot.sendMessage(chatId, errorText, { parse_mode:'HTML'})
    });
});

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});