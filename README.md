# llm_fallbackJS 🤖

A robust TypeScript library for LLM API management with automatic fallback support. Keep your AI-powered applications running smoothly even when primary providers fail.

## Features ✨

- 🔄 Automatic failover between multiple LLM providers
- 🎯 Built-in support for popular LLM APIs:
  - OpenRouter (with Mistral 7B Instruct)
  - HuggingFace (featuring Mistral-Nemo-Instruct-2407)
  - NVIDIA AI (with Llama 3.3 70B)
  - Google's Gemini 1.5
- ⚡ Easy integration with existing projects
- 🛠️ Configurable options for each provider
- 🔑 Simple API key management through environment variables

## Project Structure 📁

```
your-project/              # Your main project directory
├── llm_fallbackJS/       # This module
│   ├── client.ts         # Main client implementation
│   ├── providers.ts      # LLM provider implementations
│   ├── exceptions.ts     # Custom error definitions
│   ├── index.ts         # Public API exports
│   ├── utils.ts         # Utility functions
│   ├── package.json     # Dependencies and project config
│   └── README.md        # This documentation
├── .env                 # Your API keys (create this)
└── your-code.ts        # Your implementation
```

## Installation 📦

```bash
# Clone the repository into your project
git clone https://github.com/Chungus1310/llm_fallbackJS.git

# Install dependencies
cd llm_fallbackJS
npm install
```

## Setup 🚀

1. Create a `.env` file in your project root:

```env
OPENROUTER_API_KEY=your_openrouter_key
HUGGINGFACE_API_KEY=your_huggingface_key
NVIDIA_API_KEY=your_nvidia_key
GEMINI_API_KEY=your_gemini_key
```

2. Import and use in your project:

```typescript
import { LLMClient } from './llm_fallbackJS';

// Create client with default providers (OpenRouter, HuggingFace, NVIDIA, Gemini)
const client = new LLMClient();

// Generate text with automatic fallback
try {
    const response = await client.generate("What is the meaning of life?", {
        temperature: 0.7,
        max_tokens: 1000
    });
    console.log(response);
} catch (error) {
    console.error('Generation failed:', error);
}
```

## Advanced Usage 🔧

### Custom Provider Configuration

```typescript
import { 
    LLMClient, 
    OpenRouterProvider,
    HuggingFaceProvider,
    NvidiaProvider,
    GeminiProvider 
} from './llm_fallbackJS';

// Initialize OpenRouter with custom site info
const openRouter = new OpenRouterProvider(
    process.env.OPENROUTER_API_KEY,
    { url: 'https://your-site.com', name: 'Your App Name' }
);

// Initialize other providers
const huggingFace = new HuggingFaceProvider(process.env.HUGGINGFACE_API_KEY);
const nvidia = new NvidiaProvider(process.env.NVIDIA_API_KEY);
const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);

// Create client with specific provider order
const client = new LLMClient([openRouter, huggingFace, nvidia, gemini]);
```

### Provider-Specific Options

```typescript
// Each provider supports these options:
const response = await client.generate("Your prompt", {
    temperature: 0.7,     // Controls randomness (0-1)
    max_tokens: 1000      // Maximum length of response
});
```

### Error Handling

```typescript
import { AllProvidersFailedError } from './llm_fallbackJS';

try {
    const response = await client.generate("Your prompt");
    console.log(response);
} catch (error) {
    if (error instanceof AllProvidersFailedError) {
        console.error("All LLM providers failed");
    } else {
        console.error("Unexpected error:", error);
    }
}
```

## Provider Details 📋

### OpenRouter
- Default model: `mistralai/mistral-7b-instruct:free`
- Requires API key and site information
- Full OpenAI-compatible API interface

### HuggingFace
- Default model: `mistralai/Mistral-Nemo-Instruct-2407`
- Automatic response cleaning
- Configurable model selection

### NVIDIA AI
- Default model: `meta/llama-3.3-70b-instruct`
- Advanced parameter configuration
- High-performance inference

### Gemini
- Default model: `gemini-1.5-flash`
- Google's latest model
- Optimized for quick responses

## Contributing 🤝

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the ISC License - see the LICENSE file for details.

## Support 💬

For issues, questions, or contributions, please visit our [GitHub repository](https://github.com/Chungus1310/llm_fallbackJS/issues).

---

Made with ❤️ by [Chun](https://github.com/Chungus1310)
