import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { env } from '../config/env';
import { IMessage } from '../models/Message';

// Initialize APIs if keys are present
const geminiClient = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;
const openaiClient = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const groqClient = env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null;

// Helpers to format messages
const formatMessages = (messages: IMessage[]): string => {
  return messages
    .map((msg, index) => {
      const time = msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString();
      return `[${index + 1}] ID: ${msg._id} | Time: ${time} | ${msg.nickname}: ${msg.text}`;
    })
    .join('\n');
};

// Safe JSON extraction helper
const extractJSON = (text: string): any => {
  try {
    // Find JSON block if wrapped in markdown code fences
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const cleanedText = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse AI response as JSON. Original text:', text);
    throw new Error('LLM did not return valid JSON');
  }
};

/**
 * Call the active LLM provider to generate text.
 */
const callLLM = async (prompt: string, expectJson = false): Promise<string> => {
  if (geminiClient) {
    console.log('Calling Gemini API...');
    const config: any = {};
    if (expectJson) {
      config.responseMimeType = 'application/json';
    }
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config,
    });
    if (!response.text) {
      throw new Error('Gemini API returned an empty response');
    }
    return response.text;
  }

  if (openaiClient) {
    console.log('Calling OpenAI API...');
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API returned an empty response');
    }
    return content;
  }

  if (groqClient) {
    console.log('Calling Groq API...');
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned an empty response');
    }
    return content;
  }

  throw new Error('No AI provider configured. Please provide GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in .env');
};

/**
 * Summarizes the last 20-30 messages of a chat room.
 */
export const generateSummary = async (messages: IMessage[]): Promise<string> => {
  if (messages.length === 0) {
    return 'There are no messages in the chat history to summarize.';
  }

  const formattedMessages = formatMessages(messages);
  const prompt = `
You are summarizing a live group chat. Below are the last ${messages.length} messages.
Write a concise 3-5 sentence summary capturing key topics, decisions, and who said what if relevant.
Do not invent information not present in the messages.

Messages:
${formattedMessages}
`;

  return await callLLM(prompt, false);
};

/**
 * Answers a natural-language question using message log as context.
 */
export interface SearchResult {
  answer: string;
  relevantMessageIds: string[];
}

export const searchChatHistory = async (
  messages: IMessage[],
  query: string
): Promise<SearchResult> => {
  if (messages.length === 0) {
    return {
      answer: 'There are no messages in the chat history to search.',
      relevantMessageIds: [],
    };
  }

  const formattedMessages = formatMessages(messages);
  const prompt = `
You are answering a question about a group chat's history using only the messages provided below.
Messages (numbered, with nickname, ID, and timestamp):
${formattedMessages}

Question: "${query}"

Respond in JSON matching this exact structure:
{
  "answer": "<direct answer to the question, referencing who said what>",
  "relevantMessageIds": ["<id1>", "<id2>", ...]
}
If nothing in the messages is relevant to the question, say so honestly in the "answer" field and return an empty array in "relevantMessageIds".
`;

  const rawOutput = await callLLM(prompt, true);
  return extractJSON(rawOutput) as SearchResult;
};
