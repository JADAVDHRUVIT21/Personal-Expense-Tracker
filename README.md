**# Personal Expense Tracker**

A full-stack web application designed to help users manage personal finances through a structured, user-friendly interface. The project uses React for the frontend, FastAPI for the backend, and PostgreSQL for database storage.

**## Table of Contents**

1. Introduction
2. Project Objectives
3. Technology Stack and Reasons
4. Core Features
5. Use Cases
6. System Architecture
7. Research and Design Considerations
8. Installation and Setup
9. Running the Project
10. Application Workflow
11. Screenshots and Working Explanation
12. API Documentation
13. Security Considerations
14. Future Enhancements
15. Conclusion

---

**## 1. Introduction**

Managing personal finances is important for understanding spending habits, controlling expenses, and planning budgets. Tracking expenses manually is time-consuming and makes it difficult to maintain organized financial records.

The **Personal Expense Tracker** is a web-based application developed to provide a centralized platform for personal finance management.

The application follows a full-stack architecture in which React provides the user interface, FastAPI processes requests and manages application logic, and PostgreSQL stores data persistently.

The project includes account-related functionality such as user registration, login, profile management, password changes, and logout confirmation, along with expense, category, and budget management modules.

**### Project Objectives**

- Develop a responsive and user-friendly finance application.
- Provide account registration and authentication.
- Store application data in a relational database.
- Allow users to manage their profile information.
- Support secure password changes.
- Enable users to record and manage expenses.
- Allow categorization of expenses for better tracking.
- Provide budget creation and monitoring.
- Connect the frontend and backend through REST APIs.
- Provide a maintainable architecture for future enhancements.

**## 2. Technology Stack and Reasons**

| Technology                | Purpose                     | Reason for Selection                                                                       |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| React                     | Frontend development        | Component-based architecture makes the interface reusable and maintainable.                |
| Vite                      | Frontend development server | Provides a fast development workflow and modern build tooling.                             |
| Tailwind CSS              | UI styling                  | Makes responsive layouts and consistent styling easier to implement.                       |
| Custom CSS                | Component styling           | Supports application-specific layouts, animations, and notifications.                      |
| React Router              | Page navigation             | Enables navigation between login, dashboard, expense, category, budget, and profile pages. |
| React Icons               | Icons                       | Provides consistent icons for buttons and navigation.                                      |
| Python                    | Backend programming         | Offers readable syntax and a broad ecosystem for web development.                          |
| FastAPI                   | REST API development        | Provides request validation, dependency injection, and automatic API documentation.        |
| SQLAlchemy                | Database ORM                | Maps Python models to database tables and simplifies database operations.                  |
| Alembic                   | Database migrations         | Tracks schema changes and applies database updates.                                        |
| PostgreSQL                | Database management         | Provides reliable relational data storage and transaction support.                         |
| Uvicorn                   | Backend server              | Runs the FastAPI application using ASGI.                                                   |
| JWT/Bearer authentication | API security                | Allows protected API requests to carry authentication tokens.                              |

**## 3. Core Features**

**### User Authentication**
Users can register and log in to access the application.

**### Profile Management**
The profile page retrieves the current user's information from the backend. Users can update their name, while the registered email address is displayed as read-only.

**### Password Management**
Users can submit their current password and a new password. The backend verifies the current password before saving the new password.

**### Expense Management**
Users can add, view, edit, and delete expense records with amount, date, description, and category.

**### Category Management**
Users can create and manage custom categories to organize their expenses (e.g., Food, Travel, Bills, Shopping).

**### Budget Management**
Users can set monthly budgets and monitor spending against those budgets.

**### Interactive Notifications**
The application can display in-page success and error notifications for actions such as profile updates, password changes, and expense/budget operations.

**### Logout Confirmation**
The logout confirmation dialog helps prevent accidental logout.

- **Yes, Log Out:** Executes the logout flow and redirects the user to the login page.
- **Cancel:** Closes the dialog without logging out.

**### Database Management**
PostgreSQL stores structured application data. SQLAlchemy provides the ORM layer, and Alembic manages database migrations.

**### API Documentation**
FastAPI generates interactive Swagger documentation for inspecting and testing available endpoints.

**## 4. Use Cases**

**### Use Case 1: User Registration**
A new user enters the required information and creates an account. The backend validates the request and stores the user information.

**### Use Case 2: User Login**
An existing user submits their credentials. After successful authentication, the frontend uses the returned authentication information for protected requests.

**### Use Case 3: View Profile**
The user opens the profile page. The frontend requests the current user's information from the backend and displays the registered name and email.

**### Use Case 4: Update Profile Name**
The user edits the name field and clicks **Save Name**. The frontend sends the updated name to the backend, which saves it in the database.

**### Use Case 5: Change Password**
The user enters their current password, new password, and confirmation. The application validates the inputs, and the backend verifies the current password before saving the new password hash.

**### Use Case 6: Manage Expenses**
The user adds a new expense with amount, date, category, and description. The user can also edit or delete existing expenses.

**### Use Case 7: Manage Categories**
The user creates categories such as Food, Travel, or Utilities, which are then used when recording expenses.

**### Use Case 8: Manage Budgets**
The user sets a monthly budget per category and views how much has been spent versus the budgeted amount.

**### Use Case 9: Logout Confirmation**
The user clicks Logout. A confirmation dialog appears. The user can cancel the operation or confirm logout.

**### Use Case 10: API Testing**
A developer opens Swagger UI to inspect available endpoints, review request formats, and test API operations.

**## 5. System Architecture**

The project follows a three-layer architecture.

```text
                USER / WEB BROWSER
                         |
                         v
              REACT + VITE FRONTEND
              - Login and registration
              - Dashboard and profile
              - Expense, category, budget pages
              - Forms and notifications
              - Page navigation
                         |
                    HTTP / JSON
                Bearer Access Token
                         |
                         v
                  FASTAPI BACKEND
              - REST API endpoints
              - Request validation
              - Authentication
              - Business logic
                         |
                    SQLAlchemy
                         |
                         v
                 POSTGRESQL DATABASE
              - Users
              - Categories
              - Expenses
              - Budgets

### How the Architecture Works

The user interacts with the React frontend.

The frontend sends an HTTP request to a FastAPI endpoint.

FastAPI validates the request and checks authentication when required.

SQLAlchemy performs the required database operations.

PostgreSQL returns the relevant result.

FastAPI returns a response to the frontend.

React updates the page and displays the appropriate feedback.

## 6. Research and Design Considerations

The project uses common full-stack development practices to improve maintainability, data consistency, and usability.

### Separation of Concerns
The frontend manages presentation and user interactions, while the backend manages validation, authentication, and database operations. This separation makes individual parts easier to test and maintain.

### Relational Database Design
Personal finance applications work with related entities such as users, expenses, categories, and budgets. PostgreSQL provides structured storage and supports relationships and transactions.

### REST API Design
The frontend communicates with the backend through HTTP endpoints. FastAPI's generated OpenAPI documentation makes the API easier to inspect and test.

### Authentication and Validation
Protected endpoints should validate access tokens and identify the current user. Validation must also be performed on the backend because frontend checks alone are not sufficient.

### User Experience
Clear form labels, responsive layouts, visible notifications, and confirmation dialogs help users understand the result of their actions and avoid accidental operations.

### Research References

React: https://react.dev/

Vite: https://vite.dev/guide/

FastAPI: https://fastapi.tiangolo.com/

PostgreSQL: https://www.postgresql.org/docs/

SQLAlchemy: https://docs.sqlalchemy.org/

Alembic: https://alembic.sqlalchemy.org/

Tailwind CSS: https://tailwindcss.com/docs

## 7. Installation and Setup

### Prerequisites

Python 3.13

Node.js and npm

PostgreSQL

Visual Studio Code

### Step 1: Open the Project
cd D:\Personal-Expense-Tracker

If cloning from GitHub:
git clone https://github.com/JADAVDHRUVIT21/Personal-Expense-Tracker.git
cd Personal-Expense-Tracker

### Step 2: Configure PostgreSQL

Create a database named:

text

Configure the backend .env file:
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@localhost:5432/personal_expense_tracker

Replace USERNAME and PASSWORD with your local PostgreSQL credentials.

Important: Never commit database passwords, JWT secrets, or other credentials to GitHub.

### Step 3: Activate the Backend Virtual Environment

cd D:\Personal-Expense-Tracker\backend
.\venv\Scripts\Activate.ps1

If the virtual environment does not exist yet:
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1

### Step 4: Install Backend Dependencies

powershell
python -m pip install -r requirements.txt

### Step 5: Apply Database Migrations

powershell
python -m alembic upgrade head

### Step 6: Install Frontend Dependencies

Open a second terminal:
cd D:\Personal-Expense-Tracker\frontend
npm install

## 8. Running the Project

### Run the Backend

cd D:\Personal-Expense-Tracker\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload

The backend runs at:

API base URL: http://127.0.0.1:8000

Swagger documentation: http://127.0.0.1:8000/docs

OpenAPI schema: http://127.0.0.1:8000/openapi.json

Health check: http://127.0.0.1:8000/health

### Run the Frontend

cd D:\Personal-Expense-Tracker\frontend
npm run dev

Open: http://localhost:5173

Keep both terminals running while using the application.

## 9. Application Workflow

### Authentication Workflow

The user opens the application.

The user registers or logs in.

The frontend receives authentication information from the backend.

Protected requests include the access token in the Authorization header.

The backend validates the token before allowing access to protected data.

Example authorization header:

Authorization: Bearer YOUR_ACCESS_TOKEN

### Profile Workflow

Open My Profile from the navigation bar.

The frontend sends GET /api/v1/auth/me.

The backend returns the current user's profile information.

The user edits the name and selects Save Name.

The frontend sends PATCH /api/v1/auth/me.

The backend saves the updated name and returns the updated profile.

The frontend displays a success or error notification.

### Password Change Workflow

Enter the current password.

Enter the new password.

Confirm the new password.

The frontend checks the required fields and password match.

The frontend sends POST /api/v1/auth/change-password.

The backend verifies the current password.

If valid, the backend stores the new password hash.

The frontend displays the result.

### Expense Workflow

Open Expenses from the navigation.

The frontend fetches GET /api/v1/expenses.

The user clicks Add Expense and fills the form (amount, date, category, description).

The frontend sends POST /api/v1/expenses.

The backend validates and stores the expense.

The list refreshes and a success notification appears.

Users can edit (PUT /api/v1/expenses/{id}) or delete (DELETE /api/v1/expenses/{id}) entries.

### Category Workflow

Open Categories from the navigation.

The frontend fetches GET /api/v1/categories.

The user clicks Add Category, enters a name, and confirms.

The frontend sends POST /api/v1/categories.

The backend validates uniqueness and stores the category.

The list refreshes with the new category available for expenses.

### Budget Workflow

Open Budgets from the navigation.

The frontend fetches GET /api/v1/budgets.

The user sets a monthly limit for a category.

The frontend sends POST /api/v1/budgets.

The backend stores the budget.

The budgets page displays usage against each budget.

### Logout Workflow

Click Logout in the navbar.

The confirmation dialog appears.

Click Cancel to close without logging out.

Alternatively, click Yes, Log Out to confirm.

The application runs its logout logic and navigates to /login.

## 10. Screenshots and Working Explanation

Screenshots are important because they demonstrate the actual working application.

### 10.1 Login Page

Screenshot: docs/screenshots/login.png

Show the login form and explain how existing users enter their credentials to sign in.

https://docs/screenshots/login.png

### 10.2 Registration Page

Screenshot: docs/screenshots/register.png

Show the registration form and explain how a new user creates an account.

https://docs/screenshots/register.png

### 10.3 Dashboard

Screenshot: docs/screenshots/dashboard.png

Show the dashboard with summary cards, totals, and shortcuts.

https://docs/screenshots/dashboard.png

### 10.4 Expense Page

Screenshot: docs/screenshots/expense.png

The Expense page displays all recorded expenses in a table or card layout, showing amount, category, date, and description. Users can add new expenses using the Add Expense button, edit an existing record, or delete entries. Totals and filters are shown at the top.

https://docs/screenshots/expense.png

### 10.5 Category Page

Screenshot: docs/screenshots/category.png

The Category page lists all expense categories created by the user (e.g., Food, Travel, Utilities). Users can add new categories with the Add Category button and remove ones no longer needed. Categories are used to group expenses on the Expense page and in Budget tracking.

https://docs/screenshots/category.png

### 10.6 Budget Page

Screenshot: docs/screenshots/budget.png

The Budget page shows monthly budget limits per category and the amount spent against each. Progress bars help visualize how close a user is to their budget. Users can add or update a budget using the Set Budget action.

https://docs/screenshots/budget.png

### 10.7 My Profile

Screenshot: docs/screenshots/profile.png

The profile page shows the name field (editable) and email field (read-only), along with the Save Name button and password-change form.

https://docs/screenshots/profile.png

### 10.8 Logout Confirmation

Screenshot: docs/screenshots/logout-confirmation.png

Show the confirmation dialog that appears after clicking Logout.

https://docs/screenshots/logout-confirmation.png

### 10.9 Swagger API Documentation

Screenshot: docs/screenshots/swagger.png

Open http://127.0.0.1:8000/docs while the backend is running and capture the actual endpoints.

https://docs/screenshots/swagger.png

### Screenshot Checklist

□ Login page
□ Registration page
□ Working dashboard
□ Expense page
□ Category page
□ Budget page
□ Profile page
□ Password-change notification
□ Logout confirmation dialog
□ Swagger API documentation
Important: Save the actual screenshots in docs/screenshots/ using the filenames above so GitHub renders them correctly.

## 11. API Documentation

FastAPI provides interactive API documentation when the backend is running.

URL	Purpose
http://127.0.0.1:8000/docs	Interactive Swagger UI
http://127.0.0.1:8000/openapi.json	OpenAPI schema
http://127.0.0.1:8000/health	Health check, if configured
Authentication routes: registration, login, current-user profile retrieval, profile-name updates, and password changes.

Expense, category, and budget routes:

Method	Endpoint	Purpose
GET	/api/v1/expenses	List all expenses of current user
POST	/api/v1/expenses	Create a new expense
PUT	/api/v1/expenses/{id}	Update an expense
DELETE	/api/v1/expenses/{id}	Delete an expense
GET	/api/v1/categories	List categories
POST	/api/v1/categories	Create a category
DELETE	/api/v1/categories/{id}	Delete a category
GET	/api/v1/budgets	List budgets
POST	/api/v1/budgets	Create/update a budget
DELETE	/api/v1/budgets/{id}	Delete a budget
Refer to the current Swagger UI for the exact paths, methods, request schemas, and responses.

## 12. Security Considerations

Store passwords as secure hashes, never as plain text.

Keep .env files and credentials out of version control.

Use strong secrets for token signing.

Authenticate protected backend routes.

Validate input on the backend as well as the frontend.

Ensure users can access only their own authorized records.

Avoid logging passwords, tokens, or sensitive financial information.

Use HTTPS and production-appropriate token or cookie handling when deployed.

Use database credentials with only the permissions required by the application.

## 13. Future Enhancements

Potential improvements include:

Category-wise expense filtering.

Expense charts and financial summaries.

Search, sorting, and date-range filters.

CSV or PDF report export.

Recurring expenses.

Automated backend and frontend tests.

Production deployment and continuous integration.

Pagination and application monitoring.

## 14. Conclusion

The Personal Expense Tracker demonstrates the development of a full-stack web application using React, FastAPI, and PostgreSQL.

The project separates frontend presentation, backend API logic, and database persistence. Its modules cover authentication, profile management, password changes, expense recording, category management, budget tracking, and logout confirmation.

The application provides a foundation for further development into a comprehensive personal finance management system.

## Project Information

Project Name: Personal Expense Tracker

Developer: Dhruvit Jadav

Internship Organization: Labmentix

Frontend: React + Vite

Backend: Python + FastAPI

Database: PostgreSQL

ORM: SQLAlchemy

Migrations: Alembic

GitHub Repository: https://github.com/JADAVDHRUVIT21/Personal-Expense-Tracker


---

### Summary of what changed

| Change | Details |
|---|---|
| **New screenshots added** | 10.4 Expense, 10.5 Category, 10.6 Budget pages — with descriptions |
| **Numbering fixed** | Old doc skipped 10.5; now sequential (10.1 → 10.9) |
| **Screenshot checklist** | Added Expense / Category / Budget entries |
| **Table of Contents** | Updated (list same, but sections referenced correctly) |
| **Core Features** | Added Expense Management, Category Management, Budget Management |
| **Use Cases** | Added Use Case 6 (Expenses), 7 (Categories), 8 (Budgets) |
| **Application Workflow** | Added Expense, Category, Budget workflows |
| **API Documentation** | Added endpoint table for expenses/categories/budgets |
| **Project Information** | Filled in: Dhruvit Jadav, Labmentix, GitHub URL |
| **Git clone command** | Replaced placeholder with real repo URL |
| **Architecture diagram** | Added expense/category/budget pages note |
| **Objectives** | Added expense, category, budget goals |

### To actually add the images on GitHub

Save your screenshots into the repo at these exact paths: