/**
 * Test script for the COE AI NPM package
 * 
 * Usage: npm run build && npm test
 * 
 * Make sure you're on UPESNET and have a valid API key.
 */

const { LLMinfer, AuthenticationError, InferenceError } = require('../dist');

// Replace with your actual API key
const API_KEY = process.env.COE_AI_API_KEY || 'your-api-key-here';

async function main() {
    console.log('🚀 COE AI NPM Package Test\n');

    // Check if API key is set
    if (API_KEY === 'your-api-key-here') {
        console.log('⚠️  No API key provided. Set COE_AI_API_KEY environment variable.');
        console.log('   Example: COE_AI_API_KEY=your-key npm test\n');
        console.log('   Skipping live tests, just verifying package loads correctly...\n');

        // Just verify the package loads
        try {
            const llm = new LLMinfer({ apiKey: 'test-key' });
            console.log('✅ Package loaded successfully');
            console.log('✅ LLMinfer class instantiated');
            console.log('✅ Vision models:', [...LLMinfer.VISION_MODELS]);
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
        return;
    }

    const llm = new LLMinfer({ apiKey: API_KEY });

    try {
        // Test 1: List models
        console.log('1️⃣ Testing list_models()...');
        const models = await llm.list_models();
        console.log(`   ✅ Found ${models.length} models: ${models.slice(0, 3).join(', ')}${models.length > 3 ? '...' : ''}\n`);

        // Test 2: Generate text
        console.log('2️⃣ Testing generate()...');
        const response = await llm.generate({
            model: models[0] || 'tinyllama:latest',
            prompt: 'Say "Hello from COE AI!" in exactly 5 words.',
            maxTokens: 50,
        });
        console.log(`   ✅ Response: ${response.choices?.[0]?.message?.content || response.response || 'No content'}\n`);

        // Test 3: Chat
        console.log('3️⃣ Testing chat()...');
        const chatResponse = await llm.chat(
            [
                { role: 'user', content: 'What is 2 + 2?' }
            ],
            models[0] || 'tinyllama:latest',
            { maxTokens: 50 }
        );
        console.log(`   ✅ Chat response: ${chatResponse.choices?.[0]?.message?.content || chatResponse.response || 'No content'}\n`);

        console.log('🎉 All tests passed!');
    } catch (error) {
        if (error instanceof AuthenticationError) {
            console.error('❌ Authentication failed. Check your API key.');
        } else if (error instanceof InferenceError) {
            console.error('❌ Inference error:', error.message);
        } else {
            console.error('❌ Unexpected error:', error);
        }
        process.exit(1);
    }
}

main();
