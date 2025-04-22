// ollama.js
const axios = require('axios');

async function getOllamaResponse(prompt) {
  const response = await axios.post(
    'http://localhost:11434/api/generate',
    {
      model: 'llama3.2',
      prompt,
      stream: false,
    }
  );
  return response.data.response;
}

module.exports = getOllamaResponse;
