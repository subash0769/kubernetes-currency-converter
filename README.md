# 💱 Currency Converter Web Application

A clean, modern, and responsive Currency Converter web application built with Python Flask on the backend and pure HTML5, CSS3, and modern JavaScript on the frontend.

It provides real-time currency conversions using live exchange rates with an intelligent fallback to an accurate offline dataset whenever network access is unavailable.

---

## ✨ Features

- **Intuitive & Minimal UI**: Light modern theme styled with soft purple/blue accents and subtle ambient glows.
- **Responsive Layout**: Designed for both desktop displays and mobile smartphones with adaptive grid sizing.
- **Live & Offline Resilient**: Queries the free Open Exchange Rates API (`open.er-api.com`) with a 30-minute in-memory cache, and seamlessly switches to an internal fallback dataset if offline.
- **Instant Currency Swap**: Flip source and target currencies in one click with smooth rotation feedback.
- **Quick Amount Presets**: Instant selection buttons for standard amounts ($10, $50, $100, $500, $1,000).
- **Exchange Rate Breakdown**: Clearly displays both direct (`1 USD = 135.25 NPR`) and inverse (`1 NPR = 0.0074 USD`) conversion rates.
- **Client & Server-side Validation**: Friendly error alerts for empty, non-numeric, or negative amounts.
- **Health Check Endpoint**: Built-in `/health` API for monitoring.

---

## 🌐 Supported Currencies

| Code | Currency Name | Symbol |
| :--- | :--- | :--- |
| **USD** | US Dollar | `$` |
| **NPR** | Nepalese Rupee | `रू` |
| **EUR** | Euro | `€` |
| **GBP** | British Pound | `£` |
| **INR** | Indian Rupee | `₹` |
| **AUD** | Australian Dollar | `A$` |
| **CAD** | Canadian Dollar | `C$` |
| **JPY** | Japanese Yen | `¥` |

---

## 🛠️ Technology Stack

- **Backend**: Python 3, Flask, Requests
- **Frontend**: HTML5, Vanilla JavaScript (ES6+ Fetch API), CSS3 (Flexbox, CSS Grid, Custom Properties)
- **API**: Open Exchange Rates API (free, no API key required) + offline fallback matrix

---

## 📁 Project Structure

```text
currency-converter/
├── app.py              # Flask server, routes (/convert, /health, /), and exchange rate logic
├── requirements.txt    # Python dependencies (Flask, requests)
├── README.md           # Documentation and run instructions
├── templates/
│   └── index.html      # Converter web interface
└── static/
    ├── style.css       # Clean, modern stylesheet with blue & purple accents
    └── script.js       # Asynchronous API requests, UI updates, and validation
```

---

## 🚀 How to Run the Application Locally

Follow these straightforward steps to run the application on your computer.

### 1. Prerequisites

Ensure you have **Python 3.8+** installed. You can check your version in a terminal:

```bash
python3 --version
```

### 2. Navigate to the Project Directory

```bash
cd ~/Downloads/currency-converter
```

### 3. Create and Activate a Virtual Environment

*On macOS / Linux:*
```bash
python3 -m venv venv
source venv/bin/activate
```

*On Windows (Command Prompt / PowerShell):*
```cmd
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies

Install Flask and Requests using `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 5. Start the Flask Server

Run the Flask server:

```bash
python app.py
```

The console will output:
```text
 * Serving Flask app 'app'
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
```

> **Note for macOS Users**: On macOS Monterey and later, Apple's **AirPlay Receiver** service listens on port `5000` by default. If you see an `Address already in use` error:
> - Option A (Recommended): Turn off AirPlay Receiver in **System Settings > General > AirDrop & AirPlay > AirPlay Receiver (Toggle Off)**.
> - Option B: Specify an alternate port via environment variable: `PORT=5001 python app.py`.

### 6. Open in Your Browser

Open your favorite web browser and visit:
👉 **[http://localhost:5000](http://localhost:5000)** or **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📡 API Endpoints

### 1. Health Check
- **Endpoint**: `GET /health`
- **Description**: Verifies that the service is running.
- **Example Response**:
  ```json
  {
    "message": "Currency converter service is up and running",
    "service": "currency-converter",
    "status": "ok"
  }
  ```

### 2. Convert Currency
- **Endpoint**: `POST /convert`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "amount": 100,
    "source": "USD",
    "target": "NPR"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "amount": 100.0,
    "converted_amount": 13525.0,
    "exchange_rate": 135.25,
    "rate_display": "1 USD = 135.25 NPR",
    "rate_source": "Live Market API",
    "reverse_rate_display": "1 NPR = 0.0074 USD",
    "source": "USD",
    "source_name": "US Dollar",
    "source_symbol": "$",
    "success": true,
    "target": "NPR",
    "target_name": "Nepalese Rupee",
    "target_symbol": "रू"
  }
  ```
- **Error Response (400 Bad Request)**:
  ```json
  {
    "error": "Please enter an amount greater than zero."
  }
  ```

---

## 💡 Testing with cURL

You can test the conversion endpoint directly from your terminal:

```bash
curl -X POST http://127.0.0.1:5000/convert \
     -H "Content-Type: application/json" \
     -d '{"amount": 250, "source": "USD", "target": "EUR"}'
```
# kubernetes-currency-converter
