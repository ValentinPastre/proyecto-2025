from fastapi import FastAPI, Query
from pydantic import BaseModel
import os
import glob
import uuid
import soundfile as sf
from kokoro import KPipeline
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = KPipeline(lang_code="e")  # español: 'e'

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_outputs():
    files = glob.glob(os.path.join(OUTPUT_DIR, "*.wav"))
    for f in files:
        try:
            os.remove(f)
            print(f"File deleted: {f}")
        except Exception as e:
            print(f"Delete audio failed {f}: {e}")


class TTSRequest(BaseModel):
    text: str
    voice: str = "bm_fable"
    speed: float = 1.0


# 1. Cambiado de @app.get a @app.post
@app.post("/tts")
# 2. Cambiada la firma de la función para que acepte el Body de TTSRequest
async def generate_tts(request: TTSRequest):
    clean_outputs()

    # generate unique filename
    filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(OUTPUT_DIR, filename)

    # 3. Usar request.text, request.voice, y request.speed del body
    generator = pipeline(
        request.text,
        voice=request.voice,
        speed=request.speed,
        split_pattern=r'\n+'
    )

    # get first audio segment for simplicity
    for gs, ps, audio in generator:
        sf.write(output_path, audio, 24000)
        break # Asegurarse de que solo se escriba un archivo

    # Esta URL es correcta porque el puerto 8002 está expuesto al host
    # y el frontend (navegador) puede acceder a él.
    return {"audio_url": f"http://localhost:8002/audio/{filename}"}


# serve audio files
app.mount("/audio", StaticFiles(directory=OUTPUT_DIR), name="audio")