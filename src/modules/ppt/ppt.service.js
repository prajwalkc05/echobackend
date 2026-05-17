import PptxGenJS from "pptxgenjs";
import axios from "axios";
import { generateAIResponse } from "../../utils/aiHelper.js";
import { themes } from "./ppt.themes.js";
import { layouts } from "./ppt.layouts.js";

// Generate image from HuggingFace and return base64
export const generateSlideImage = async (keyword) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      { inputs: `professional presentation slide image, ${keyword}, clean, minimal, high quality` },
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
        responseType: "arraybuffer",
        timeout: 20000,
      }
    );
    const base64 = Buffer.from(response.data).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
};

export const generateSlidesAI = async (topic, slideCount, presentationType = "business", tone = "professional", audience = "general") => {
  const prompt = `
Create a professional ${presentationType} presentation about "${topic}".
Tone: ${tone}. Audience: ${audience}. Number of slides: ${slideCount}.

Return STRICT JSON array only (no explanation, no markdown):
[
  {
    "title": "",
    "layout": "cover-hero" | "split-left-text" | "grid-cards" | "stats-grid" | "timeline" | "bullets-image" | "results" | "team-grid" | "center-title" | "thank-you",
    "content": {
      "title": "",
      "subtitle": "",
      "description": "",
      "bullets": ["", ""],
      "cards": [{"title": "", "description": "", "icon": "emoji"}],
      "stats": [{"value": "", "label": "", "color": "#hex"}],
      "timeline": [{"step": "01", "title": "", "description": ""}],
      "team": [{"name": "", "role": ""}],
      "cta": ""
    },
    "imageKeyword": "short keyword for image generation"
  }
]

Rules:
- First slide must use "cover-hero" layout
- Last slide must use "thank-you" layout
- Make content highly professional, specific, and detailed
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

export const generateSlidesWithImages = async (topic, slideCount, presentationType, tone, audience) => {
  const slides = await generateSlidesAI(topic, slideCount, presentationType, tone, audience);

  // Generate images in parallel for slides that have imageKeyword
  const slidesWithImages = await Promise.all(
    slides.map(async (slide) => {
      if (slide.imageKeyword) {
        const imageData = await generateSlideImage(slide.imageKeyword);
        return { ...slide, imageData };
      }
      return slide;
    })
  );

  return slidesWithImages;
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
