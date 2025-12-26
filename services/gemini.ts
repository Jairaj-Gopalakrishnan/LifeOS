
import { GoogleGenAI, Type } from "@google/genai";
import { SupportedLanguage, CEFRLevel } from "../types";

// Ultra-defensive helper to get the API key without crashing the script
const safeGetApiKey = (): string => {
  try {
    // Check globalThis for process (standard for many bundlers/environments)
    // @ts-ignore
    const key = globalThis?.process?.env?.API_KEY || '';
    if (key) return key;
  } catch (e) {}
  
  // Fallback to empty string; the AI calls will fail gracefully later 
  // rather than crashing the entire app boot sequence.
  return '';
};

const getAI = () => {
  const apiKey = safeGetApiKey();
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates an immersive AI conversation response based on CEFR level and executive interests.
 */
export async function getLanguageImmersionResponse(
  message: string, 
  language: SupportedLanguage, 
  level: CEFRLevel,
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
) {
  const ai = getAI();
  const levelInstructions: Record<CEFRLevel, string> = {
    'A1': 'Persona: A helpful neighbor. Constraints: Use present tense only, basic nouns, 5-word max sentences.',
    'A2': 'Persona: A casual colleague. Constraints: Use past tense, basic connectors. 10-word max sentences.',
    'B1': 'Persona: A strategic advisor. Constraints: Use conditional scenarios and moderate complexity.',
    'B2': 'Persona: An executive coach. Constraints: Use complex sub-clauses and professional idioms.'
  };

  const helpNuance = level === 'B2' || level === 'B1' 
    ? 'Provide "nuance clues" explaining connotation.' 
    : 'Provide simple literal translations and basic grammar tips.';

  const systemInstruction = `You are a ${level}-level language coach for ${language}. 
  CORE MISSION:
  1. Follow level-specific constraints: ${levelInstructions[level]}.
  2. ALWAYS return a structured "help" object.
  3. ${helpNuance}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          help: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              slangNotes: { type: Type.STRING },
              grammarTip: { type: Type.STRING },
              nuanceClue: { type: Type.STRING }
            },
            required: ["reply", "help"]
          }
        },
        required: ["reply", "help"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getDailyReadingProse(language: SupportedLanguage, level: CEFRLevel) {
  const ai = getAI();
  const themes = ['future of education', 'gaming strategy', 'cinema philosophy', 'leadership'];
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const selectedTheme = themes[dayOfYear % themes.length];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a ${level}-level paragraph in ${language} about ${selectedTheme}.`,
    config: {
      systemInstruction: "Return only the raw text."
    }
  });
  return { text: response.text, theme: selectedTheme };
}

export async function getScaffoldedDrill(language: SupportedLanguage, level: CEFRLevel, vocabList: string[]) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a ${level} drill for ${language} using: ${vocabList.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          englishSentence: { type: Type.STRING },
          targetSentence: { type: Type.STRING },
          wordBank: { type: Type.ARRAY, items: { type: Type.STRING } },
          hint: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["englishSentence", "targetSentence", "wordBank", "hint"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function generateContentHooks(topic: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate 3 executive hooks for: ${topic}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            platform: { type: Type.STRING }
          },
          required: ["hook", "platform"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export async function generateCourseOutline(title: string, audience: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Outline a course: "${title}" for ${audience}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            moduleNumber: { type: Type.INTEGER },
            title: { type: Type.STRING },
            objective: { type: Type.STRING }
          },
          required: ["moduleNumber", "title", "objective"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}

export async function getAlchemistRecipes(ingredients: string, diet: string, cuisine: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create recipes with: ${ingredients}. Diet: ${diet}. Cuisine: ${cuisine}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            culture: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            protein: { type: Type.STRING },
            missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.STRING }
          },
          required: ["name", "culture", "prepTime", "protein", "missingIngredients", "instructions"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}
