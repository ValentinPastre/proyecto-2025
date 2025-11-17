# proyecto-2025

Proyecto final de la carrera de Analista en Computación -- Año 2025.\
Sistema compuesto por Frontend, Backend (Node.js), Captioning API y TTS
API (Python + FastAPI).

## 📦 Dependencias

### Frontend

-   Nginx (Docker)

### Backend (Node.js)

-   Node.js 20+
-   express
-   multer

### Captioning (Python)

-   Python 3.10
-   fastapi
-   uvicorn
-   python-multipart
-   numpy \< 2
-   deep-translator
-   requests
-   kokoro
-   soundfile

### TTS (Python)

-   Python 3.10
-   fastapi
-   uvicorn
-   python-multipart
-   numpy \< 2
-   kokoro
-   soundfile
-   torch==2.2.2 (CPU)
-   transformers==4.39.3

## 🐳 Docker

La aplicación completa se ejecuta mediante Docker Compose.

### Requisitos

-   Docker Desktop instalado
-   Puertos libres: 8080, 3000, 3001, 8002

## ▶️ Cómo levantar la aplicación

### 1. Construir imágenes

    docker-compose build

### 2. Levantar todos los servicios

    docker-compose up

### (opcional) Modo background

    docker-compose up -d

### 3. Acceso a cada servicio

  Servicio     URL
  ------------ -------------------------------
  Frontend     http://localhost:8080
  Backend      http://localhost:3000
  Captioning   http://localhost:3001/caption
  TTS          http://localhost:8002/tts

## 🛑 Detener la app

    docker-compose down
    o CTRL + C
