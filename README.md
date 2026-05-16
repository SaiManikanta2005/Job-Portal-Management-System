# CareerHub - AI-Powered Job Portal

This is a full-stack job portal built with React (Vite), Express, and Gemini AI.

## 🚀 How to Run Locally

Since this is a Full-Stack application with a custom backend, you **cannot** simply open `index.html` in your browser. You must run the development server.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### 2. Setup
1.  **Clone or Download** the project to your local machine.
2.  Open your terminal/command prompt in the project folder.
3.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Environment Variables
Create a file named `.env` in the root directory (you can copy `.env.example` if it exists) and add your Gemini API Key if you want to use the AI features:
```env
GEMINI_API_KEY=your_actual_key_here
```

### 4. Start the Application
Run the following command to start both the backend API and the frontend:
```bash
npm run dev
```

The application will be available at **`http://localhost:3000`**.

## 🛠 Features
- **Candidate Dashboard:** Search jobs, apply with cover letters, and track applications.
- **Employer Dashboard:** Post jobs, manage applicants, and shortlist candidates.
- **AI Career Coach:** Chat with an AI assistant for career advice and resume tips.
- **Smart Match:** AI-powered job recommendations based on your profile.
- **Job Alerts:** Get notified when new jobs matching your interests are posted.

## 📁 Project Structure
- `server.ts`: Express backend and API logic.
- `src/`: React frontend source code.
- `db.json`: Local database (automatically created).
- `uploads/`: Folder for stored resumes (automatically created).
