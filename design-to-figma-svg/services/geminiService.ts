/**
 * 阿里云百炼（通义千问）服务
 * 使用 OpenAI 兼容接口调用通义千问视觉模型
 */

const DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

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
 * 使用阿里云百炼通义千问 VL 模型将图片转换为 SVG
 */
export const generateSvgFromImage = async (
  imageBase64: string
): Promise<string> => {
  try {
    // Vite 前端环境使用 import.meta.env，需要 VITE_ 前缀
    const apiKey = import.meta.env.VITE_API_KEY;
    
    console.log("[v0] API Key 是否存在:", !!apiKey);
    
    if (!apiKey) {
      throw new Error("请设置 VITE_API_KEY 环境变量（阿里云百炼 API Key）");
    }

    const mimeType = getMimeType(imageBase64);
    const cleanData = cleanBase64(imageBase64);
    const imageDataUrl = `data:${mimeType};base64,${cleanData}`;

    const systemPrompt = `你是一位专业的前端工程师和 UI 设计师，专精于矢量图形。
你的任务是将提供的 UI 截图转换为像素级精确、高保真的 SVG 表示。

要求：
1. **布局与定位**：深入分析布局。使用绝对定位或带变换的分组（<g>）来精确复制元素的位置。
2. **字体**：使用标准网络安全字体（Arial、Helvetica、sans-serif）来尽可能匹配图像。准确估计字重和字号。
3. **颜色**：精确提取图像中的十六进制颜色。如有渐变也要处理。
4. **形状**：准确复制圆角（rx、ry）、边框（stroke）和阴影（filter dropshadow）。
5. **输出格式**：只返回原始 SVG 代码。不要用 markdown 代码块包裹。不要包含任何解释文字。直接以 <svg ...> 开始，以 </svg> 结束。
6. **兼容性**：确保 SVG 经过优化，可以直接粘贴到 Figma 中（干净的路径、分组的元素）。
7. **尺寸**：设置 SVG viewbox 以匹配输入图像的大致宽高比。`;

    const response = await fetch(`${DASHSCOPE_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-vl-max", // 通义千问视觉模型
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: systemPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error("[v0] API 响应错误:", response.status, errorText);
      
      if (response.status === 401 || errorText.includes('InvalidApiKey') || errorText.includes('Unauthorized')) {
        throw new Error("API 密钥无效，请检查您的阿里云百炼 API_KEY");
      }
      if (response.status === 403 || errorText.includes('NoPermission')) {
        throw new Error("API 密钥没有访问权限，请检查是否开通了通义千问 VL 服务");
      }
      if (response.status === 429) {
        throw new Error("请求过于频繁，请稍后再试");
      }
      if (response.status === 400) {
        throw new Error("请求参数错误，请检查图片格式");
      }
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    let text = data.choices?.[0]?.message?.content || '';

    // 清理：移除 markdown 代码块（如果模型忽略了指令）
    text = text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '');
    
    // 确保返回的是有效的 SVG
    if (!text.includes('<svg')) {
      throw new Error("模型未能生成有效的 SVG，请重试");
    }
    
    return text.trim();

  } catch (error) {
    console.error("[v0] 阿里云百炼 API 错误:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("生成 SVG 失败，请重试");
  }
};
