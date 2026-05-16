import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const geminiService = {
  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    const ai = getAI();
    
    // Using gemini-3-flash-preview as recommended for basic chat
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a helpful Career Assistant for a job portal called 'CareerHub'. You help students with job searching, resume tips, and career advice. For employers, you help with job post optimization and candidate screening advice. Keep responses concise and professional.",
      },
      history: history as any,
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  },

  async getSmartMatchSuggestions(userProfile: any, availableJobs: any[]) {
    const ai = getAI();
    
    const prompt = `
      User Profile: ${JSON.stringify(userProfile)}
      Available Jobs: ${JSON.stringify(availableJobs.map(j => ({ id: j.id, title: j.title, category: j.category, skills: j.description })))}
      
      Based on the user's skills and experience, recommend the top 3 jobs. Return ONLY a JSON array of job IDs.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    try {
      return JSON.parse(result.text || "[]");
    } catch (e) {
      console.error("Failed to parse smart match suggestions", e);
      return [];
    }
  }
};
