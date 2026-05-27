import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Using gemini-3-pro-preview for better coding and spatial reasoning capabilities
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a base64 string (including data URI prefix) to raw base64.
 */
const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

/**
 * Helper to extract mime type
 */
const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/png';
};

/**
 * Sends the image to Gemini and requests an SVG representation.
 */
export const generateSvgFromImage = async (
  imageBase64: string
): Promise<string> => {
  try {
    const cleanData = cleanBase64(imageBase64);
    const mimeType = getMimeType(imageBase64);

    const systemPrompt = `
      You are an expert Frontend Engineer and UI Designer specialized in vector graphics.
      Your task is to convert the provided UI screenshot into a pixel-perfect, high-fidelity SVG representation.
      
      Requirements:
      1.  **Layout & Positioning:** Analyze the layout deeply. Use absolute positioning or groups (<g>) with transforms to replicate the exact placement of elements.
      2.  **Typography:** Use standard web-safe fonts (Arial, Helvetica, sans-serif) that closely match the image. Estimate font weights and sizes accurately.
      3.  **Colors:** Sample the hex colors from the image exactly. Handle gradients if present.
      4.  **Shapes:** Replicate rounded corners (rx, ry), borders (stroke), and shadows (filter dropshadow) accurately.
      5.  **Output Format:** Return ONLY the raw SVG code. Do not wrap it in markdown code blocks (like \`\`\`xml). Do not include any explanation text. Start directly with <svg ...> and end with </svg>.
      6.  **Compatibility:** Ensure the SVG is optimized for copy-pasting into Figma (clean paths, grouped elements).
      7.  **Dimensions:** Set the SVG viewbox to match the approximate aspect ratio of the input image.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-pro', // Using latest Pro model for complex reasoning
      contents: {
        role: 'user',
        parts: [
          {
            text: systemPrompt
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanData
            }
          }
        ]
      },
      config: {
        temperature: 0.2, // Low temperature for precision
      }
    });

    let text = response.text || '';

    // Cleanup: Remove markdown code blocks if the model ignores the instruction
    text = text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '');
    
    return text.trim();

  } catch (error) {
    console.error("[v0] Gemini API Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('API')) {
        throw new Error("API 密钥无效或配置错误");
      }
      if (error.message.includes('429')) {
        throw new Error("请求过于频繁，请稍后再试");
      }
      if (error.message.includes('model')) {
        throw new Error("模型不可用，请检查 API 配置");
      }
      throw new Error(`生成失败: ${error.message}`);
    }
    
    throw new Error("生成SVG失败，请重试");
  }
};
