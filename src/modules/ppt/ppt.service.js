import PptxGenJS from "pptxgenjs";
import { generateAIResponse } from "../../utils/aiHelper.js";
import { themes } from "./ppt.themes.js";
import { layouts } from "./ppt.layouts.js";

export const generateSlidesAI = async (topic, slideCount) => {
  const prompt = `
Create a presentation outline.

Topic: ${topic}
Number of slides: ${slideCount}

Return STRICT JSON array only (no explanation, no markdown):
[
  {
    "title": "",
    "points": ["", "", ""],
    "image": "suggested keyword for image"
  }
]

Rules:
- Each slide must have a clear title
- Each slide must have 3-5 concise bullet points
- image field: one short keyword describing a relevant image
- Output ONLY the JSON array
`;

  const text = await generateAIResponse(prompt);

  try {
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
};

export const createPPT = async (slidesData, themeName = "light", layoutName = "titleContent") => {
  const pptx = new PptxGenJS();
  const theme = themes[themeName] || themes.light;
  const layoutFn = layouts[layoutName] || layouts.titleContent;

  pptx.layout = "LAYOUT_16x9";

  // Title slide (first slide)
  const titleSlide = pptx.addSlide();
  layouts.titleOnly(titleSlide, slidesData[0], theme, pptx);

  // Content slides
  slidesData.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    layoutFn(slide, slideData, theme, pptx, index, slidesData.length);
  });

  return await pptx.write("nodebuffer");
};
