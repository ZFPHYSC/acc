# Course AI System

A full-stack application for creating AI-powered courses with embedding-based search and chat interface.

## Overview

Course AI System enables users to create courses with embedded content that can be searched and interacted with via an AI chat interface. The system uses vector embeddings to enable semantic search and retrieval of relevant information from course materials.

## Features

- Create and manage courses with various content types
- Upload and process files (PDFs, text, documents, etc.)
- Extract content from YouTube videos
- Generate vector embeddings for all content
- AI-powered chat interface with relevant context retrieval
- File management system

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for fast development and building

### Backend
- Node.js with Express
- TypeScript
- MongoDB for data storage
- Vector-based similarity search

## Project Structure

```
course-ai-system/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API and service functions
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS configuration
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic and services
│   │   ├── models/           # Data models
│   │   ├── utils/            # Utility functions
│   │   └── index.ts          # Entry point for the backend
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/course-ai-system.git
cd course-ai-system
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/course-ai-system
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Future Enhancements

- Authentication and user management
- Multiple AI model support
- Advanced file type processing
- Course sharing and collaboration
- Custom embedding models
- Export capabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details. 