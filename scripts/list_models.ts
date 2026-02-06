
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  const ai = getAI();
  try {
    const response = await ai.models.list();
    console.log("Available Models:");
    for await (const model of response) {
      const methods = model.supportedGenerationMethods ? model.supportedGenerationMethods.join(', ') : 'unknown';
      console.log(`- ${model.name}: ${methods}`);
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
