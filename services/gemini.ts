
import { GoogleGenAI, Type } from "@google/genai";
import { SupportedLanguage, CEFRLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getLanguageImmersionResponse(
  message: string, 
  language: SupportedLanguage, 
  level: CEFRLevel,
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
) {
  const levelInstructions: Record<CEFRLevel, string> = {
    'A1': 'Use ONLY present tense, basic nouns (gaming/food), and 5-word maximum sentences. Be extremely simple.',
    'A2': 'Use basic past tense (perfectum/passé composé) and common connectors (but, because). Keep sentences under 10 words.',
    'B1': 'Introduce conditional "what if" scenarios. Use moderate complexity. Ask questions that prompt longer answers.',
    'B2': 'Use complex sub-clauses, professional idioms, and debate-style language. Use high-level vocabulary related to global education or movie critiques.'
  };

  const helpNuance = level === 'B2' || level === 'B1' 
    ? 'Focus on "clue-based" explanations and nuance rather than just literal translations.' 
    : 'Provide full, simple literal translations and basic grammar rules.';

  const systemInstruction = `You are a ${level}-level language coach for ${language}. 
  The user is an executive/founder interested in Gaming (LoL/D&D), Movies, Music, and Global Education. 
  
  CORE MISSION:
  1. Strictly adhere to ${level} level constraints: ${levelInstructions[level]}.
  2. For every response, provide a "help" object.
  3. ${helpNuance}
  
  JSON FORMAT REQUIREMENTS:
  {
    "reply": "The response in ${language}",
    "help": {
      "translation": "English translation",
      "slangNotes": "Explanation of terms/context",
      "grammarTip": "A ${level}-specific grammar insight",
      "nuanceClue": "Optional deeper meaning or hint for B1/B2"
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
            required: ["translation", "slangNotes", "grammarTip"]
          }
        },
        required: ["reply", "help"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getDailyReadingProse(language: SupportedLanguage, level: CEFRLevel) {
  const themes = [
    'a League of Legends match recap',
    'a review of a popular movie',
    'an essay on global education evolution',
    'a D&D strategy breakdown'
  ];
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const selectedTheme = themes[dayOfYear % themes.length];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a short ${level}-level reading paragraph in ${language} about ${selectedTheme}. 
    A1: Very simple, present tense. 
    B2: Complex, descriptive, academic.`,
    config: {
      systemInstruction: `You are a B2 language coach specializing in ${level} text generation. Return only the text.`
    }
  });
  return { text: response.text, theme: selectedTheme };
}

export async function getScaffoldedDrill(language: SupportedLanguage, level: CEFRLevel, vocabList: string[]) {
  const isBeginner = level === 'A1' || level === 'A2';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a ${level}-level language drill in ${language} using: [${vocabList.join(', ')}].
    If ${isBeginner}, provide a 'word drop' multiple choice style with 'options'.
    If B1/B2, focus on full sentence construction or 'correction' challenges.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          englishSentence: { type: Type.STRING },
          targetSentence: { type: Type.STRING },
          wordBank: { type: Type.ARRAY, items: { type: Type.STRING } },
          hint: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } } // For A1/A2 choice
        },
        required: ["englishSentence", "targetSentence", "wordBank", "hint"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function generateContentHooks(topic: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 high-impact executive social media hooks for the topic: ${topic}. 
    Provide one for LinkedIn and two for Twitter/X.`,
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Design a high-level 5-module course outline for: ${title}, specifically architected for a ${audience} target audience.`,
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a culinary alchemist. Create 3 creative recipes using: ${ingredients}. 
    Dietary restriction: ${diet}. Preferred cuisine: ${cuisine}.
    Focus on high protein and efficient prep.`,
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
