# SmartMail AI – Intelligent AI-Powered Email Response and Summarization Assistant

SmartMail AI is a full-stack, enterprise-grade Generative AI email assistant that helps professionals, students, and teams understand lengthy email threads, extract structured action items, and draft context-aware, tone-customized email responses.

The system delivers a unified AI backend that serves two cohesive interfaces:
1. **Modern React Web Dashboard** (built with React 18, Vite, and Material UI).
2. **Google Chrome Extension (Manifest V3)** that integrates in-situ into the Gmail interface.

---

## 🎯 1. Problem Statement & Project Objectives

### The Problem
Professionals spend an average of 28% of their workweek reading, processing, and responding to emails. Key deadlines and actionable questions are frequently buried in long threads. Drafting grammatically correct, appropriately toned responses consumes significant cognitive bandwidth.

### The Solution: SmartMail AI
- **Context-Aware AI Replies**: Generates contextually accurate email replies based on original incoming emails, sender/recipient metadata, user-chosen personas (Professional, Formal, Friendly, Casual, Apologetic, Persuasive), and desired length (Short, Medium, Detailed).
- **Executive Summarization**: Distills dense email threads into executive summaries, bulleted main points, explicit action items, critical deadlines, and pending questions requiring a response.
- **Gmail In-Situ Integration**: Chrome Extension detects opened conversations, injecting a `✨ AI Reply` button directly into Gmail's compose toolbar with 1-click insertion into the draft box without automatic sending.
- **Audit Logging & History**: Stores all generation activity in MySQL, enabling users to search, review, copy, or reuse past communications.

---

## 💻 2. Technology Stack

### Backend
- **Language**: Java 17 / Java 24 compatible
- **Framework**: Spring Boot 3.2.1
- **Security**: Spring Security 6, JWT (io.jsonwebtoken 0.12.7), BCrypt Password Hashing
- **Data Persistence**: Spring Data JPA, Hibernate, MySQL Connector/J
- **Database**: MySQL 8.x (production/local runtime), H2 in-memory (isolated automated test suite)
- **HTTP Client**: Spring 6.1 `RestClient` with configurable connection and read timeouts
- **Build & Test**: Apache Maven, JUnit 5, Mockito

### Frontend
- **Framework**: React 18 (Vite build tool)
- **UI Component System**: Material UI (MUI v5), Emotion CSS-in-JS
- **Icons**: Material UI Icons
- **HTTP Client**: Axios with global JWT request/response interceptors
- **Routing**: React Router DOM v6 with protected route guards

### Browser Extension
- **Platform**: Google Chrome Extension Manifest V3
- **DOM Engine**: Native JavaScript with `MutationObserver`
- **Host Permissions**: `https://mail.google.com/*`, `http://localhost:8080/*`
- **Storage**: `chrome.storage.local` for offline settings and JWT tokens

### AI Model Integration
- **Engine**: Google Gemini Generative AI (`gemini-3.5-flash-lite`)
- **API**: Google Generative Language API (`/v1beta/models/{model}:generateContent`)
- **Security**: Prompt injection boundary fences (`<<<ORIGINAL_EMAIL>>>`)

---

## 🏛️ 3. System Architecture

```
                          ┌──────────────────────────────────────┐
                          │     User (Browser / Web Client)      │
                          └──────────────────┬───────────────────┘
                                             │
                   ┌─────────────────────────┴─────────────────────────┐
                   ▼                                                   ▼
       ┌───────────────────────┐                           ┌───────────────────────┐
       │   React Dashboard     │                           │ Chrome Extension (V3) │
       │ (http://localhost:5173│                           │   (Gmail DOM In-Situ) │
       └───────────┬───────────┘                           └───────────┬───────────┘
                   │                                                   │
                   │      HTTP REST / JSON (Authorization: Bearer)     │
                   └─────────────────────────┬─────────────────────────┘
                                             ▼
                          ┌──────────────────────────────────────┐
                          │     Spring Boot 3.x REST Backend     │
                          │        (http://localhost:8080)       │
                          ├──────────────────────────────────────┤
                          │ • Security Filter Chain (JWT)        │
                          │ • Controllers & DTO Validation       │
                          │ • Prompt Engineering Engine          │
                          │ • Spring Data JPA Repositories       │
                          └───────────┬──────────────────┬───────┘
                                      │                  │
                Spring Data JPA / SQL │                  │ RestClient (HTTPS)
                                      ▼                  ▼
                          ┌──────────────────────┐   ┌──────────────────────┐
                          │   MySQL 8.x Engine   │   │  Google Gemini API   │
                          │   (smartmail_db)     │   │   (gemini-3.5-flash-lite) │
                          └──────────────────────┘   └──────────────────────┘
```

---

## 📂 4. Project Directory Structure

```
SmartMail-AI/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartmail/
│   │   │   │   ├── config/          # Security, RestClient, and CORS configs
│   │   │   │   ├── controller/      # Auth, Email, and User REST controllers
│   │   │   │   ├── dto/             # Request & Response data transfer objects
│   │   │   │   ├── entity/          # JPA entities (User, EmailGeneration)
│   │   │   │   ├── exception/       # Global exception handler & custom exceptions
│   │   │   │   ├── repository/      # Spring Data JPA repositories
│   │   │   │   ├── security/        # JWT provider, filter, and user principal
│   │   │   │   ├── service/         # Business logic, Gemini & prompt builder
│   │   │   │   └── SmartMailApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # JUnit 5 & Mockito test suite
│   ├── mvnw.cmd                     # Self-contained Maven runner
│   ├── pom.xml                      # Project Object Model
│   └── README.md
│
├── frontend/
│   ├── public/                      # Static assets & SVG logo
│   ├── src/
│   │   ├── components/              # Layout, Navbar, Sidebar, ProtectedRoute
│   │   ├── context/                 # AuthContext & ToastContext
│   │   ├── pages/                   # Login, Register, Dashboard, Generator, Summarizer, History, Profile
│   │   ├── services/                # Axios instance, auth & email API services
│   │   ├── theme/                   # Material UI theme palette
│   │   ├── App.jsx                  # Root routes & providers
│   │   └── main.jsx                 # React root entry
│   ├── package.json
│   └── vite.config.js
│
├── chrome-extension/
│   ├── manifest.json                # Manifest V3 configuration
│   ├── content.js                   # Gmail DOM MutationObserver & AI injector
│   ├── background.js                # Extension service worker
│   ├── popup.html                   # Extension action popup markup
│   ├── popup.js                     # Popup authentication and quick tools
│   ├── popup.css                    # Popup styling
│   └── icons/                       # 16px, 48px, 128px extension icons
│
├── database/
│   └── schema.sql                   # MySQL 8.x schema definition & seed data
│
├── docs/
│   ├── architecture.md              # System architecture, data flow & security
│   ├── api-documentation.md         # Full REST API endpoint specifications
│   ├── database-design.md           # ER diagram, table schemas & normalization
│   └── viva-questions.md            # Comprehensive viva questions & answers
│
├── postman/
│   └── SmartMail-API.postman_collection.json  # Complete Postman test collection
│
├── .gitignore
├── .env.example                     # Environment variables template
└── README.md
```

---

## 🗄️ 5. Database Setup (MySQL 8.x)

1. Ensure MySQL Server is running on port `3306`.
2. Connect using your MySQL client (MySQL Workbench, Command Line, or DBeaver):
   ```sql
   SOURCE database/schema.sql;
   ```
   *Or manually execute the SQL statements in `database/schema.sql`.*
3. By default, `application.properties` connects with:
   - Host: `localhost:3306`
   - Database: `smartmail_db`
   - User: `root`
   - Password: configured via `DB_PASSWORD` environment variable

---

## 🔑 6. Google Gemini API Setup

1. Obtain a free Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. Set the environment variable:
   ```bash
   # On Windows PowerShell
   $env:GEMINI_API_KEY="your_actual_gemini_api_key"

   # On Linux / macOS
   export GEMINI_API_KEY="your_actual_gemini_api_key"
   ```

---

## 🚀 7. Running the Application

### 7.1 Backend (Spring Boot)
Open a terminal in the `backend/` directory:

```bash
# Run automated test suite (JUnit 5 + Mockito)
.\mvnw.cmd test -o

# Start Spring Boot application server
.\mvnw.cmd spring-boot:run
```
*Backend runs at: **`http://localhost:8080`***

---

### 7.2 Frontend (React Web Dashboard)
Open a terminal in the `frontend/` directory:

```bash
# Start Vite development server
npm run dev

# Or build production distribution
npm run build
```
*Frontend runs at: **`http://localhost:5173`***

---

### 7.3 Google Chrome Extension Installation
1. Open Google Chrome.
2. In the address bar, navigate to `chrome://extensions/`.
3. In the top-right corner, switch the **Developer mode** toggle to **ON**.
4. Click **Load unpacked** in the top-left menu.
5. In the file picker, select the `chrome-extension` directory inside this project folder.
6. The **SmartMail AI – Gmail Assistant** icon will now appear in your Chrome toolbar!
7. Navigate to [Gmail](https://mail.google.com) and open any email thread. Notice the purple **✨ AI Reply** button appears directly next to the native reply buttons and compose toolbars!

---

## 🧪 8. Testing Verification

### Automated Backend Tests
SmartMail AI includes 17 automated unit and integration tests executing against an in-memory MySQL-compatible H2 database:
- `AuthControllerTest`: User registration validation, JWT creation, bad credentials handling.
- `EmailControllerTest`: Security filter chain verification, unauthenticated request rejection (401).
- `AuthServiceTest`: User creation, duplicate email conflict handling (409), password encryption.
- `EmailServiceTest`: Generation logic, multi-reply variation generation, structured JSON summarization parsing, user authorization boundaries.
- `GeminiServiceTest`: Error mapping (missing API keys, rate limits, safety blocks).
- `PromptBuilderServiceTest`: Prompt engineering, delimiter wrapping, anti-injection guarantees.

Run tests anytime with:
```bash
cd backend
.\mvnw.cmd test -o
```

---

## 🛡️ 9. Security Principles Implemented

1. **Stateless Authorization**: Eliminates session hijacking via signed HMAC-SHA256 JWT tokens.
2. **Cryptographic Password Security**: Passwords never stored in plaintext; salted and hashed with BCrypt.
3. **Anti-IDOR Ownership Enforcing**: Database queries strictly filter by `user.id`.
4. **Prompt Injection Boundary Protection**: Untrusted emails enclosed in `<<<ORIGINAL_EMAIL>>>` tags with explicit safety instructions forbidding LLM prompt overrides.
5. **Human-in-the-Loop Emailing**: The Chrome Extension inserts reply drafts into the compose box; emails are never sent automatically.

---

## 🔮 10. Future Enhancements

- Multi-language translation support for foreign email replies.
- Integration with Microsoft Outlook 365 Add-in API.
- Calendar event detection with 1-click Google Calendar scheduling.
- Sentiment analysis score indicator for incoming emails.

---

## 👨‍🎓 Viva Examination Support

Detailed viva questions, system diagrams, and architectural defenses are located in:
- System Architecture: [`docs/architecture.md`](docs/architecture.md)
- REST API Documentation: [`docs/api-documentation.md`](docs/api-documentation.md)
- Database Design & Normalization: [`docs/database-design.md`](docs/database-design.md)
- College Viva Q&A Guide: [`docs/viva-questions.md`](docs/viva-questions.md)
- Postman Collection: [`postman/SmartMail-API.postman_collection.json`](postman/SmartMail-API.postman_collection.json)
