import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fetch } from 'cross-fetch';

// Load .env file from project root
const envPath = resolve(__dirname, '../.env'); // Ensure this path is correct
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.debug('Environment variables loaded successfully from', envPath);
    console.debug('API Keys available:', {
        OpenRouter: !!process.env.OPENROUTER_API_KEY,
        HuggingFace: !!process.env.HUGGINGFACE_API_KEY,
        Nvidia: !!process.env.NVIDIA_API_KEY,
        Gemini: !!process.env.GEMINI_API_KEY  // Add Gemini check
    });
}

// Make fetch available globally
if (!globalThis.fetch) {
    (globalThis as any).fetch = fetch;
}