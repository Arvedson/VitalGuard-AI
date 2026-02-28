const dotenv = require('dotenv');
dotenv.config({ path: 'c:\\Users\\arved\\OneDrive\\Desktop\\main\\.env' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
        console.error("Failed to fetch:", response.status, response.statusText);
        const text = await response.text();
        console.error(text);
        return;
    }
    const data = await response.json();
    console.log("Available Models:");
    data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
  } catch (e) {
    console.error(e);
  }
}

listModels();
