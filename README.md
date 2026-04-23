# TeachMate 🎓🌍

**TeachMate** is a comprehensive **Language Learning Platform** that connects students with mentors and leverages AI to accelerate language acquisition. It features real-time communication, video calls, an AI-powered tutor, and tools designed specifically for language exchange.

![TeachMate Banner](https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop)

## 🚀 Key Features

### 🌟 Core Communication
- **Real-time Chat**: Seamless messaging using Socket.IO.
- **Video Calls**: Integrated WebRTC video calling for face-to-face practice.
- **Image & Audio Support**: Share images and voice notes easily.

### 🤖 AI-Powered Learning
- **TeachMate AI Tutor**: 24/7 access to a smart AI tutor (powered by Google Gemini).
- **Ask Anything**: Get grammar corrections, translations, and cultural insights instantly.
- **Conversation Practice**: Practice a new language with the AI when no human partners are available.

### 👥 Mentorship & Roles
- **Student & Mentor Roles**: Sign up as a learner or an expert tutor.
- **Find Mentors**: Browse mentor profiles, check hourly rates, and skills.
- **Mock Booking System**: Simulate booking sessions with mentors using credits.
- **Profile Management**: Mentors can customize their bio, rates, and languages.

### 🛠️ Language Tools
- **Topic Roulette 🎲**: Stuck in a conversation? Roll the dice for a random bilingual discussion topic.
- **Language Switch Timer ⏱️**: Set a timer to switch languages (e.g., 10 mins English, 10 mins Spanish) for fair exchange.
- **Vocabulary Notebook 📖**: Save words directly from chat to your personal vocabulary list.

## 💻 Tech Stack

- **Frontend**: React, Vite, TailwindCSS, DaisyUI, Zustand (State Management).
- **Backend**: Node.js, Express, MongoDB, Socket.IO.
- **AI**: Google Gemini API.
- **Real-time**: Socket.IO, WebRTC (SimplePeer).
- **Authentication**: JWT & Cookies.
- **Cloud Storage**: Cloudinary (for images/audio).

## 🛠️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/AgamPandey133/Teachmate.git
    cd Teachmate
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file and add your credentials (MONGO_URI, JWT_SECRET, CLOUDINARY_*, GEMINI_API_KEY)
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🔒 Environment Variables

Create a `.env` file in the `backend` folder with the following:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_google_gemini_key
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
