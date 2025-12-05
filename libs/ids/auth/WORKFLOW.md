# Identity Server (IDS) Authentication & Registration Flow

## Overview

This document describes the authentication and registration flow of the Identity Server (IDS), utilizing **OAuth2.0 Authorization Code Flow + PKCE**.

## Authentication Flow (Login)

1. The **Client App** redirects the user to IDS for authentication.
2. The **IDS** prompts the user for login.
3. If login is successful, IDS generates an **Authorization Code**.
4. The Client App exchanges the Authorization Code for an **Access Token & ID Token**.
5. The Client App stores the **Access Token** and uses it to access APIs securely.

```
  +-----------------+       +-----------------+       +-------------------+
  |   Client App    |       | Identity Server |       |      API Server   |
  +-----------------+       +-----------------+       +-------------------+
          |                          |                          |
          |---- Redirect to IDS ---->|                          |
          |                          |                          |
          |<------ Login UI ---------|                          |
          |                          |                          |
          |--- Authorization Code -->|                          |
          |                          |                          |
          |-- Exchange for Tokens -->|                          |
          |                          |                          |
          |<--- Access Token ------- |                          |
          |                          |                          |
          |--- Use Token to API ---->|--- Validate Token ------>|
```

## Registration Flow with Auto Login

1. User submits registration form to IDS.
2. IDS creates a new user account and sends an email verification link.
3. User verifies their email by clicking the link.
4. After verification, IDS **automatically logs in** the user and issues tokens.
5. The Client App receives the **Access Token & ID Token**.

```
  +-----------------+       +-----------------+
  |   Client App    |       | Identity Server |
  +-----------------+       +-----------------+
          |                         |
          |---- Register User ----->|
          |                         |
          |<-- Email Verification --|
          |                         |
          |-- Click Verification -->|
          |                         |
          |---- Auto Login -------->|
          |                         |
          |<--- Access Token -------|
```

## API Endpoints

### Authentication

- **`POST /oidc/auth`** → Initiates authentication (login)
- **`POST /oidc/token`** → Exchanges Authorization Code for an Access Token
- **`GET /oidc/userinfo`** → Retrieves user profile info

### Registration

- **`POST /register`** → Registers a new user
- **`GET /verify-email?token=...`** → Verifies email
- **Auto Login after verification**

### Logout

- **`GET /logout`** → Ends the user session

## Security Considerations

- Uses **PKCE (Proof Key for Code Exchange)** for securing Authorization Code Flow.
- Access Token is stored **securely** (e.g., HttpOnly cookie or in-memory storage).
- Email verification prevents fake account creation.

## Notes

- **PKCE is required** for public clients (e.g., SPA, Mobile Apps).
- IDS enforces **redirect URIs with HTTPS** for security.
