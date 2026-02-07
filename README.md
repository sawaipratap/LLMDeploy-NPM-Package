# COE AI - NPM Package

A professional TypeScript/JavaScript client for the COE AI LLM inference API.

[![npm version](https://img.shields.io/npm/v/coe-ai.svg)](https://www.npmjs.com/package/coe-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Note:** This API is exclusively accessible from UPES's internal network (UPESNET).

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Initialization](#initialization)
  - [Text Generation](#text-generation)
  - [Chat Completion](#chat-completion)
  - [Vision (Image-to-Text)](#vision-image-to-text)
  - [Streaming](#streaming)
  - [Listing Models](#listing-models)
- [Error Handling](#error-handling)
- [Types](#types)
- [License](#license)

## Installation

```bash
npm install coe-ai
```

## Quick Start

```typescript
import { LLMinfer } from 'coe-ai';

// Initialize the client
const llm = new LLMinfer({
  apiKey: 'your-api-key', // Get from https://coeai.ddn.upes.ac.in
});

async function main() {
  try {
    // Generate text
    const response = await llm.generate({
      model: 'tinyllama:latest',
      prompt: 'Explain quantum computing in one sentence.'
    });

    console.log(response.choices?.[0]?.message?.content);
  } catch (error) {
    console.error(error);
  }
}

main();
```

## API Reference

### Initialization

```typescript
const llm = new LLMinfer({
  apiKey: string,    // Required: Your API key
  host?: string      // Optional: Server URL (default: http://10.9.6.165:8000)
});
```

### Text Generation

Generate text from a prompt.

```typescript
const response = await llm.generate({
  model: 'tinyllama:latest',
  prompt: 'Write a poem about coding.',
  maxTokens: 100,       // optional (default: 512)
  temperature: 0.7,     // optional (default: 0.7)
  topP: 1.0,            // optional (default: 1.0)
  contextWindow: 2048   // optional (default: 2048)
});
```

### Chat Completion

Interact with the model using a list of messages.

```typescript
const response = await llm.chat(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Who won the 1998 World Cup?' },
    { role: 'assistant', content: 'France won the 1998 World Cup.' },
    { role: 'user', content: 'Who did they beat?' }
  ],
  'tinyllama:latest'
);
```

### Vision (Image-to-Text)

Analyze images using vision-capable models (e.g., `llama4:16x17b`).

```typescript
const response = await llm.generate({
  model: 'llama4:16x17b',
  inferenceType: 'image-to-text',
  prompt: 'Describe this image details.',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe this image.' },
        { 
          type: 'image_url', 
          image_url: { url: 'https://example.com/image.png' } 
          // Note: Local file uploads are supported via base64 encoded data URIs
        }
      ]
    }
  ]
});
```

### Streaming

Stream the response in real-time.

> **Note:** Streaming support is currently in beta.

```typescript
const response = await llm.generate({
  model: 'tinyllama:latest',
  prompt: 'Write a long story...',
  stream: true
});

// The response will contain the full generated text after the stream completes.
// For real-time chunk handling, future versions will expose an event emitter.
console.log(response.response);
```

### Listing Models

Get a list of all available models on the server.

```typescript
const models = await llm.list_models();
console.log('Available models:', models);
// ['tinyllama:latest', 'llama4:16x17b', ...]
```

## Error Handling

The package exports specific error classes for better error handling.

```typescript
import { 
  LLMinfer, 
  AuthenticationError, 
  ModelNotFoundError, 
  InferenceError,
  RateLimitError
} from 'coe-ai';

try {
  await llm.generate({ ... });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Check your API key!');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds.`);
  } else if (error instanceof ModelNotFoundError) {
    console.error('That model does not exist.');
  } else if (error instanceof InferenceError) {
    console.error('Server error:', error.message);
  }
}
```

## Types

You can import types for TypeScript usage:

```typescript
import { 
  GenerateOptions, 
  GenerateResponse, 
  Message, 
  ContentBlock 
} from 'coe-ai';
```

## License

MIT
