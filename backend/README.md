# SmartMail AI - Backend Service

The core Spring Boot 3.x RESTful backend for SmartMail AI, powering intelligent email response generation, summarization, and history management through Google Gemini Generative AI and MySQL.

---

## âš™ï¸ Technology Stack

- **Java**: 17+
- **Framework**: Spring Boot 3.3.5
- **Security**: Spring Security 6 with JWT (HMAC-SHA256) and BCrypt
- **ORM & Database**: Spring Data JPA, Hibernate, MySQL 8.x
- **HTTP Client**: Spring Reactive WebClient (WebFlux) with non-blocking I/O
- **AI Integration**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)
- **Testing**: JUnit 5, Mockito, Spring Security Test, H2 In-Memory DB (test profile)

---

## ðŸš€ Getting Started

### 1. Prerequisites
- JDK 17 or higher (`java -version`)
- MySQL 8.x Server (`localhost:3306`)
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or set system environment variables:

```bash
export DB_URL=jdbc:mysql://localhost:3306/smartmail_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
export GEMINI_API_KEY=your_gemini_api_key
export JWT_SECRET=replace_with_a_new_random_256_bit_secret
```

### 3. Build & Run Tests
Using Maven or the provided wrapper:

```bash
# Compile and run unit & integration tests
./mvnw clean test

# Package into executable JAR
./mvnw clean package -DskipTests
```

### 4. Run the Application
```bash
./mvnw spring-boot:run
```

The backend starts at: **`http://localhost:8080`**

---

## ðŸ“¡ REST API Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/user/profile` | Get current user profile and stats | Yes (Bearer JWT) |
| `PUT` | `/api/user/profile` | Update user profile and password | Yes (Bearer JWT) |
| `POST` | `/api/email/generate` | Generate context-aware email reply | Yes (Bearer JWT) |
| `POST` | `/api/email/summarize` | Summarize long email into insights | Yes (Bearer JWT) |
| `GET` | `/api/email/history` | Paginated search of user history | Yes (Bearer JWT) |
| `GET` | `/api/email/history/{id}` | Get single history record details | Yes (Bearer JWT) |
| `DELETE` | `/api/email/history/{id}` | Delete history record | Yes (Bearer JWT) |
| `GET` | `/api/email/stats` | Dashboard metrics & tone breakdown | Yes (Bearer JWT) |
