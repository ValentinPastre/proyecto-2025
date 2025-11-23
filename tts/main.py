from fastapi import FastAPI, Query
from pydantic import BaseModel
import os
import glob
import uuid
import soundfile as sf
from kokoro import KPipeline
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import time
import numpy as np
from fastapi.responses import FileResponse


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
    now = time.time()
    for f in files:
        if now - os.path.getmtime(f) > 300: #5 min
            try:
                os.remove(f)
                print(f"File deleted: ", f)
            except Exception as e:
                print(f"Delete audio failed {f}: {e}")


class TTSRequest(BaseModel):
    text: str
    voice: str = "bm_fable"
    speed: float = 1.0


@app.post("/tts")
async def generate_tts(request: TTSRequest):
    # NO limpiar todavía
    # clean_outputs()

    filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(OUTPUT_DIR, filename)

    generator = pipeline(
        request.text,
        voice=request.voice,
        speed=request.speed,
        split_pattern=r'\n+'
    )

    # Generar audio real
    for gs, ps, audio in generator:
        audio_np = audio.detach().cpu().numpy()
        audio_int16 = (audio_np * 32767).astype(np.int16)
        sf.write(output_path, audio_int16, 24000, subtype="PCM_16")

        break

    internal_url = f"http://tts:8002/audio/{filename}"
    public_url = f"http://localhost:8002/audio/{filename}"

    return {
        "internal_url": internal_url,
        "audio_url": public_url
    }

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    return FileResponse(file_path, media_type="audio/wav")

# app.mount("/audio", StaticFiles(directory=OUTPUT_DIR), name="audio")
