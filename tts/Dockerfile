FROM python:3.10-slim

WORKDIR /app

COPY requirements.base.txt requirements.base.txt
COPY requirements.tts.txt requirements.tts.txt

RUN pip install --no-cache-dir -r requirements.base.txt
RUN pip install --no-cache-dir -r requirements.tts.txt

COPY . .

# Expone el puerto que usará el contenedor
EXPOSE 8002

# Comando para iniciar el servidor Uvicorn en el puerto 8002
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]