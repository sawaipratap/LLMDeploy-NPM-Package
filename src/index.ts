/**
 * COE AI LLM Inference Client
 *
 * A TypeScript/JavaScript client for the COE AI LLM API.
 *
 * @example
 * ```typescript
 * import { LLMinfer } from 'coe-ai';
 *
 * const llm = new LLMinfer({
 *   apiKey: 'your-api-key',
 *   host: 'https://coeai.ddn.upes.ac.in' // optional
 * });
 *
 * // Generate text
 * const response = await llm.generate({
 *   model: 'qwen3.8',
 *   prompt: 'Explain machine learning in simple terms'
 * });
 *
 * // List available models
 * const models = await llm.list_models();
 * ```
 *
 * @packageDocumentation
 */

export { LLMinfer } from './client';

export {
    COEAIError,
    AuthenticationError,
    ModelNotFoundError,
    InferenceError,
    RateLimitError,
} from './errors';

export {
    LLMinferConfig,
    GenerateOptions,
    GenerateResponse,
    Message,
    ContentBlock,
    ModelsResponse,
    APIError,
} from './types';
