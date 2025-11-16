FROM python:3.10-slim

WORKDIR /app

COPY requirements.base.txt requirements.base.txt
COPY requirements.captioning.txt requirements.captioning.txt

RUN pip install --no-cache-dir -r requirements.base.txt
RUN pip install --no-cache-dir -r requirements.captioning.txt

COPY . .

CMD ["python", "main.py"]
