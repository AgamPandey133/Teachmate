# TeachMate 🎓🌍

**TeachMate** is a comprehensive **Language Learning Platform** that connects students with mentors and leverages advanced AI to accelerate language acquisition. It features real-time communication, WebRTC video calls, an AI-powered tutor using a custom **Retrieval-Augmented Generation (RAG)** pipeline, and tools designed specifically for language exchange.

![TeachMate Banner](https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop)

## 🚀 Key Features

### 🌟 Core Communication
- **Real-time Chat**: Zero-latency messaging using Socket.IO.
- **Video Calls**: Integrated peer-to-peer WebRTC video calling for face-to-face practice directly in the browser.
- **Synchronized Utilities**: Shared language timers (e.g., 10 mins English, 10 mins Spanish) that sync perfectly across both users' screens.

### 🧠 Advanced AI Tutor (RAG Pipeline)
- **Personalized Context**: Built a custom **Retrieval-Augmented Generation (RAG)** pipeline from scratch.
- **Vector Embeddings**: User vocabulary is converted into 3072-dimensional vectors using Google's `gemini-embedding-001` and stored natively in MongoDB.
- **Cosine Similarity Math**: When a user chats with the AI, the backend calculates cosine similarity in-memory to inject the student's *actual saved vocabulary* into the AI context, forcing the AI to reinforce those specific words.
- **Dynamic Model Resolution**: Fault-tolerant API configuration that dynamically selects the healthiest Gemini model at runtime.

### 👥 Mentorship & Roles
- **Student & Mentor Roles**: Sign up as a learner or an expert tutor.
- **Find Mentors**: Browse mentor profiles, check hourly rates, and filter by skills.
- **Profile Management**: Mentors can customize their bio, rates, and target languages.

### 🛠️ Language Tools
- **Topic Roulette 🎲**: Stuck in a conversation? Roll the dice for a random bilingual discussion topic.
- **Vocabulary Notebook 📖**: Save words directly from chat to your personal vocabulary list, which automatically trains your AI Tutor.

## 💻 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, DaisyUI, Zustand (State Management).
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Real-time Engine**: Socket.IO (Signaling & Chat), `simple-peer` (WebRTC).
- **AI Architecture**: Google Gemini API, Custom Vector Search Algorithm.
- **Authentication**: JWT & HTTP-Only Cookies, bcrypt password hashing.

## 🛠️ Installation & Setup (Development)

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/AgamPandey133/Teachmate.git
    cd Teachmate
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🚀 Deployment (Production)

The project is pre-configured for zero-config deployment on platforms like Render or Railway. 

To run the optimized production build locally:
```bash
# In the root Teachmate directory
npm run build
npm start
```
*The Express server will automatically serve the static React bundle from `frontend/dist`.*

## 🔒 Environment Variables

Create a `.env` file in the `backend` folder with the following keys:

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
