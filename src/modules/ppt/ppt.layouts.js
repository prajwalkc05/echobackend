export const layouts = {
  titleOnly: (slide, data, theme, pptx) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: "100%",
      fill: { color: theme.bg },
      line: { color: theme.bg },
    });
    slide.addText(data.title, {
      x: 1, y: 2, w: 8, h: 1.5,
      fontSize: 36,
      bold: true,
      align: "center",
      color: theme.titleColor,
      fontFace: "Arial",
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 3.5, y: 3.2, w: 3, h: 0.06,
      fill: { color: theme.accent },
      line: { color: theme.accent },
    });
  },

  titleContent: (slide, data, theme, pptx, index, total) => {
    slide.background = { color: theme.bg };

    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.08,
      fill: { color: theme.accent },
      line: { color: theme.accent },
    });

    // Title
    slide.addText(data.title, {
      x: 0.5, y: 0.3, w: 9, h: 0.9,
      fontSize: 28,
      bold: true,
      color: theme.titleColor,
      fontFace: "Arial",
    });

    // Divider
    slide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.25, w: 9, h: 0,
      line: { color: theme.accent, width: 1.5 },
    });

    // Bullet points
    const bullets = (data.points || []).map(p => ({
      text: p,
      options: { bullet: { type: "bullet" }, fontSize: 16, color: theme.textColor, breakLine: true, paraSpaceAfter: 6 },
    }));

    slide.addText(bullets, {
      x: 0.5, y: 1.4, w: 9, h: 3.2,
      fontFace: "Arial",
      valign: "top",
    });

    // Slide number
    slide.addText(`${index + 1} / ${total}`, {
      x: 8.5, y: 4.8, w: 1, h: 0.3,
      fontSize: 9,
      color: theme.slideNumColor,
      align: "right",
    });
  },

  titleImage: (slide, data, theme, pptx, index, total) => {
    slide.background = { color: theme.bg };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.08,
      fill: { color: theme.accent },
      line: { color: theme.accent },
    });

    slide.addText(data.title, {
      x: 0.5, y: 0.3, w: 5.5, h: 0.9,
      fontSize: 26,
      bold: true,
      color: theme.titleColor,
      fontFace: "Arial",
    });

    slide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.25, w: 5.5, h: 0,
      line: { color: theme.accent, width: 1.5 },
    });

    const bullets = (data.points || []).map(p => ({
      text: p,
      options: { bullet: { type: "bullet" }, fontSize: 14, color: theme.textColor, breakLine: true, paraSpaceAfter: 5 },
    }));

    slide.addText(bullets, {
      x: 0.5, y: 1.4, w: 5.5, h: 3.2,
      fontFace: "Arial",
      valign: "top",
    });

    // Placeholder box for image area
    slide.addShape(pptx.ShapeType.rect, {
      x: 6.3, y: 1.2, w: 3, h: 2.5,
      fill: { color: theme.accent + "33" },
      line: { color: theme.accent, width: 1 },
    });

    slide.addText(data.image || "Image", {
      x: 6.3, y: 2.2, w: 3, h: 0.5,
      fontSize: 11,
      color: theme.accent,
      align: "center",
    });

    slide.addText(`${index + 1} / ${total}`, {
      x: 8.5, y: 4.8, w: 1, h: 0.3,
      fontSize: 9,
      color: theme.slideNumColor,
      align: "right",
    });
  },
};
