# 🏨 Hotel Management System

A full-stack web application for managing hotel operations — including customer bookings, staff check-ins, admin controls, and secure user access. Built for educational and demonstration purposes in modern web development.

**Project Year: 2024**

---

## 📖 Project Summary

The **Hotel Management System** is a full-stack web application designed to streamline hotel operations. It enables room reservations, customer interactions, and staff/admin tasks through a user-friendly interface, offering both functionality and security.

---

## ✅ Features

### 👤 Customer Panel
- User registration and login
- Browse and book available rooms
- View booking history
- Submit reviews and ratings

### 👩‍💼 Staff/Admin Panel
- Manage room bookings and reservations
- Check-in and check-out customers
- Monitor amenities and services
- View reviews and payment/reservation trends
- Search customers and their booking history

### 🔐 Security Features
- Password encryption using `bcrypt`
- Two-Factor Authentication (2FA) with `Speakeasy` and QR code via email
- Role-based access and session validation

---

## 🛠 Technologies Used

### 💻 Frontend
- HTML, CSS, JavaScript
- EJS Templating
- Chart.js for visual analytics

### 🌐 Backend
- Node.js + Express.js
- RESTful API Architecture
- MySQL (Hosted on AWS RDS)
- Nodemailer for email-based OTP and 2FA

---

## 🗃️ Database Design

- Relational schema with 10+ normalized tables
- Tables include Customers, Rooms, Bookings, Reviews, Payments, Services, Staff
- 10+ SQL Views for reporting and analytics
- Triggers for price calculation, status changes, and review tracking
- Stored Procedures for data validation and complex operations
- Indexes implemented for optimized queries

---

## ☁️ Cloud Integration

- MySQL Database hosted on **AWS RDS**
- SSL/TLS encrypted connection
- Automated daily backups and failover support
- Monitoring and metrics via Amazon CloudWatch

---

## 🧱 System Architecture

The application follows a modular, layered architecture consisting of:

- **Presentation Layer**: Interfaces for customers, staff, and admins using HTML, CSS, JS, and EJS.
- **Business Logic Layer**: Node.js routes and controllers managing validations, bookings, and service logic.
- **Data Access Layer**: MySQL database accessed via parameterized SQL queries and ORM-style interactions.
- **Security Layer**: Implements password hashing, session validation, and 2FA to protect user data and operations.

This structure allows for scalability, maintainability, and secure multi-role access.

---

## 📎 Project Report

📄 [View Full Report – PDF](Project_COSC641.pdf)
