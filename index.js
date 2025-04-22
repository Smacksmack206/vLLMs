require('dotenv').config();
const express = require('express');
const getOpenAIResponse = require('./openai');
const getOllamaResponse = require('./ollama');
const textToSpeech = require('./elevenlabs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public'))); // serve HTML

app.post('/api/respond', async (req, res) => {
  const { prompt, useLocal } = req.body;

  try {
    const aiResponse = useLocal
      ? await getOllamaResponse(prompt)
      : await getOpenAIResponse(prompt);

    const audioPath = path.join(__dirname, 'static', 'response.mp3');
    await textToSpeech(aiResponse, audioPath);

    res.json({
      text: aiResponse,
      audioUrl: '/static/response.mp3',
    });

    // Optionally play it via host (WSL-only)
    if (process.platform === 'linux') {
      const winPath = execSync(`wslpath -w "${audioPath}"`).toString().trim();
      execSync(`cmd.exe /c start "" "${winPath}"`);
    }
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
