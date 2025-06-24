// server.js
const express = require('express');
const axios = require('axios');
const os = require('os');
const dotenv = require('dotenv').config();
const { exec } = require('child_process');
const BOT_TOKEN = process.env.BOTTOKEN;
const CHAT_ID = process.env.USERID;

const app = express();
const PORT = 3030;

app.use(express.json());

const sendStartupMessage = async () => {
  const message = `hey zagros-coder , ur ${os.hostname} is online`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log('✅ Telegram message sent');
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error.message);
  }
};

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.post('/webhook', async (req, res) => {
  console.log('Webhook received:', JSON.stringify(req.body)); // Debug log

  const message = req.body.message;
  if (!message || !message.text) {
    return res.sendStatus(200);
  }

  const text = message.text.trim();
  const fromId = String(message.from.id);

  if (text === '/shutdown' && fromId === String(CHAT_ID)) {
    try {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: 'Shutting down the computer...'
      });
      exec('shutdown /s /t 0', (error) => {
        if (error) {
          console.error('Shutdown command failed:', error.message);
        }
      });
    } catch (err) {
      console.error('Failed to send shutdown reply:', err.message);
    }
  } else {
    try {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: message.chat.id,
        text: 'unknown command please check the commands list'
      });
    } catch (err) {
      console.error('Failed to send unknown command reply:', err.message);
    }
  }
  res.sendStatus(200);
});

app.listen(PORT, async () => {
  console.log(`🚀 Express server listening on port ${PORT}`);
  await sendStartupMessage();
  // handleTelegramUpdates(); // Remove polling, now using webhook
});