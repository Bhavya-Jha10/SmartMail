# SmartMail AI – RESTful API Documentation

**Base URL**: `http://localhost:8080/api`
**Protocol**: HTTP/1.1 REST
**Data Format**: JSON (`application/json`)
**Authentication**: Bearer Token via HTTP Header `Authorization: Bearer <JWT>`

---

## 🔐 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Access**: Public
- **Description**: Registers a new user account, hashes password using BCrypt, and issues an initial JWT token.

#### Request Body
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

#### Response `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lQGV4YW1wbGUuY29tIiwidXNlcklkIjoxLCJuYW1lIjoiSmFuZSBEZXZlbG9wZXIiLCJyb2xlIjoiUk9MRV9VU0VSIiwiZXhwIjoxNzk0MTAxMjAwfQ...",
  "tokenType": "Bearer",
  "id": 1,
  "name": "Jane Developer",
  "email": "jane@example.com",
  "role": "ROLE_USER",
  "message": "User registered successfully"
}
```

#### Error Responses
- `400 Bad Request`: Validation failure (e.g. invalid email format, short password).
- `409 Conflict`: Email address is already registered.

---

### 1.2 Login User
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Access**: Public
- **Description**: Authenticates user credentials via Spring Security and returns a JWT token.

#### Request Body
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

#### Response `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "id": 1,
  "name": "Jane Developer",
  "email": "jane@example.com",
  "role": "ROLE_USER",
  "message": "User logged in successfully"
}
```

#### Error Response
- `401 Unauthorized`: Invalid email or password.

---

## 👤 2. User Profile Endpoints

### 2.1 Get Current User Profile
- **Method**: `GET`
- **Endpoint**: `/user/profile`
- **Access**: Protected (`ROLE_USER`)
- **Headers**: `Authorization: Bearer <token>`

#### Response `200 OK`
```json
{
  "id": 1,
  "name": "Jane Developer",
  "email": "jane@example.com",
  "role": "ROLE_USER",
  "createdAt": "2026-11-06T00:15:00",
  "totalGenerations": 14,
  "totalReplies": 10,
  "totalSummaries": 4
}
```

---

### 2.2 Update Profile & Password
- **Method**: `PUT`
- **Endpoint**: `/user/profile`
- **Access**: Protected (`ROLE_USER`)
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "name": "Jane Senior Developer",
  "currentPassword": "SecurePassword123!",
  "newPassword": "BrandNewPassword2026!"
}
```

#### Response `200 OK`
Returns the updated `UserProfileDto`.

---

## ✉️ 3. AI Email Reply & Summarization Endpoints

### 3.1 Generate Context-Aware Email Reply
- **Method**: `POST`
- **Endpoint**: `/email/generate`
- **Access**: Protected (`ROLE_USER`)
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "originalContent": "Hi Jane, could you please send across the revised sprint timeline and confirm if we can deploy to staging tomorrow morning?",
  "senderName": "Marcus Bell",
  "recipientName": "Jane Developer",
  "tone": "Professional",
  "length": "Medium",
  "additionalInstructions": "Confirm staging deployment at 10 AM, mention revised timeline is attached.",
  "alternativeCount": 2,
  "saveToHistory": true
}
```

#### Response `200 OK`
```json
{
  "id": 104,
  "generatedReply": "Hi Marcus,\n\nThank you for reaching out. Yes, we are on track for staging deployment tomorrow morning at 10:00 AM UTC.\n\nI have attached the updated sprint timeline reflecting our adjusted deliverables. Please let me know if you have any questions before the rollout.\n\nBest regards,\nJane Developer",
  "alternativeReplies": [
    "Hi Marcus,\n\nAll confirmed on our end! Staging deployment is scheduled for tomorrow at 10 AM. Please find the revised sprint roadmap attached for your review.\n\nBest,\nJane"
  ],
  "tone": "Professional",
  "length": "Medium",
  "createdAt": "2026-11-06T00:16:45",
  "modelUsed": "gemini-1.5-flash"
}
```

---

### 3.2 Summarize Email Thread
- **Method**: `POST`
- **Endpoint**: `/email/summarize`
- **Access**: Protected (`ROLE_USER`)
- **Headers**: `Authorization: Bearer <token>`

#### Request Body
```json
{
  "emailContent": "Hi Team, during today's executive sync we agreed to proceed with the cloud migration pilot on November 15th. All security compliance checklists must be completed and submitted to audit@company.com by November 10th at 5 PM EST. Could everyone please review the shared risk assessment sheet and confirm if your team requires additional VM allocations by end of day Wednesday?",
  "additionalInstructions": "Highlight all deadlines clearly",
  "saveToHistory": true
}
```

#### Response `200 OK`
```json
{
  "id": 105,
  "summary": "The executive committee approved the cloud migration pilot scheduled for November 15th, requiring security checklist sign-offs and VM capacity confirmations ahead of launch.",
  "mainPoints": [
    "Cloud migration pilot scheduled to launch November 15th",
    "Security compliance checklists must be completed prior to migration",
    "Teams must review risk assessment sheet"
  ],
  "actionItems": [
    "Complete and submit security checklists to audit@company.com",
    "Review shared risk assessment sheet",
    "Confirm if additional VM allocations are required"
  ],
  "deadlines": [
    "November 10th at 5:00 PM EST (Security Checklist submission)",
    "Wednesday End of Day (VM allocation confirmation)",
    "November 15th (Cloud migration pilot kickoff)"
  ],
  "questions": [
    "Does your team require additional VM allocations for the migration?"
  ],
  "createdAt": "2026-11-06T00:18:20",
  "modelUsed": "gemini-1.5-flash"
}
```

---

## 📜 4. History Management Endpoints

### 4.1 Search & Paginate History
- **Method**: `GET`
- **Endpoint**: `/email/history`
- **Access**: Protected (`ROLE_USER`)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional, default `0`): Page index.
  - `size` (optional, default `10`): Items per page.
  - `search` (optional): Filter keyword matching original or generated text.
  - `type` (optional): Filter by `REPLY` or `SUMMARY`.
  - `tone` (optional): Filter by tone (`Professional`, `Friendly`, etc.).

#### Response `200 OK`
```json
{
  "content": [
    {
      "id": 105,
      "userId": 1,
      "originalContent": "Hi Team, during today's executive sync...",
      "generatedContent": "The executive committee approved...",
      "generationType": "SUMMARY",
      "tone": "Analytical",
      "responseLength": "Concise",
      "metadataJson": "{\"mainPoints\":[...],\"actionItems\":[...]}",
      "createdAt": "2026-11-06T00:18:20"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### 4.2 Delete History Record
- **Method**: `DELETE`
- **Endpoint**: `/email/history/{id}`
- **Access**: Protected (`ROLE_USER`)
- **Headers**: `Authorization: Bearer <token>`

#### Response `200 OK`
```json
{
  "success": true,
  "message": "Email history record deleted successfully",
  "timestamp": "2026-11-06T00:20:00"
}
```

---

### 4.3 Dashboard Analytics Stats
- **Method**: `GET`
- **Endpoint**: `/email/stats`
- **Access**: Protected (`ROLE_USER`)

#### Response `200 OK`
```json
{
  "totalGenerations": 14,
  "totalReplies": 10,
  "totalSummaries": 4,
  "recentActivity": [ ... ],
  "toneDistribution": {
    "Professional": 6,
    "Friendly": 3,
    "Formal": 1
  }
}
```
