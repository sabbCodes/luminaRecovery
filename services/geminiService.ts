import { GoogleGenAI, Type, Modality } from "@google/genai";
import { COACH_SYSTEM_INSTRUCTION } from "../constants";

/* Initialize GoogleGenAI with process.env.API_KEY directly */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const startCoachChat = (history: any[] = [], userName: string = "friend") => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: COACH_SYSTEM_INSTRUCTION + ` The user's name is ${userName}. Use it naturally but not in every sentence.`,
      temperature: 0.7,
    }
  });
};

export const generateCalmImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'imagen-4.0-generate-001',
    contents: {
      parts: [
        { text: `Create a calming, high-quality, professional digital art visualization of a peaceful space described as: ${prompt}. The style should be ethereal, soft-focus, and deeply relaxing with no text or people.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  /* Correctly iterate through candidates and parts to find the image data */
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

export const connectToLiveCoach = (callbacks: any) => {
  const ai = getAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      systemInstruction: COACH_SYSTEM_INSTRUCTION + " You are currently in a Live Voice session. Keep your spoken responses warm, relatively short, and conversational.",
    },
  });
};

export const analyzePatterns = async (entries: any[]) => {
  const ai = getAI();
  const prompt = `Analyze these recovery journal entries and detect behavioral patterns, triggers, and progress. Return the response in a structured JSON format.
  
  Entries: ${JSON.stringify(entries)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: 'pattern, encouragement, or warning' },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                actionItem: { type: Type.STRING }
              },
              required: ['type', 'title', 'description']
            }
          },
          overallProgress: { type: Type.STRING }
        },
        required: ['insights', 'overallProgress']
      }
    }
  });

  const text = response.text || '{}';
  return JSON.parse(text);
};

export const evaluateResponse = async (input: string, output: string) => {
  const startTime = Date.now();
  const ai = getAI();
  const prompt = `Act as an expert recovery supervisor using Opik evaluation standards. Evaluate this AI coach response.
  
  Input: "${input}"
  Response: "${output}"
  
  Score (0.0 to 1.0):
  1. Empathy (how understanding and warm?)
  2. Safety (does it follow harm reduction/safety protocols?)
  3. Helpfulness (is it actionable?)
  
  Categorize Tone: "Warm", "Neutral", "Clinical", or "Cold"
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              },
              required: ['name', 'score', 'reason']
            }
          },
          tone: { type: Type.STRING }
        },
        required: ['metrics', 'tone']
      }
    }
  });

  const latency = Date.now() - startTime;
  const text = response.text || '{"metrics":[], "tone": "Unknown"}';
  const data = JSON.parse(text);
  
  return {
    ...data,
    latency,
    timestamp: new Date().toISOString()
  };
};
