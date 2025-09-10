
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ExampleSentence, VocabWord, FillInTheBlankQuestion, GrammarDrill } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const createTeacherChat = (context: string): Chat => {
    const systemInstruction = `You are Profe Alex, a friendly, patient, and encouraging AI English teacher. Your students are young, Spanish-speaking A2-level learners using the "Open Day 3" study guide.
Your goal is to help them understand concepts simply and clearly.

RULES:
1.  **Persona**: Always be friendly, patient, and encouraging. Use emojis to seem approachable 😊.
2.  **Language**: Respond primarily in simple English. For key vocabulary or complex ideas, provide a brief Spanish translation in parentheses, like this: "This is a noun (un sustantivo)."
3.  **Simplicity**: Keep your explanations very simple and short. Use analogies and examples that a 10-12 year old would understand.
4.  **Context**: The student is currently studying the following topic: "${context}". Keep your answers focused on this topic unless the student clearly asks about something else.
5.  **Format**: Use short paragraphs and bullet points to make your answers easy to read.
6.  **Consejos de Práctica**: If the context is "Consejos de Práctica", your very first response must include a list of suggested activities. For example: "Podemos tener una conversación de rol (role-play), crear una historia juntos, ¡o te puedo dar un reto divertido (a fun challenge)!"

Start your very first message of the conversation with a friendly greeting like: "¡Hola! Soy Profe Alex. 😊 ¿En qué puedo ayudarte con '${context}'?". Do not repeat this greeting in subsequent messages.`;
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
          systemInstruction: systemInstruction,
      },
    });

    return chat;
};

export const generateExampleSentence = async (word: string): Promise<ExampleSentence | null> => {
    try {
        const prompt = `Generate a simple, clear example sentence for the English word "${word}" appropriate for an A2 level English learner. Provide the sentence in English and its Spanish translation.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        english: {
                            type: Type.STRING,
                            description: "The example sentence in English."
                        },
                        spanish: {
                            type: Type.STRING,
                            description: "The Spanish translation of the example sentence."
                        }
                    },
                    required: ["english", "spanish"]
                }
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as ExampleSentence;
        return data;

    } catch (error) {
        console.error("Error generating example sentence:", error);
        return null;
    }
};

export const generateQuizHint = async (word: string, unitTitle: string): Promise<string | null> => {
    try {
        const prompt = `Generate a short, creative, and educational hint in Spanish for the English vocabulary word "${word}" in the context of the unit titled "${unitTitle}". The hint should help a learner remember the meaning without giving the direct answer. Keep it to one concise sentence.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error generating quiz hint:", error);
        return "No se pudo generar una pista en este momento.";
    }
};


export const generateFillInTheBlankQuestion = async (word: VocabWord): Promise<Omit<FillInTheBlankQuestion, 'type' | 'questionWord'> | null> => {
    try {
        const prompt = `
Create a fill-in-the-blank question for an A2 level English learner.
The target English word is: "${word.en}"
The Spanish translation is: "${word.es}"

Instructions:
1. Write an English sentence that uses the word "${word.en}". The sentence must be simple and provide strong context so that "${word.en}" is the most logical word to fill the blank.
2. Replace "${word.en}" in the English sentence with "___". This is the 'englishSentence'.
3. Provide the COMPLETE Spanish translation of the original English sentence (with the Spanish equivalent of the word included, which is "${word.es}"). This Spanish sentence must act as a clear and direct clue, removing ambiguity. This is the 'spanishSentence'.
4. Confirm the correct English answer is exactly "${word.en}".
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        englishSentence: {
                            type: Type.STRING,
                            description: "The English sentence with '___' as a placeholder for the word."
                        },
                        spanishSentence: {
                            type: Type.STRING,
                            description: "The full Spanish translation of the complete English sentence, which serves as a clue."
                        },
                        correctAnswer: {
                            type: Type.STRING,
                            description: `The correct English word that fills the blank. Must be exactly '${word.en}'.`
                        }
                    },
                    required: ["englishSentence", "spanishSentence", "correctAnswer"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return {
            ...data,
            correctAnswer: word.en // Ensure the correct answer is the exact vocab word
        };

    } catch (error) {
        console.error("Error generating fill-in-the-blank question:", error);
        return null;
    }
};

export const generateGrammarDrill = async (grammarTopic: string, grammarExplanation: string, drillHistory: string[]): Promise<GrammarDrill | null> => {
    try {
        const prompt = `
Based on the following English grammar topic and explanation, create a single, simple, interactive drill for an A2 level learner.

Grammar Topic: "${grammarTopic}"

Explanation:
---
${grammarExplanation}
---

AVOID CREATING A DRILL SIMILAR TO THESE PREVIOUS EXAMPLES:
${drillHistory.join('\n- ')}
---

Create ONLY one of the following drill types: 'fill-in-the-blank', 'sentence-reordering', or 'multiple-choice'.
The drill must be directly related to the rules in the explanation and test a key concept. Keep sentences simple and create a NEW, unique exercise.

Provide the response in JSON format.
- "type": The type of drill.
- "instruction": A clear, concise instruction for the student in Spanish.
- "question": The question or sentence. For 'fill-in-the-blank', use '___'. For 'sentence-reordering', provide the Spanish translation as a hint.
- "options" (for multiple-choice): An array of 3-4 strings with possible answers. One must be correct. The correct answer MUST be one of the options.
- "words" (for sentence-reordering): An array of strings representing the words to be reordered.
- "correctAnswer": The exact correct answer as a string. For sentence-reordering, it's the correctly formed sentence.
- "explanation": A brief explanation in Spanish of why the answer is correct, referencing the grammar rule.
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: {
                            type: Type.STRING,
                            enum: ['fill-in-the-blank', 'sentence-reordering', 'multiple-choice'],
                        },
                        instruction: { type: Type.STRING },
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                        words: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                    },
                    required: ['type', 'instruction', 'question', 'correctAnswer', 'explanation']
                }
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        
        // Basic validation
        if (data.type === 'multiple-choice' && (!data.options || data.options.length === 0)) {
            throw new Error("Multiple choice question generated without options.");
        }
        if (data.type === 'sentence-reordering' && (!data.words || data.words.length === 0)) {
            throw new Error("Sentence reordering question generated without words.");
        }

        return data as GrammarDrill;

    } catch (error) {
        console.error("Error generating grammar drill:", error);
        return null;
    }
};

export const generateQuizFeedback = async (score: number, total: number, unitTitle: string): Promise<string> => {
    try {
        const percentage = (score / total) * 100;
        let performanceDescription = 'un buen esfuerzo';
        if (percentage >= 90) {
            performanceDescription = 'un resultado excelente';
        } else if (percentage >= 70) {
            performanceDescription = 'un muy buen resultado';
        } else if (percentage >= 50) {
            performanceDescription = 'un resultado sólido, ¡sigue practicando!';
        } else {
            performanceDescription = 'un comienzo, ¡no te rindas!';
        }

        const prompt = `Act as Profe Alex, a friendly and encouraging AI English teacher for A2 learners.
A student just completed a quiz for the unit "${unitTitle}" with a score of ${score} out of ${total}. This is ${performanceDescription}.
Write a short, positive, and encouraging feedback message in Spanish (1-2 sentences).
- Start with a positive phrase.
- Mention their score.
- Based on their performance, give a brief, encouraging comment.
- If the score is low, suggest reviewing the unit's key concepts in a supportive way.
- Keep it friendly and use an emoji. 😊`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating quiz feedback:", error);
        return `¡Buen trabajo! Completaste el cuestionario con una puntuación de ${score} de ${total}. ¡Sigue así!`;
    }
};

export const generatePronunciationTip = async (correctWord: string, spokenWord: string): Promise<string> => {
    try {
        const prompt = `An A2 English learner from a Spanish-speaking background was trying to say the word "${correctWord}" but the speech-to-text heard "${spokenWord}".
Generate a very short, simple, and encouraging pronunciation tip in Spanish to help them.
Focus on the most likely error (e.g., vowel sound, consonant sound).
Keep the tip to one sentence. Start with an encouraging phrase.
Example if correct is "ship" and spoken is "sheep": "¡Casi lo tienes! Intenta que el sonido de la 'i' sea más corto y rápido, como en 'isla'."`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating pronunciation tip:", error);
        return "Intenta de nuevo, enfocándote en la pronunciación de cada sílaba.";
    }
};