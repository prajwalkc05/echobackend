import { generateAIResponse } from "../../utils/aiHelper.js";

export const generateStudyPlanAI = async ({ subject, topics, hoursPerDay }) => {
  const prompt = `
Create a ${topics.length}-day study plan.

Subject: ${subject}
Topics: ${topics.join(", ")}
Available time per day: ${hoursPerDay} hours

Format:
Day 1:
- Task 1
- Task 2

Day 2:
...
`;
  return await generateAIResponse(prompt);
};
