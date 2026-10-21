# Local AI Studio (Port 13305)

A chat and image generation application configured to connect to a local server running on **port 13305** (e.g. Lemonade Server or any OpenAI-compatible local AI server).

## Features

- **Port 13305 Local Integration**: Connects by default to `http://localhost:13305`
- **Text & Multimodal Chat**: Multi-turn conversation memory with support for vision / image questions
- **Local Image Generation**: Style chips (Realistic, Cartoon, Hyper, Pixel Art, etc.) powered by local diffusion models via `/v1/images/generations`
- **Contextual Actions**: Describe, Explain, Summarize, and Brainstorm on dragged images
- **Image Gallery & Export**: Download individual card packages or batch export all generated cards as ZIP
- **Live Status & Settings**: Real-time port 13305 connectivity indicator, model selector, and configuration dialog

## Run Locally

**Prerequisites:** Node.js, and a local server running on port 13305 (e.g. `lemonade serve`).

1. Start your local server on port 13305:
   ```bash
   lemonade serve
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser at `http://localhost:3000`. The app will automatically connect to your local server on port 13305.

