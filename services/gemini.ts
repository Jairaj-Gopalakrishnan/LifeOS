
import { GoogleGenAI, Type } from "@google/genai";
import { SupportedLanguage, CEFRLevel } from "../types";

// Helper to safely get the AI client
const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey: apiKey || '' });
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
    'A1': 'Persona: A helpful neighbor. Constraints: Use present tense only, basic nouns (gaming/food), and 5-word maximum sentences.',
    'A2': 'Persona: A casual colleague. Constraints: Use past tense and basic connectors (but, because). Sentences under 10 words.',
    'B1': 'Persona: A strategic advisor. Constraints: Use conditional "what if" scenarios (e.g., gaming strategies).',
    'B2': 'Persona: An executive coach. Constraints: Use complex sub-clauses, professional idioms, and debate policy. High complexity.'
  };

  const helpNuance = level === 'B2' || level === 'B1' 
    ? 'Provide "nuance clues" explaining connotation rather than literal translation.' 
    : 'Provide full, simple literal translations and highlight basic grammar parts.';

  const systemInstruction = `You are a ${level}-level language coach for ${language}. 
  The user is an executive founder interested in Gaming, Education Systems, and Cinema.
  
  CORE MISSION:
  1. Follow level-specific constraints: ${levelInstructions[level]}.
  2. ALWAYS return a structured "help" object.
  3. ${helpNuance}
  
  RESPONSE JSON SCHEMA:
  {
    "reply": "The response in ${language}",
    "help": {
      "translation": "English translation",
      "slangNotes": "Explanation of context/terms",
      "grammarTip": "Grammar insight for ${level}",
      "nuanceClue": "Contextual hint (B1/B2 only)"
    }
  }`;

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
  const themes = [
    'the future of decentralized education',
    'advanced gaming strategy',
    'the philosophy of cinema',
    'strategic leadership'
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const selectedTheme = themes[dayOfYear % themes.length];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a ${level}-level paragraph in ${language} about ${selectedTheme}.`,
    config: {
      systemInstruction: "You are a specialized prose architect. Return only the raw text."
    }
  });
  return { text: response.text, theme: selectedTheme };
}

export async function getScaffoldedDrill(language: SupportedLanguage, level: CEFRLevel, vocabList: string[]) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Using vocabulary [${vocabList.join(', ')}], create a ${level} drill.`,
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
    contents: `Generate 3 executive content hooks for: ${topic}.`,
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
    contents: `Architect a 5-module course curriculum for "${title}" for ${audience}.`,
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
    contents: `Create 3 recipes using: ${ingredients}. Diet: ${diet}. Cuisine: ${cuisine}.`,
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
