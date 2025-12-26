
import { GoogleGenAI, Type } from "@google/genai";
import { SupportedLanguage, CEFRLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an immersive AI conversation response based on CEFR level and executive interests.
 */
export async function getLanguageImmersionResponse(
  message: string, 
  language: SupportedLanguage, 
  level: CEFRLevel,
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
) {
  const levelInstructions: Record<CEFRLevel, string> = {
    'A1': 'Persona: A helpful neighbor. Constraints: Use present tense only, basic nouns (gaming/food), and 5-word maximum sentences. Vocabulary: Beginner level.',
    'A2': 'Persona: A casual colleague. Constraints: Use past tense and basic connectors (but, because). Sentences under 10 words.',
    'B1': 'Persona: A strategic advisor. Constraints: Use conditional "what if" scenarios (e.g., gaming strategies). Moderate complexity.',
    'B2': 'Persona: An executive coach. Constraints: Use complex sub-clauses, professional idioms, and debate education policy or critiques. High complexity.'
  };

  const helpNuance = level === 'B2' || level === 'B1' 
    ? 'Provide "nuance clues" that explain the connotation rather than literal translation. Help the user "feel" the language.' 
    : 'Provide full, simple literal translations and highlight basic grammar parts.';

  const systemInstruction = `You are a ${level}-level language coach for ${language}. 
  The user is an executive founder interested in Gaming (League of Legends/D&D), Education Systems, and Cinema.
  
  CORE MISSION:
  1. Follow these level-specific constraints: ${levelInstructions[level]}.
  2. ALWAYS return a structured "help" object to act as the English Safety Net.
  3. ${helpNuance}
  
  RESPONSE JSON SCHEMA:
  {
    "reply": "The response in ${language}",
    "help": {
      "translation": "Literal or natural English translation",
      "slangNotes": "Explanation of gaming terms or idioms used",
      "grammarTip": "A grammar insight relevant to ${level}",
      "nuanceClue": "Contextual hint (mandatory for B1/B2)"
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

/**
 * Fetches a daily reading paragraph synced with the current date and CEFR level.
 */
export async function getDailyReadingProse(language: SupportedLanguage, level: CEFRLevel) {
  const themes = [
    'the future of decentralized education',
    'advanced gaming strategy in high-stakes matches',
    'the philosophy of cinema in the 21st century',
    'strategic leadership in chaotic environments'
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const selectedTheme = themes[dayOfYear % themes.length];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a ${level}-level paragraph in ${language} about ${selectedTheme}. 
    A1: Present tense, very short sentences. 
    B2: Rich vocabulary, academic tone.`,
    config: {
      systemInstruction: "You are a specialized prose architect. Return only the raw text in the target language."
    }
  });
  return { text: response.text, theme: selectedTheme };
}

/**
 * Generates a dynamic CEFR-appropriate drill.
 */
export async function getScaffoldedDrill(language: SupportedLanguage, level: CEFRLevel, vocabList: string[]) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Using vocabulary like [${vocabList.join(', ')}], create a ${level} drill. 
    If A1/A2, provide 4 multiple choice options. If B1/B2, focus on sentence reconstruction.`,
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

/**
 * Brand Studio: Content Hooks Generation
 */
export async function generateContentHooks(topic: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate 3 high-impact executive social media hooks for: ${topic}. Target LinkedIn and Twitter/X.`,
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

/**
 * Brand Studio: Architect a course curriculum.
 */
export async function generateCourseOutline(title: string, audience: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Architect a 5-module course curriculum for "${title}" specifically for a ${audience} audience.`,
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

/**
 * Health & Fuel: Recipe Alchemy.
 */
export async function getAlchemistRecipes(ingredients: string, diet: string, cuisine: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create 3 recipes using: ${ingredients}. Diet: ${diet}. Cuisine: ${cuisine}. Optimize for protein and efficiency.`,
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
