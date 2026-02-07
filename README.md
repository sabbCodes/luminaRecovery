# Lumina Recovery

**An AI-powered companion for behavioral addiction recovery featuring local-first data privacy and systematic safety monitoring.**

---

## 🌟 Overview

Lumina Recovery is a specialized AI support system designed to assist individuals in managing and overcoming behavioral addictions—such as compulsive gambling, over-shopping, and digital overconsumption. 

Built for the **Google AI Studio Hackathon**, the project demonstrates how frontier models like **Gemini 3 Flash** can be combined with privacy-preserving technologies to create a safe, empathetic, and highly observable recovery coach.

## ✨ Key Features

### 🤖 Trauma-Informed AI Coaching
Powered by **Gemini 3 Flash**, Lumina provides 24/7 non-judgmental support. The coach utilizes Motivational Interviewing techniques and trauma-informed care principles to guide users through cravings and emotional distress.

### 🎙️ Voice Companion (Live Support)
A real-time, low-latency voice interaction mode using **Gemini 2.5 Flash Native Audio**. Users can talk to Lumina during crisis moments, with a manual "Mute" toggle to ensure a stammer-free, focused listening experience from the AI.

### 🖼️ Calm Space Generator
Utilizes **Imagen 4.0** to generate serene, high-fidelity digital art based on user prompts. This serves as a multimodal de-escalation tool to help ground users during intense urges.

### 📓 Mood & Pattern Insights
A private recovery journal where Lumina analyzes entries (via **Gemini 3 Pro**) to detect behavioral triggers, emotional patterns, and progress over time—all while keeping data on the user's device.

## 🛡️ Privacy & Security

Mental health data is deeply personal. Lumina is built with a **Local-First Architecture**:
- **IndexedDB (Dexie.js)**: All chat history, journal entries, and profile data are stored locally in the user's browser.
- **Privacy by Design**: No sensitive recovery data is stored on a centralized server.

## 🔍 Hackathon Highlight: Opik Observability

Lumina features a robust, Opik-style observability suite developed to qualify for the **"Best Use of Opik"** prize. 

- **Autonomous LLM-as-a-Judge**: Every AI response is automatically evaluated for *Empathy*, *Safety*, and *Helpfulness* by a secondary supervisor model.
- **Safety Regression Suite**: A systematic experiment runner that tests the coach against a "Gold Dataset" of high-risk scenarios.
- **Latency Tracking**: Real-time performance monitoring to ensure the AI remains responsive during critical user moments.
- **Cloud Readiness**: A built-in "Connection" settings tab for seamless sync with Opik Cloud (Comet).

## 🛠️ Tech Stack

- **Model Layer**: Gemini 1.5 Flash (Coach), Gemini 1.5 Pro (Insights), Gemini 2.0 Flash (Live Audio), Imagen 3 (Art).
- **Observability**: Opik (Comet) Evaluation Standards.
- **Persistence**: Dexie.js (IndexedDB).
- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sabbCodes/luminaRecovery.git
    cd luminaRecovery
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```

---

*Lumina Recovery is an AI educational tool and NOT a medical or professional psychiatric service. If you are in immediate danger, please contact local emergency services or a crisis hotline.*
