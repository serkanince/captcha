require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in .env file');
    process.exit(1);
}

// Configure OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Constants
const USD_TO_TL = parseFloat(process.env.USD_TO_TL || '34.99'); // USD/TL exchange rate
const RESULTS_DIR = 'results'; // Results directory
const IMAGE_DIR = 'image';  // Image directory
const DELAY_BETWEEN_REQUESTS = parseInt(process.env.DELAY_BETWEEN_REQUESTS || '1000'); // Delay between requests in ms

// Log configuration (without sensitive data)
console.log('Configuration:');
console.log(`- Exchange Rate: ${USD_TO_TL} TL/USD`);
console.log(`- Request Delay: ${DELAY_BETWEEN_REQUESTS}ms`);
console.log(`- Results Directory: ${RESULTS_DIR}`);
console.log(`- Image Directory: ${IMAGE_DIR}\n`);

// Generate timestamp filename
function getTimestampFilename() {
    const now = new Date();
    return `results-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.txt`;
}

// Calculate cost (in USD and TL)
function calculateCost(inputTokens, outputTokens) {
    // GPT-4 Turbo pricing
    const INPUT_PRICE_PER_1K = 0.01;  // $0.01 per 1K input tokens
    const OUTPUT_PRICE_PER_1K = 0.03;  // $0.03 per 1K output tokens

    const inputCost = (inputTokens / 1000) * INPUT_PRICE_PER_1K;
    const outputCost = (outputTokens / 1000) * OUTPUT_PRICE_PER_1K;
    const totalUSD = inputCost + outputCost;
    const totalTL = totalUSD * USD_TO_TL;

    return {
        usd: totalUSD,
        tl: totalTL
    };
}

// Convert image to base64
function encodeImage(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        throw new Error(`Failed to read image file: ${error.message}`);
    }
}

// Process image
async function processImage(imagePath) {
    const startTime = Date.now();
    const base64Image = encodeImage(imagePath);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "Extract text only. No explanations."
                },
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "Read text:" 
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                                detail: "low"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 10,
            temperature: 0
        });

        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;

        const inputTokens = response.usage.prompt_tokens;
        const outputTokens = response.usage.completion_tokens;
        const totalTokens = response.usage.total_tokens;
        const cost = calculateCost(inputTokens, outputTokens);

        return {
            text: response.choices[0].message.content.trim(),
            stats: {
                responseTime,
                inputTokens,
                outputTokens,
                totalTokens,
                cost
            }
        };
    } catch (error) {
        throw new Error(`API request failed: ${error.message}`);
    }
}

// Initialize directories
function initializeDirectories() {
    // Check and create results directory
    if (!fs.existsSync(RESULTS_DIR)) {
        fs.mkdirSync(RESULTS_DIR);
    }

    // Check if image directory exists
    if (!fs.existsSync(IMAGE_DIR)) {
        console.error(`Error: ${IMAGE_DIR} directory not found`);
        process.exit(1);
    }
}

// Main function
async function main() {
    console.log('Initializing...');
    initializeDirectories();

    const results = [];
    let totalCostUSD = 0;
    let totalCostTL = 0;
    let totalTime = 0;
    let totalTokens = 0;

    try {
        const files = fs.readdirSync(IMAGE_DIR)
            .filter(file => file.toLowerCase().endsWith('.png'))
            .sort();

        if (files.length === 0) {
            console.error('No PNG files found in the image directory');
            process.exit(1);
        }

        console.log(`Found ${files.length} PNG files to process\n`);

        for (const file of files) {
            const imagePath = path.join(IMAGE_DIR, file);
            console.log(`Processing: ${file}`);

            try {
                const result = await processImage(imagePath);
                totalCostUSD += result.stats.cost.usd;
                totalCostTL += result.stats.cost.tl;
                totalTime += result.stats.responseTime;
                totalTokens += result.stats.totalTokens;

                results.push(
                    `${file}: ${result.text}\n` +
                    `  Response Time: ${result.stats.responseTime.toFixed(2)} seconds\n` +
                    `  Token Usage: ${result.stats.totalTokens} (${result.stats.inputTokens} input + ${result.stats.outputTokens} output)\n` +
                    `  Cost: $${result.stats.cost.usd.toFixed(4)} (${result.stats.cost.tl.toFixed(2)} TL)`
                );

                console.log(`  Response Time: ${result.stats.responseTime.toFixed(2)} seconds`);
                console.log(`  Token Usage: ${result.stats.totalTokens}`);
                console.log(`  Cost: $${result.stats.cost.usd.toFixed(4)} (${result.stats.cost.tl.toFixed(2)} TL)\n`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
            }
        }

        // Add total statistics
        results.push(
            `\nTotal Statistics:\n` +
            `  Total Time: ${totalTime.toFixed(2)} seconds\n` +
            `  Total Tokens: ${totalTokens}\n` +
            `  Average Tokens: ${(totalTokens / files.length).toFixed(0)}\n` +
            `  Total Cost: $${totalCostUSD.toFixed(4)} (${totalCostTL.toFixed(2)} TL)`
        );

        // Save results with timestamp
        const resultFile = path.join(RESULTS_DIR, getTimestampFilename());
        fs.writeFileSync(resultFile, results.join('\n\n'), 'utf8');
        
        console.log('\nProcess completed! Results saved:');
        console.log(`File: ${resultFile}`);
        console.log(`Total Cost: $${totalCostUSD.toFixed(4)} (${totalCostTL.toFixed(2)} TL)`);
        console.log(`Total Time: ${totalTime.toFixed(2)} seconds`);
        console.log(`Total Tokens: ${totalTokens}`);
        console.log(`Average Tokens: ${(totalTokens / files.length).toFixed(0)}`);

    } catch (error) {
        console.error('General error:', error.message);
        process.exit(1);
    }
}

// Start the application
main().catch(error => {
    console.error('Application error:', error.message);
    process.exit(1);
}); 