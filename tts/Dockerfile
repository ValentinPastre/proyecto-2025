FROM python:3.10-slim

WORKDIR /app

COPY requirements.base.txt requirements.base.txt
COPY requirements.tts.txt requirements.tts.txt

RUN pip install --no-cache-dir -r requirements.base.txt
RUN pip install --no-cache-dir -r requirements.tts.txt

COPY . .

CMD ["python", "main.py"]
