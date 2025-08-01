// src/utils/fileUtils.ts

import { Part } from "@google/generative-ai";

// Fungsi untuk mengubah file menjadi format yang bisa dikirim ke Gemini API
export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Mengambil hanya bagian base64 dari data URL
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(",")[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};
