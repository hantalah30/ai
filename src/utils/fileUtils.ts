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

// **FITUR BARU: Fungsi untuk mengekstrak teks dari file**
export const extractTextFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Daftar tipe MIME berbasis teks yang didukung
    const supportedTextTypes = [
      "text/plain",
      "text/markdown",
      "text/html",
      "text/css",
      "text/javascript",
      "application/javascript",
      "text/x-python",
      "application/x-python-code",
      "application/json",
      "text/xml",
    ];

    if (
      supportedTextTypes.includes(file.type) ||
      file.name.endsWith(".py") ||
      file.name.endsWith(".js") ||
      file.name.endsWith(".ts") ||
      file.name.endsWith(".css") ||
      file.name.endsWith(".html")
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => {
        reject(new Error("Failed to read file: " + error));
      };
      reader.readAsText(file);
    } else {
      // Jika bukan tipe teks yang didukung, tolak promise
      reject(
        new Error(`Unsupported file type for text extraction: ${file.type}`)
      );
    }
  });
};
