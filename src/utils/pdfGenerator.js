import pdf from "html-pdf-node";

export const generatePDF = async (htmlContent) => {
  const pdfBuffer = await pdf.generatePdf(
    { content: htmlContent },
    {
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    }
  );
  return pdfBuffer;
};
