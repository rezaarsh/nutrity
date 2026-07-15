import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeNutritionText = async (rawText) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" });

        const prompt = `
    Kamu adalah sistem AI penganalisis gizi. Ekstrak informasi dari teks OCR berikut.
    Teks OCR Mentah:
    "${rawText}"
    
    Aturan KETAT:
    1. Kembalikan HANYA format JSON.
    2. Isi dengan angka 0 jika gizi tidak ditemukan.
    
    Format wajib:
    {"kalori": 0, "karbohidrat": 0, "protein": 0, "lemak": 0, "gula": 0, "natrium": 0}
    `;

        const result = await model.generateContent(prompt);
        let textResult = result.response.text();

        console.log("BALASAN MENTAH GEMMA:", textResult);

        // LOGIKA BARU: Cari semua blok teks yang diawali '{' dan diakhiri '}'
        // [^{}]+ memastikan kita hanya mengambil objek JSON datar, bukan paragraf panjang
        const jsonMatches = textResult.match(/\{[^{}]+\}/g);

        if (jsonMatches && jsonMatches.length > 0) {
            // Ambil tebakan JSON yang paling TERAKHIR dari monolog AI
            const cleanJson = jsonMatches[jsonMatches.length - 1];
            console.log("JSON BERSIH YANG DIAMBIL:", cleanJson);

            return JSON.parse(cleanJson);
        } else {
            throw new Error("Gagal menemukan struktur JSON di dalam balasan AI.");
        }

    } catch (error) {
        console.error("Gagal terhubung ke AI:", error);
        throw error;
    }
};