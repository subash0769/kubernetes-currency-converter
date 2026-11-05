FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/app/deps -r requirements.txt
COPY . .


FROM gcr.io/distroless/python3-debian12

WORKDIR /app

ENV PYTHONPATH="/usr/local/lib/python3.11/site-packages"

COPY --from=builder /app/deps /usr/local/lib/python3.11/site-packages
COPY --from=builder /app /app

CMD ["app.py"]