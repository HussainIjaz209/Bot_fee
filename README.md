# Trading Bot Fee & Referral Management System

A production-grade, human-centered web application built with **React.js**, **Node.js/Express**, and **MongoDB Atlas** to track, bill, and manage monthly subscription fees for trading bot clients while auditing and disbursing referral commissions.

---

## 🌟 Key Highlights & Business Rules

* **Client Monthly Bot Fee**: **$50.00 / month** per client.
* **Regional Manager Referral Bonus**: **$2.50 / client** earned by Talha whenever a client's monthly bot fee is marked paid.
* **Separation Principle**: The client’s $50 fee and Talha’s $2.50 referral bonus are decoupled. Collecting a fee sets the bonus to **`Bonus Pending`** (unpaid/pending release), allowing administrators to review and disburse referral payouts independently.
* **7-Day Free Trial Logic**: First payment date accommodates a 7-day free trial on the first month, with auto-calculated renewal dates (+30 days rolling).
* **Human-Centric / Humane UI Design**: Warm serene color palette, calm typography, delightful micro-interactions (confetti feedback on payment and bonus release), friendly one-click WhatsApp/Email reminders, and clutter-free 12-month overview.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**:
  * **React 19** with **Vite** (port `3000`)
  * **Tailwind CSS v4** with custom warm humanist theme
  * **Lucide React** icons
  * **Canvas Confetti** for celebration micro-interactions
* **Backend**:
  * **Node.js** & **Express** REST API (port `5000`)
  * **MongoDB Atlas** (collection: `bot_records`)
  * **JWT / Bearer Token** authentication (`requireAuth`)
  * **XLSX** engine for instant Excel sheet generation
* **Database**:
  * **MongoDB Atlas** URI configured in `backend/.env` (connected to `bot_records` collection)

---

## 🚀 Quick Start Guide

### 1. Install & Seed
```bash
# Seed initial sample client dataset (including Abdal & others) into MongoDB Atlas:
npm run seed
```

### 2. Start Backend & Frontend
In separate terminal windows:

```bash
# Terminal 1: Backend Server (http://localhost:5000)
npm run dev:backend

# Terminal 2: React Frontend (http://localhost:3000)
npm run dev:frontend
```

Now open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 👥 Default Login Credentials

| Name | Username | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Hussain Ijaz** | `HussainIjaz` | `admin123` | Administrator | Full management, payment logging, bonus release, Excel export |
| **Talha** | `Talha` | `Talha` | Regional Manager | View records, track fees, review referral payouts |

*(Quick one-click login pills are also provided on the sign-in screen).*

---

## 📊 Features & UI Modules

### 1. Real-Time Statistics & All-Time Analytics
* **Total Bot Clients**: Total registered accounts managed.
* **Current Month Collection**: Paid count, percentage, and total $ collected (e.g., `47 paid (90%) | $2,350 collected`).
* **Monthly Paid Out**: Shows the referral bonus received in the selected current month (e.g., `$2.50 received in October | 1 bonus received × $2.50 | $115.00 pending`).
* **All-Time Referral Payout**: Real-time audit of disbursed bonuses vs. pending release across all time.

### 2. Interactive 12-Month Grid
* **Client Details**: Client name, email, phone, and account/MT5 notes.
* **Billing Cycle**: Displays `1st` payment / registration date and auto-calculated `Next` renewal date.
* **Referral Bonus Column**:
  * `[ ⏳ Bonus Pending (Click to Pay) ]` (Pulsing Amber) – Click to immediately disburse $2.50 bonus to Talha.
  * `[ ✓ Bonus Paid ($2.50) ]` (Emerald) – Completed commission.
  * `Bot Fee Unpaid` (Muted gray) when fee is not yet collected.
* **Jan – Dec Monthly Cells**:
  * Click any cell to open the **Bot Fee Payment Modal** (Paid $50, Need to Pay, Unset, custom amount, date, transaction note).
  * In the **Bonus Pending** tab, clicking a paid month cell instantly disburses the referral bonus.

### 3. Multi-Level Filtering & Instant Search
* **All Clients**
* **Need to Pay ($50)**
* **Paid ($50)**
* **Bonus Pending ($2.50)**
* **Bonus Received ($2.50)**
* **Unset**
* Instant search by client name, email, phone, or MT5 notes.

### 4. Batch Actions Toolbar
* Select multiple clients with checkboxes.
* Bulk mark as **Paid ($50)**.
* Bulk disburse **Referral Bonus ($2.50)** with celebratory confetti.

### 5. Client Communications & Reminders
* Opens modal listing all unpaid clients for the current month.
* Generates formatted payment reminder messages for **WhatsApp** and **Email** with 1-click copy and direct `wa.me` links.

### 6. Excel Spreadsheet Export
* Click **Export Excel** to download `Bot_Fee_Records_<Year>.xlsx` with complete client contact info, month-by-month fee history, and referral payout status.
