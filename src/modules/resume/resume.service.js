import { generateAIResponse } from "../../utils/aiHelper.js";

export const generateResumeAI = async ({ name, skills, experience, jobDescription }) => {
  const prompt = `
You are an expert resume writer.

Generate resume content in STRICT JSON format optimized for modern professional templates.

RULES:
- Output ONLY JSON (no explanation, no text outside JSON)
- Keep text concise and professional
- Use bullet points for experience
- Keep content visually balanced (max 2 lines per point)
- Avoid long paragraphs

FORMAT:
{
  "name": "",
  "title": "",
  "summary": "",
  "contact": {
    "phone": "",
    "email": "",
    "location": "",
    "website": ""
  },
  "skills": [],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "points": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "year": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "tech": []
    }
  ],
  "languages": []
}

USER DATA:
Name: ${name}
Skills: ${skills.join(", ")}
Experience: ${experience}
Job Description: ${jobDescription}

Generate a strong, professional resume tailored to the job description.
`;

  const aiText = await generateAIResponse(prompt);

  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { name, skills, experience };
  } catch {
    return { name, skills, experience };
  }
};
