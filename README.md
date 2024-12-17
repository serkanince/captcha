# Text Extraction with OpenAI Vision API in a Node.js Application 

A highly optimized Node.js application demonstrating cost-effective text extraction from images using OpenAI's Vision API. This project showcases how to achieve significant cost reductions through model selection and token optimization while maintaining high accuracy.

## 🎯 Purpose

This project demonstrates:
- How to optimize token usage in OpenAI's Vision API
- Best practices for performance monitoring
- Efficient image processing strategies

## 💡 Key Findings

### Token Optimization
- Optimized token usage: ~110 tokens per image
- Achieved through model selection (GPT-4 Turbo) (maybe use gpt-4o-mini model, because more capable for text extraction)
- Optimized system prompts and messages
- Implemented "low detail" mode without accuracy loss

### Cost Efficiency
- Cost per image: $0.0012 (0.04 TL)
- 96% cost reduction achieved
- Highly scalable for large datasets

## 🚀 Features

- Efficient text extraction using GPT-4 Turbo
- Real-time cost and performance monitoring
- Detailed token usage analytics
- Automated batch processing
- Timestamped results with comprehensive stats

## 📊 Performance Metrics

- Token usage: ~110 per image
- Cost per image: $0.0012 (0.04 TL)
- Processing time: 1-2 seconds
- Accuracy rate: Very High

## 💰 Cost Analysis (Optimized)

Scale comparison at current API prices:
- 1,000 images: ~$1.20 (42 TL)
- 10,000 images: ~$12.00 (420 TL)
- 100,000 images: ~$120.00 (4,200 TL)

## 🛠️ Setup & Usage

1. Clone the repository:
```bash
git clone https://github.com/yourusername/openai-vision-optimizer.git
cd openai-vision-optimizer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Place your PNG files in the `/image` folder

5. Run the application:
```bash
node captcha_solver.js
```

Results are automatically saved in `/results` with timestamps (format: `results-YYYYMMDD-HHMMSS.txt`)

## 📝 Output Format

```
filename.png: extracted_text
  Response Time: X.XX seconds
  Token Usage: XXX (XXX input + XX output)
  Cost: $X.XXXX (X.XX TL)
```

## ⚙️ Technical Optimizations

1. **API Optimization**
   - Minimal system prompts
   - Optimized token usage
   - Rate limit handling

2. **Cost Management**
   - Token usage monitoring
   - Detailed reporting
   - Multi-currency support (USD/TL)


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## ⚠️ Disclaimer

This project is not affiliated with OpenAI. All API pricing and performance metrics are subject to change. Please refer to [OpenAI's official documentation](https://platform.openai.com/docs/api-reference/introduction) for current pricing.





