import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.project_key || process.env.PROJECT_KEY || process.env.GEMINI_API_KEY;

if (apiKey) {
  console.log("SUCCESS: Initializing Gemini SDK with configured API key (length:", apiKey.length, ")");
} else {
  console.log("WARNING: No valid API key detected. Continuing in Clinical Sandbox Mode.");
}

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

export const triageModel = "gemini-3.5-flash";

