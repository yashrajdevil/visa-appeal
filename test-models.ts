import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: "test" });
    console.log("gemini-1.5-flash YES");
  } catch(e: any) {
    console.log("gemini-1.5-flash NO", e.message);
  }
  
  try {
    const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "test" });
    console.log("gemini-2.5-flash YES");
  } catch(e: any) {
    console.log("gemini-2.5-flash NO", e.message);
  }
}
test();
