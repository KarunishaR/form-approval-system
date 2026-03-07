# Form Approval System

A web-based workflow management system that allows users to submit forms and enables authorized personnel to review, approve, or reject them through a structured approval process.

This system helps organizations replace manual approval processes (emails, paper forms) with a digital workflow.

---

## 🚀 Features

- User authentication and role-based access
- Submit forms digitally
- Multi-level approval workflow
- Approve / Reject requests
- Status tracking for submitted forms
- Dashboard for approvers
- Secure backend API
- Database storage of form records

---

## 🧠 Problem Statement

In many organizations, form approvals are handled through email or physical paperwork.  
This leads to:

- Slow approval processes
- Lost documents
- Lack of tracking
- Poor transparency

The **Form Approval System** solves this by providing a centralized digital platform for submitting and approving forms.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- FastAPI (Python)

### Database
- PostgreSQL / MySQL

### Tools
- Git
- GitHub
- REST API

---

## ⚙️ System Workflow

1. User logs into the system
2. User submits a form request
3. The request is sent to the designated approver
4. Approver reviews the request
5. Approver can:
   - Approve
   - Reject
6. Status is updated in the system

---

## 📂 Project Structure
form-approval-system
│
├── frontend
│ └── React application
│
├── backend
│ └── FastAPI server
│
├── database
│ └── SQL schema / migrations
│
└── README.md

## ▶️ How to Run the Project

### 1️⃣ Clone the Repository


git clone https://github.com/KarunishaR/form-approval-system.git


### 2️⃣ Go to the Project Folder


cd form-approval-system


### 3️⃣ Run Backend


cd backend
uvicorn main:app --reload


### 4️⃣ Run Frontend


cd frontend
npm install
npm start


---

## 📊 Future Improvements

- Email notifications
- Mobile responsive UI
- Approval history tracking
- File attachment support
- Admin dashboard

---

## 👩‍💻 Author

Karunisha R

GitHub:  
https://github.com/KarunishaR
