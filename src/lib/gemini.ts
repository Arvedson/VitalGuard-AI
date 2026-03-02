import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function callGemini(prompt: string): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      console.warn("Gemini 2.0 Flash quota exceeded. Falling back to gemini-2.0-flash-lite...");
      try {
        const fallbackModel = client.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await fallbackModel.generateContent(prompt);
        return result.response.text();
      } catch (fallbackError) {
        console.error("Gemini fallback error:", fallbackError);
        return null;
      }
    }
    
    console.error("Gemini API error:", error);
    return null;
  }
}

export async function callGeminiWithFile(prompt: string, mimeType: string, base64Data: string): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;

  const filePart = {
    inlineData: {
      data: base64Data,
      mimeType
    }
  };

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([prompt, filePart]);
    return result.response.text();
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      console.warn("Gemini quota exceeded. Falling back to gemini-2.0-flash-lite...");
      try {
        const fallbackModel = client.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await fallbackModel.generateContent([prompt, filePart]);
        return result.response.text();
      } catch (fallbackError) {
        console.error("Gemini fallback error with file:", fallbackError);
        return null;
      }
    }
    
    console.error("Gemini API error with file:", error);
    return null;
  }
}
