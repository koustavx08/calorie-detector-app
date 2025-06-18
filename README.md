# Calorie Detector Pro

An AI-powered nutrition tracking application with real-time data analysis and voice assistance.

## Features

- 📸 **Image Analysis**: Upload food images for instant calorie and nutrition analysis
- 📊 **Nutrition Tracking**: Track calories, protein, carbs, and fats
- 🎯 **Health Tips**: Get personalized health recommendations
- 🗣️ **Voice Assistant**: Voice-controlled interface
- 📱 **PWA Support**: Install as a mobile app
- 🌙 **Dark Mode**: Beautiful dark/light theme support

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Groq API Key

1. Get your API key from [Groq Console](https://console.groq.com/)
2. Create a `.env.local` file in the root directory
3. Add your API key:

```env
NEXT_PUBLIC_GROQ_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with your real Groq API key.

### 3. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### API Key Issues
If you see "Invalid API Key" errors:
1. Make sure you've set the `NEXT_PUBLIC_GROQ_API_KEY` in your `.env.local` file
2. Restart your development server after adding the API key
3. Verify your API key is valid at [Groq Console](https://console.groq.com/)

### Missing Icons
The app includes placeholder icons. For production, replace the placeholder icons in the `public/` directory with your own branded icons.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI**: Groq API for image analysis
- **TypeScript**: Full type safety
- **PWA**: Progressive Web App support

## Project Structure

```
calorie-detector-app/
├── app/                 # Next.js app directory
├── components/          # React components
├── services/           # API services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── styles/             # Global styles
```

## License

MIT License 