# Marvel Chatbot

An interactive web application that allows users to chat with Marvel superheroes using AI. The application features user authentication, animated hero selection, and realistic hero-specific conversations powered by OpenAI's GPT models.

## Features

- **User Authentication**: Sign up and login functionality with JWT token-based security
- **Animated UI**: Beautiful animations for transitions and interactions using Framer Motion
- **Hero Selection**: Interactive hero selection page with hover animations
- **Chat Interface**: ChatGPT-like interface with conversation history
- **AI Integration**: OpenAI integration for realistic hero-specific conversations
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React (Vite)
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- React Icons for icons

### Backend
- FastAPI (Python)
- JWT for authentication
- bcrypt for password hashing
- OpenAI API for chat functionality

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python (3.8 or higher)
- OpenAI API key

### Backend Setup
1. Clone the repository
   ```
   git clone https://github.com/yourusername/marvel-chatbot.git
   cd marvel-chatbot
   ```

2. Create a Python virtual environment and activate it
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install backend dependencies
   ```
   pip install fastapi uvicorn python-dotenv pyjwt bcrypt openai
   ```

4. Create a `.env` file from the template
   ```
   cp .env.example .env
   ```

5. Edit the `.env` file and add your OpenAI API key and a secret key for JWT

6. Start the backend server
   ```
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`

## Project Structure

```
marvel-chatbot/
├── main.py                # FastAPI backend
├── users.json             # User database (created automatically)
├── .env                   # Environment variables
├── public/
│   └── heroes/            # Hero images
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── HeroSelection.jsx
│   │   └── ChatInterface.jsx
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── tailwind.config.js
```

## Deployment

### Backend Deployment
The backend can be deployed to platforms like Heroku, Railway, or any VPS that supports Python:

```
gunicorn -k uvicorn.workers.UvicornWorker main:app
```

### Frontend Deployment
Build the frontend for production:

```
npm run build
```

Then deploy the contents of the `dist` directory to Netlify, Vercel, or any static hosting service.

## Screenshots

![Screenshot 2025-04-21 162108](https://github.com/user-attachments/assets/ca86d391-403e-420a-80cd-187c75b9fcb1)


## License

MIT

## Author

Agastya Teja
