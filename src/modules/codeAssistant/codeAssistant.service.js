import { generateAIResponse } from "../../utils/aiHelper.js";

const prompts = {
  generate: (input, language) =>
    `You are an expert ${language} developer. Generate clean, well-commented ${language} code for the following requirement:\n\n${input}\n\nReturn only the code with brief inline comments.`,

  explain: (input, language) =>
    `You are a coding tutor. Explain the following ${language} code in simple terms, line by line where needed:\n\n${input}`,

  debug: (input, language) =>
    `You are an expert ${language} debugger. Find and fix all bugs in the following code. Return the fixed code and explain what was wrong:\n\n${input}`,

  review: (input, language) =>
    `You are a senior ${language} developer. Review the following code for quality, performance, security, and best practices. Give specific suggestions:\n\n${input}`,
};

export const runCodeAssistant = async (action, input, language = "javascript") => {
  const promptFn = prompts[action];
  if (!promptFn) throw new Error(`Invalid action: ${action}`);
  return await generateAIResponse(promptFn(input, language));
};
