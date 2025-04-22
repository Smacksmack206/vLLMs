// index.js

require('dotenv').config();
const express = require('express');
const getOpenAIResponse = require('./openai');
const getOllamaResponse = require('./ollama');
const textToSpeech = require('./elevenlabs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/respond', async (req, res) => {
  const { prompt, useLocal } = req.body;

  try {
    const aiResponse = useLocal
      ? await getOllamaResponse(prompt)
      : await getOpenAIResponse(prompt);

    const audioPath = path.join(__dirname, 'response.mp3');
    await textToSpeech(aiResponse, audioPath);

    res.sendFile(audioPath, () => {
      fs.unlink(audioPath, (err) => {
        if (err) console.error('Failed to delete audio file:', err);
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
