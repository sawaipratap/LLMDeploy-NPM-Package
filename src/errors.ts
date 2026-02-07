/**
 * COE AI Error Classes
 * Mirroring the Python client's error hierarchy
 */

/**
 * Base exception for COEAI client errors
 */
export class COEAIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'COEAIError';
    }
}

/**
 * Raised when API key authentication fails
 */
export class AuthenticationError extends COEAIError {
    constructor(message: string = 'Authentication failed. Invalid or expired API key.') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

/**
 * Raised when specified model is not available
 */
export class ModelNotFoundError extends COEAIError {
    constructor(message: string = 'Model not found or endpoint unavailable.') {
        super(message);
        this.name = 'ModelNotFoundError';
    }
}

/**
 * Raised when inference request fails
 */
export class InferenceError extends COEAIError {
    constructor(message: string = 'Inference request failed.') {
        super(message);
        this.name = 'InferenceError';
    }
}

/**
 * Raised when rate limit is exceeded
 */
export class RateLimitError extends COEAIError {
    retryAfter?: number;

    constructor(message: string = 'Rate limit exceeded.', retryAfter?: number) {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
