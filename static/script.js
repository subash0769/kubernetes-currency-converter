/**
 * Currency Converter Client-Side Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    // Currency symbols lookup
    const CURRENCY_SYMBOLS = {
        USD: "$",
        NPR: "रू",
        EUR: "€",
        GBP: "£",
        INR: "₹",
        AUD: "A$",
        CAD: "C$",
        JPY: "¥"
    };

    // DOM Elements
    const form = document.getElementById("converter-form");
    const amountInput = document.getElementById("amount");
    const sourceSelect = document.getElementById("source-currency");
    const targetSelect = document.getElementById("target-currency");
    const swapBtn = document.getElementById("swap-btn");
    const convertBtn = document.getElementById("convert-btn");
    const btnText = convertBtn.querySelector(".btn-text");
    const spinner = convertBtn.querySelector(".spinner");

    const errorBanner = document.getElementById("error-banner");
    const errorMessage = document.getElementById("error-message");

    const sourceSymbolPreview = document.getElementById("source-symbol-preview");
    const fromAmountSubtext = document.getElementById("from-amount-subtext");
    const targetSymbolDisplay = document.getElementById("target-symbol-display");
    const resultAmount = document.getElementById("result-amount");
    const targetCodeDisplay = document.getElementById("target-code-display");
    const exchangeRateText = document.getElementById("exchange-rate-text");
    const reverseRateText = document.getElementById("reverse-rate-text");
    const rateBadge = document.getElementById("rate-badge");

    const chipButtons = document.querySelectorAll(".chip-btn");

    /**
     * Show an error alert
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorBanner.removeAttribute("hidden");
    }

    /**
     * Hide the error alert
     */
    function hideError() {
        errorBanner.setAttribute("hidden", "true");
    }

    /**
     * Update source symbol prefix
     */
    function updateSourceSymbol() {
        const symbol = CURRENCY_SYMBOLS[sourceSelect.value] || "$";
        sourceSymbolPreview.textContent = symbol;
    }

    /**
     * Format number with comma separators
     */
    function formatNumber(num, isJapaneseYen = false) {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: isJapaneseYen ? 0 : 2,
            maximumFractionDigits: isJapaneseYen ? 0 : 2
        }).format(num);
    }

    /**
     * Perform the conversion request via Flask API
     */
    async function performConversion() {
        const rawAmount = amountInput.value.trim();

        // Client-side validation
        if (!rawAmount) {
            showError("Please enter an amount to convert.");
            amountInput.focus();
            return;
        }

        const amount = parseFloat(rawAmount);
        if (isNaN(amount) || amount <= 0) {
            showError("Please enter a valid amount greater than zero.");
            amountInput.focus();
            return;
        }

        hideError();

        // UI Loading state
        convertBtn.disabled = true;
        btnText.textContent = "Converting...";
        spinner.removeAttribute("hidden");

        const source = sourceSelect.value;
        const target = targetSelect.value;

        try {
            const response = await fetch("/convert", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount,
                    source: source,
                    target: target
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showError(data.error || "Failed to convert currency. Please try again.");
                return;
            }

            // Update UI with conversion results
            const isTargetJPY = target === "JPY";
            const formattedConverted = formatNumber(data.converted_amount, isTargetJPY);
            const formattedSourceAmount = formatNumber(data.amount, source === "JPY");

            fromAmountSubtext.textContent = `${formattedSourceAmount} ${source} =`;
            targetSymbolDisplay.textContent = data.target_symbol || (CURRENCY_SYMBOLS[target] || "");
            resultAmount.textContent = formattedConverted;
            targetCodeDisplay.textContent = target;

            // Update exchange rate info
            exchangeRateText.textContent = data.rate_display;
            reverseRateText.textContent = data.reverse_rate_display;

            // Update source badge
            rateBadge.textContent = data.rate_source;
            if (data.rate_source.includes("Live")) {
                rateBadge.classList.remove("fallback-badge");
            } else {
                rateBadge.classList.add("fallback-badge");
            }

        } catch (err) {
            showError("Network error. Could not connect to the currency conversion server.");
        } finally {
            convertBtn.disabled = false;
            btnText.textContent = "Convert Currency";
            spinner.setAttribute("hidden", "true");
        }
    }

    /**
     * Swap source and target currencies
     */
    function swapCurrencies() {
        // Trigger rotate animation
        swapBtn.classList.add("rotating");
        setTimeout(() => swapBtn.classList.remove("rotating"), 400);

        const currentSource = sourceSelect.value;
        const currentTarget = targetSelect.value;

        sourceSelect.value = currentTarget;
        targetSelect.value = currentSource;

        updateSourceSymbol();
        performConversion();
    }

    // Event Listeners
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        performConversion();
    });

    convertBtn.addEventListener("click", (e) => {
        e.preventDefault();
        performConversion();
    });

    swapBtn.addEventListener("click", swapCurrencies);

    sourceSelect.addEventListener("change", () => {
        updateSourceSymbol();
        performConversion();
    });

    targetSelect.addEventListener("change", () => {
        performConversion();
    });

    // Quick chip buttons
    chipButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            chipButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            amountInput.value = btn.dataset.value;
            performConversion();
        });
    });

    // Clear error as user types
    amountInput.addEventListener("input", () => {
        if (amountInput.value && parseFloat(amountInput.value) > 0) {
            hideError();
        }
    });

    // Initialize UI
    updateSourceSymbol();
    performConversion();
});
