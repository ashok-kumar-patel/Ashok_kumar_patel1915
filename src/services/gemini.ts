import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export const chatModel = "gemini-3.1-pro-preview";
export const imageModel = "gemini-2.5-flash-image";

export async function generateChatResponse(messages: { role: string; content: string }[]) {
  const response = await ai.models.generateContent({
    model: chatModel,
    contents: messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    })),
  });
  return response.text;
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [{ text: prompt }]
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function analyzeData(data: any, query: string) {
  const response = await ai.models.generateContent({
    model: chatModel,
    contents: `Analyze the following data and answer the query: ${query}\n\nData: ${JSON.stringify(data)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          chartData: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER }
              }
            } 
          }
        },
        required: ["analysis", "recommendations"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}
