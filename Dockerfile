FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN mkdir -p /app/uploads && chmod 777 /app/uploads


COPY api/ ./api/
COPY models/ ./models/

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*


RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r api/requirements.txt

RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm --version && node --version

WORKDIR /app/api
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
