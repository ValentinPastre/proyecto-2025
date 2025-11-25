# proyecto-2025

Proyecto final de la carrera de Analista en Computación -- Año 2025.\
Sistema compuesto por Frontend, Backend (Node.js), Captioning API, TTS API y **Speech-to-Text API** 

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
-   numpy < 2
-   deep-translator
-   requests
-   kokoro
-   soundfile

### TTS (Python)

-   Python 3.10
-   fastapi
-   uvicorn
-   python-multipart
-   numpy < 2
-   kokoro
-   soundfile
-   torch==2.2.2 (CPU)
-   transformers==4.39.3

### Speech-to-Text (Python)

-   Python 3.10
-   fastapi
-   uvicorn
-   torch
-   torchaudio
-   transformers
-   soundfile
-   numpy
-   python-multipart

## 🐳 Docker

La aplicación completa se ejecuta mediante Docker Compose.

### Requisitos

-   Docker Desktop instalado
-   Puertos libres: 8080, 3000, 3001, 8002, 5000

## ▶️ Cómo levantar la aplicación

### 1. Construir imágenes

    docker-compose build

### 2. Levantar todos los servicios

    docker-compose up

### (opcional) Modo background

    docker-compose up -d

### 3. Acceso a cada servicio

| Servicio       | URL                           |
| :------------- | :---------------------------- |
| Frontend       | http://localhost:8080         |
| Backend        | http://localhost:3000         |
| Captioning     | http://localhost:3001/caption |
| TTS            | http://localhost:8002/tts     |
| **Speech-to-Text** | http://localhost:5000/stt |

## 🛑 Detener la app

    docker-compose down
    o CTRL + C

---

## 🎙️ Control por Voz

La aplicación cuenta con un sistema de **Speech-to-Text** integrado que permite navegar y controlar formularios mediante la voz.

### Modo Push-to-Talk (Pulsar para hablar)
El sistema no escucha todo el tiempo por privacidad. Para activar el reconocimiento de voz:
1.  **Teclado:** Mantén presionada la **Barra Espaciadora**, o
2.  **Táctil/Mouse:** Mantén presionado el botón flotante del micrófono (🎤) en la esquina inferior derecha.


### Comandos Disponibles

El sistema normaliza el texto (elimina tildes y mayúsculas), por lo que no es necesario ser exacto con la entonación.

#### Navegación
| Comando de Voz | Acción |
| :--- | :--- |
| "Login", "Entrar", "Inicio", "Acceder" | Navega a la pantalla de **Login**. |
| "Registro", "Registrar", "Crear", "Alta" | Navega a la pantalla de **Registro**. |
| "Ir a cámara", "Foto", "Cámara", "Visión" | Abre la funcionalidad de **Cámara**. |
| "Cerrar sesión", "Logout", "Salir" | Cierra la sesión actual del usuario. |

#### Formularios (Login y Registro)
El sistema detecta palabras clave para rellenar campos automáticamente.

| Intención | Ejemplo de Comando | Notas |
| :--- | :--- | :--- |
| **Email** | *"Escribir **juan arroba gmail punto com** en email"* | Convierte "arroba" en `@` y "punto" en `.`. |
| **Contraseña** | *"Escribir **secreto123** en contraseña"* | Rellena el campo de contraseña principal. |
| **Repetir Contraseña** | *"Repetir contraseña **secreto123**"* | Rellena el campo de confirmación (Registro). |
| **Enviar/Confirmar** | *"Enviar", "Entrar", "Ingresar", "Aceptar"* | Hace click en el botón de envío del formulario. |
| **Limpiar** | *"Limpiar", "Borrar", "Vaciar"* | Borra el contenido de los campos de texto. |

#### Cámara y Multimedia
| Comando de Voz | Acción |
| :--- | :--- |
| "Capturar", "Tomar foto", "Sacar foto" | Toma una fotografía si la cámara está activa. |
| "Reproducir", "Play", "Escuchar" | Reproduce el audio generado (si existe). |
| "Pausar", "Stop", "Detener" | Pausa la reproducción de audio. |