# MERN Notes App

A full production-grade modern MERN (MongoDB, Express, React, Node.js) Notes application featuring Markdown composition, tags, smart-filtering schemas, and advanced authentication flows.

## Features

- **Advanced Security**: Fully guarded Express endpoints via Zod schema enforcement, Helmet headers, IP-based Rate Limiting, and Bcrypt hashing.
- **Authentication Workflow**: JWT-based session architecture, keeping Access tokens transient in memory and Refresh tokens encrypted inside persistent HttpOnly cookies.
- **Core Notes Enhancements**: Native logic routing for Archive, Trash bin, Note Color styling, and Tags.
- **Dynamic Search & Sort**: Real-time debounce searching checking title, tags, and content bodies simultaneously. Coupled with advanced UI states for sorting notes chronologically and alphabetically.
- **File System Handling**: Embedded express-multer configurations offering scalable attachment handling locally. 
- **Rich Editor Environment**: Complete markdown integration with Tailwind Preflight CSS styling fixes, enabling rich text bodies and checklists.

## Setup Instructions

### Environment Setup
Navigate to the `backend/` directory and configure your env credentials:
1. Create a `.env` file from the sample. Note that you have to replace standard tokens:
```env
PORT=8000
DB_ATLAS="mongodb://127.0.0.1:27017/notes-app"
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
```

### Installation
Run backend initialization:
```bash
cd backend
npm install
npm start
``` 
Run frontend initialization:
```bash
cd frontend/notes-app
npm install
npm run dev
```

### Running Locally
1. Start local MongoDB.
2. The UI is accessible at `http://localhost:5173`.
3. The API binds endpoints securely via CORS directly to `5173` pointing at port `8000`.
