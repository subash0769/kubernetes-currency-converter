import os
import time
import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Supported currencies with names and symbols
SUPPORTED_CURRENCIES = {
    "USD": {"name": "US Dollar", "symbol": "$", "flag": "🇺🇸"},
    "NPR": {"name": "Nepalese Rupee", "symbol": "रू", "flag": "🇳🇵"},
    "EUR": {"name": "Euro", "symbol": "€", "flag": "🇪🇺"},
    "GBP": {"name": "British Pound", "symbol": "£", "flag": "🇬🇧"},
    "INR": {"name": "Indian Rupee", "symbol": "₹", "flag": "🇮🇳"},
    "AUD": {"name": "Australian Dollar", "symbol": "A$", "flag": "🇦🇺"},
    "CAD": {"name": "Canadian Dollar", "symbol": "C$", "flag": "🇨🇦"},
    "JPY": {"name": "Japanese Yen", "symbol": "¥", "flag": "🇯🇵"},
}

# Predefined fallback exchange rates (relative to 1 USD)
FALLBACK_RATES = {
    "USD": 1.0,
    "NPR": 135.25,
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 86.50,
    "AUD": 1.55,
    "CAD": 1.40,
    "JPY": 154.30,
}

# Simple in-memory cache for live rates
rates_cache = {
    "timestamp": 0,
    "rates": FALLBACK_RATES.copy(),
    "is_live": False,
}
CACHE_DURATION_SECONDS = 1800  # 30 minutes


def get_latest_rates():
    """
    Fetch exchange rates from a free API or fallback to predefined rates.
    Rates are cached in-memory for 30 minutes to reduce external calls.
    """
    current_time = time.time()
    if current_time - rates_cache["timestamp"] < CACHE_DURATION_SECONDS and rates_cache["is_live"]:
        return rates_cache["rates"], rates_cache["is_live"]

    try:
        # Free exchange rates API (Open Exchange Rates / open.er-api.com)
        response = requests.get("https://open.er-api.com/v6/latest/USD", timeout=3)
        if response.status_code == 200:
            data = response.json()
            api_rates = data.get("rates", {})

            # Filter and verify only the supported currencies
            updated_rates = {}
            for code in SUPPORTED_CURRENCIES:
                if code in api_rates:
                    updated_rates[code] = float(api_rates[code])
                else:
                    updated_rates[code] = FALLBACK_RATES[code]

            rates_cache["rates"] = updated_rates
            rates_cache["timestamp"] = current_time
            rates_cache["is_live"] = True
            return updated_rates, True
    except Exception:
        # If API request fails or is unreachable, use fallback dataset
        pass

    rates_cache["rates"] = FALLBACK_RATES.copy()
    rates_cache["is_live"] = False
    return rates_cache["rates"], False


@app.route("/")
def index():
    """Render the currency converter home page."""
    return render_template("index.html", currencies=SUPPORTED_CURRENCIES)


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "service": "currency-converter",
        "message": "Currency converter service is up and running"
    }), 200


@app.route("/convert", methods=["POST"])
def convert():
    """
    Convert an amount between source and target currencies.
    Accepts JSON or form data.
    """
    data = request.get_json(silent=True) or request.form

    amount_raw = data.get("amount")
    source_curr = (data.get("source") or data.get("source_currency") or "").upper().strip()
    target_curr = (data.get("target") or data.get("target_currency") or "").upper().strip()

    # Validate amount
    if amount_raw is None or str(amount_raw).strip() == "":
        return jsonify({"error": "Please enter an amount to convert."}), 400

    try:
        amount = float(amount_raw)
        if amount <= 0:
            return jsonify({"error": "Please enter an amount greater than zero."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount format. Please enter a valid number."}), 400

    # Validate currencies
    if not source_curr or source_curr not in SUPPORTED_CURRENCIES:
        return jsonify({"error": f"Invalid source currency: '{source_curr}'."}), 400

    if not target_curr or target_curr not in SUPPORTED_CURRENCIES:
        return jsonify({"error": f"Invalid target currency: '{target_curr}'."}), 400

    # Get rates and calculate conversion
    rates, is_live = get_latest_rates()

    source_per_usd = rates.get(source_curr, FALLBACK_RATES.get(source_curr, 1.0))
    target_per_usd = rates.get(target_curr, FALLBACK_RATES.get(target_curr, 1.0))

    # Calculate rate: 1 Source = (target_per_usd / source_per_usd) Target
    exchange_rate = target_per_usd / source_per_usd
    converted_amount = amount * exchange_rate

    # Format numbers cleanly
    converted_rounded = round(converted_amount, 2 if target_curr != "JPY" else 0)
    rate_rounded = round(exchange_rate, 4)

    return jsonify({
        "success": True,
        "amount": amount,
        "source": source_curr,
        "source_name": SUPPORTED_CURRENCIES[source_curr]["name"],
        "source_symbol": SUPPORTED_CURRENCIES[source_curr]["symbol"],
        "target": target_curr,
        "target_name": SUPPORTED_CURRENCIES[target_curr]["name"],
        "target_symbol": SUPPORTED_CURRENCIES[target_curr]["symbol"],
        "exchange_rate": rate_rounded,
        "converted_amount": converted_rounded,
        "rate_display": f"1 {source_curr} = {rate_rounded:g} {target_curr}",
        "reverse_rate_display": f"1 {target_curr} = {round(1 / exchange_rate, 4):g} {source_curr}",
        "rate_source": "Live Market API" if is_live else "Predefined Dataset"
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
