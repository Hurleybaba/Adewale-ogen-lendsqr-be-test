# Demo Credit - Mobile Lending MVP

A robust, transactional wallet service built for a mobile lending application. This MVP allows users to create accounts, fund wallets, transfer funds peer-to-peer, and withdraw funds, while enforcing compliance checks via the Lendsqr Adjutor API.

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [System Architecture & Design](#-system-architecture--design)
- [Database Schema (ER Diagram)](#-database-schema-er-diagram)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)

## 🛠 Tech Stack
- **Runtime:** Node.js (LTS)
- **Language:** TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Knex.js
- **Architecture:** Modular (Controller-Service-Repository)

## wf System Architecture & Design

### 1. Atomic Transactions & Concurrency
Financial integrity is paramount. This system uses **Database Transactions (ACID)** for all wallet operations.
- **Transfers:** Use `db.transaction()` to ensure that debiting the sender and crediting the receiver happen successfully together, or not at all.
- **Pessimistic Locking:** The `FOR UPDATE` SQL clause is used when fetching wallet balances during transfers. This prevents "Double Spending" race conditions if a user initiates two transfers simultaneously.

### 2. Repository Pattern
Data access logic is isolated in `*.repository.ts` files. This separation of concerns allows the Service layer to focus purely on business logic (validation, calculations) without being cluttered by SQL queries.

### 3. Compliance (Karma Blacklist)
Before onboarding, every user's email is checked against the **Lendsqr Adjutor Karma Blacklist**.
- **Strategy:** Fail-Open. If the external Adjutor API is down, we log the error but allow registration to proceed (as per standard MVP reliability patterns), ensuring user friction is minimized during outages.

## 🗄 Database Schema (ER Diagram)

*(Place your ER Diagram image here)*
![alt text](<Payment Wallets Platform-2026-01-19-222815.png>)

The database consists of four normalized tables:
1.  **Users:** Identity management.
2.  **Wallets:** Financial balance and currency. One-to-one relationship with Users.
3.  **Transactions:** Ledger of all credits/debits (FUND, TRANSFER, WITHDRAW).
4.  **Transfers:** Record of peer-to-peer movements linking sender and receiver wallets.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Database

### Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd assessment
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory (see [Configuration](#-configuration)).

4.  **Run Migrations**
    Initialize the database tables.
    ```bash
    npm run migrate:latest
    ```

5.  **Start the Server**
    ```bash
    # Development mode
    npm run dev

    # Production build
    npm run build
    npm start
    ```

## ⚙ Configuration

Create a `.env` file with the following variables:

```env
PORT=3000

# Database Config
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=lendsqrdb
DB_PORT=3306

# Lendsqr Adjutor API (Compliance)
ADJUTOR_API_KEY=sk_live_...
```


## 📖 API Documentation

### User
1. **Create User POST /api/users**

Body: { "first_name": "John", "last_name": "Doe", "email": "john@example.com" }

Response: 201 Created - Returns access token.

2. **Get My Profile GET /api/users/me**

Headers: Authorization: Bearer <user_id>

Response: User details and current wallet balance.

### Wallet
Headers Required: Authorization: Bearer <user_id>

1. **Fund Wallet POST /api/wallet/fund**

Body: { "amount": 5000 }

Response: Success message and new balance.

2. **Transfer Funds POST /api/wallet/transfer**

Body: { "email": "receiver@example.com", "amount": 1000 }

Response: Success status.

3. **Withdraw Funds POST /api/wallet/withdraw**

Body: { "amount": 200 }

Response: Success message.

4. **Transaction History GET /api/wallet/history**

Response: List of all past transactions.

## Testing

  **Run the unit test suite:**
    ```Bash
    npm test
    ```

    