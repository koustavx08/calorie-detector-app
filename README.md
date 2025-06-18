# 🚀 Calorie Detector Pro

AI-powered nutrition tracking made effortless. Snap, scan, and stay healthy with real-time food analysis, voice control, and smart health insights—all in a beautiful, installable app.

---

## ✨ Features

- 📸 **Image Analysis**: Upload food images for instant calorie & nutrition breakdown
- 🧬 **Macro Tracking**: Monitor calories, protein, carbs, and fats
- 🧑‍⚕️ **AI Health Coach**: Get personalized, actionable health tips
- 🗣️ **Voice Assistant**: Control the app and log meals hands-free
- 📈 **Insights Dashboard**: Visualize your nutrition history and trends
- 📱 **PWA**: Install as a mobile app on any device
- 🌗 **Dark/Light Mode**: Seamless theme switching

---

## 🛠️ Quickstart

1. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure Groq API Key**
   - Get your key from [Groq Console](https://console.groq.com/)
   - Create a `.env.local` file in the root directory
   - Add:

     ```env
     NEXT_PUBLIC_GROQ_API_KEY=your_actual_api_key_here
     ```

3. **Run the app**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## 🧩 Project Structure

```
calorie-detector-app/
├── app/           # Next.js app directory
├── components/    # UI & feature components
├── services/      # API & data services
├── hooks/         # Custom React hooks
├── types/         # TypeScript types
├── public/        # Static assets & icons
└── styles/        # Tailwind & global styles
```

---

## 🧠 Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **shadcn/ui** (UI components)
- **Groq API** (AI-powered food analysis)
- **TypeScript**
- **PWA** (Progressive Web App)

---

## 🆘 Troubleshooting

- **API Key Issues:**
  - Ensure `.env.local` contains `NEXT_PUBLIC_GROQ_API_KEY`
  - Restart the dev server after changes
  - Validate your key at [Groq Console](https://console.groq.com/)

- **Missing Icons:**
  - Replace placeholder icons in `public/` with your own for production

---

## 📄 License

MIT License

---

> Made with ❤️ for health enthusiasts, by health enthusiasts. Snap, track, thrive!