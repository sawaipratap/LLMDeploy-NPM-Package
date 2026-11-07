/**
 * COE AI TypeScript Type Definitions
 */

/**
 * Configuration options for the LLMinfer client
 */
export interface LLMinferConfig {
    /** Your COE AI API authentication key */
    apiKey: string;
    /** The FastAPI server endpoint URL (default: https://coeai.ddn.upes.ac.in) */
    host?: string;
}

/**
 * Content block for multimodal messages
 */
export interface ContentBlock {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
    };
}

/**
 * Chat message format
 */
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string | ContentBlock[];
}

/**
 * Options for the generate method
 */
export interface GenerateOptions {
    /** Model name: "qwen3.8" (256K), "qwen3.8-1m" (1M) or "gemma-4" (8K) */
    model: string;
    /** Text prompt for generation */
    prompt?: string;
    /** Custom conversation messages (alternative to prompt) */
    messages?: Message[];
    /** Type of inference: 'text-to-text' or 'image-to-text' */
    inferenceType?: 'text-to-text' | 'image-to-text';
    /** Maximum number of tokens to generate (default: 2048). The models reason before answering and that counts towards this limit. */
    maxTokens?: number;
    /** Sampling temperature 0.0-2.0 (default: 0.7) */
    temperature?: number;
    /** Nucleus sampling parameter 0.0-1.0 (default: 1.0) */
    topP?: number;
    /** @deprecated Ignored: context is fixed per model */
    contextWindow?: number;
    /** Enable streaming response (default: false) */
    stream?: boolean;
}

/**
 * Response from the generate endpoint
 */
export interface GenerateResponse {
    /** Generated text content */
    response?: string;
    /** Model used for generation */
    model?: string;
    /** Choices array (OpenAI-compatible format) */
    choices?: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    /** Usage statistics */
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    /** Raw response data */
    [key: string]: unknown;
}

/**
 * Response from the models endpoint
 */
export interface ModelsResponse {
    user: string;
    models: string[];
}

/**
 * Error response from the API
 */
export interface APIError {
    detail: string;
    status_code?: number;
}
