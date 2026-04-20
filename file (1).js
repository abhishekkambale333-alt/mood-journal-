const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Put HTML/CSS/JS in /public

const BOT_TOKEN = process.env.BOT_TOKEN;

// Webhook endpoint for bot updates
app.post('/webhook', async (req, res) => {
  const update = req.body;
  
  // Handle web_app_data from Mini App
  if (update.message?.web_app_data) {
    const chatId = update.message.chat.id;
    const data = JSON.parse(update.message.web_app_data.data);
    
    if (data.action === 'mood_logged') {
      await sendMessage(chatId, `${data.emoji} Mood logged: ${data.mood}\n\nKeep tracking — self-awareness is the first step to wellbeing.`);
    }
  }
  
  // Handle /start command
  if (update.message?.text === '/start') {
    const chatId = update.message.chat.id;
    await sendMessage(chatId, 'Welcome to Mood Journal! 📔\n\nTap the menu button below to log how you\'re feeling.', {
      reply_markup: {
        inline_keyboard: [[
          { text: '📔 Open Journal', web_app: { url: process.env.MINI_APP_URL } }
        ]]
      }
    });
  }
  
  res.sendStatus(200);
});

async function sendMessage(chatId, text, extra = {}) {
  await fetch(`[api.telegram.org](https://api.telegram.org/bot${BOT_TOKEN}/sendMessage)`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, ...extra })
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
