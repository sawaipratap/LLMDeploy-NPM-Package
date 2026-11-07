/**
 * COE AI LLM Inference Client
 *
 * Professional client library for the COE AI LLM inference API with:
 * - Comprehensive error handling
 * - Support for text-to-text and image-to-text inference
 * - Streaming and non-streaming responses
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
    LLMinferConfig,
    GenerateOptions,
    GenerateResponse,
    Message,
} from './types';
import {
    COEAIError,
    AuthenticationError,
    ModelNotFoundError,
    InferenceError,
    RateLimitError,
} from './errors';

/**
 * COE AI LLM inference client for LAN access.
 *
 * Supports:
 * - text-to-text: `qwen3.8` (256K context), `qwen3.8-1m` (1M context) and `gemma-4` (8K context)
 * - image-to-text: sent to the same models; the server rejects it if the model can't read images
 * - streaming: Real-time response streaming
 * - custom messages: Advanced conversation handling
 *
 * @example
 * ```typescript
 * import { LLMinfer } from 'coe-ai';
 *
 * const llm = new LLMinfer({ apiKey: 'your-key' });
 * const response = await llm.generate({
 *   model: 'qwen3.8',
 *   prompt: 'Hello!'
 * });
 * ```
 */
export class LLMinfer {
    private readonly apiKey: string;
    private readonly host: string;
    private readonly client: AxiosInstance;

    /**
     * Initialize the COE AI LLM inference client.
     *
     * Note: This API is only accessible from UPES's internal network (UPESNET).
     * Get your API key from: https://coeai.ddn.upes.ac.in
     *
     * @param config - Configuration options
     * @throws Error if apiKey is empty or invalid
     */
    constructor(config: LLMinferConfig) {
        if (!config.apiKey || !config.apiKey.trim()) {
            throw new Error('API key cannot be empty');
        }

        this.apiKey = config.apiKey.trim();
        this.host = (config.host || 'https://coeai.ddn.upes.ac.in').replace(/\/$/, '');

        this.client = axios.create({
            baseURL: this.host,
            timeout: 600000, // 10 minutes for long inference
            headers: {
                'X-API-Key': this.apiKey,
            },
        });
    }

    /**
     * Generate a response from the specified model.
     *
     * @param options - Generation options
     * @returns API response containing generated content
     * @throws AuthenticationError if API key authentication fails
     * @throws ModelNotFoundError if specified model is not available
     * @throws InferenceError if inference request fails
     *
     * @example
     * ```typescript
     * const response = await llm.generate({
     *   model: 'qwen3.8',
     *   prompt: 'Explain AI',
     *   maxTokens: 100
     * });
     * ```
     */
    async generate(options: GenerateOptions): Promise<GenerateResponse> {
        const {
            model,
            prompt,
            messages,
            inferenceType = 'text-to-text',
            maxTokens = 2048,
            temperature = 0.7,
            topP = 1.0,
            stream = false,
        } = options;

        // Validate inference type
        if (!['text-to-text', 'image-to-text'].includes(inferenceType)) {
            throw new Error(
                `inferenceType must be 'text-to-text' or 'image-to-text', got '${inferenceType}'`
            );
        }

        // Validate prompt or messages
        if (!prompt && !messages) {
            throw new Error("Either 'prompt' or 'messages' must be provided");
        }

        // Prepare messages payload
        const payloadMessages: Message[] = messages || [
            { role: 'user', content: [{ type: 'text', text: prompt || '' }] },
        ];

        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('model', model);
        formData.append('inference_type', inferenceType);
        formData.append('max_tokens', maxTokens.toString());
        formData.append('temperature', temperature.toString());
        formData.append('top_p', topP.toString());
        formData.append('stream', stream.toString());
        formData.append('prompt', prompt || '');
        formData.append('messages', JSON.stringify(payloadMessages));

        try {
            const response = await this.client.post<GenerateResponse>(
                '/generate',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            return response.data;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }

    /**
     * Convenience method for chat-style interaction.
     * Wraps the generate method with a simpler interface for multi-turn conversations.
     *
     * @param messages - Array of chat messages
     * @param model - Model to use for generation
     * @param options - Additional generation options
     * @returns Generated response
     *
     * @example
     * ```typescript
     * const response = await llm.chat(
     *   [{ role: 'user', content: 'What is AI?' }],
     *   'qwen3.8'
     * );
     * ```
     */
    async chat(
        messages: Message[],
        model: string,
        options?: Omit<GenerateOptions, 'model' | 'messages' | 'prompt'>
    ): Promise<GenerateResponse> {
        return this.generate({
            model,
            messages,
            ...options,
        });
    }

    /**
     * Get list of available models from the server.
     *
     * @returns List of available model names
     * @throws AuthenticationError if API key authentication fails
     * @throws InferenceError if request fails
     *
     * @example
     * ```typescript
     * const models = await llm.list_models();
     * console.log(`Available models: ${models.join(', ')}`);
     * ```
     */
    async list_models(): Promise<string[]> {
        try {
            const response = await this.client.get<{ user: string; models: string[] }>(
                '/models',
                { timeout: 10000 }
            );
            return response.data.models;
        } catch (error) {
            throw this.handleError(error as AxiosError);
        }
    }

    /**
     * Handle HTTP errors with detailed messages
     */
    private handleError(error: AxiosError): COEAIError {
        if (!error.response) {
            // Network or connection error
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                return new InferenceError(
                    `Could not connect to COE AI server at ${this.host}\n` +
                    'Please check:\n' +
                    '  1. Server is running\n' +
                    "  2. You're on UPES Wi-Fi network\n" +
                    '  3. Host URL is correct'
                );
            }
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                return new InferenceError(
                    'Request timed out after 600 seconds.\n' +
                    'This may happen with very large models or long prompts.'
                );
            }
            return new InferenceError(`Connection error: ${error.message}`);
        }

        const statusCode = error.response.status;
        const data = error.response.data as { detail?: string } | undefined;
        const errorDetail = data?.detail || 'No error details provided';

        switch (statusCode) {
            case 401:
                return new AuthenticationError(
                    'Authentication failed. Invalid or expired API key.\n' +
                    'Slot keys only work during the hour you booked, and persistent keys last 30 days.\n' +
                    'Book a slot or request a key at: https://coeai.ddn.upes.ac.in/api-access'
                );
            case 400:
                return new COEAIError(
                    `Bad request: ${errorDetail}\n` +
                    'Please check your parameters (model name, inference type, etc.)'
                );
            case 404:
                return new ModelNotFoundError(
                    `Model not found or endpoint unavailable.\n` +
                    `Error: ${errorDetail}\n` +
                    'Use llm.list_models() to see available models.'
                );
            case 429:
                const retryAfter = parseInt(
                    error.response.headers['retry-after'] || '60',
                    10
                );
                return new RateLimitError(
                    `Rate limit exceeded: ${errorDetail}\nPlease wait and try again.`,
                    retryAfter
                );
            default:
                if (statusCode >= 500) {
                    return new InferenceError(
                        `Server error (${statusCode}): ${errorDetail}\n` +
                        'This is likely a temporary issue. Please try again later.'
                    );
                }
                return new InferenceError(`HTTP ${statusCode}: ${errorDetail}`);
        }
    }
}
