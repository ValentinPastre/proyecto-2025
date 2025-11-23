from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import glob
import uuid
import time
import soundfile as sf
import numpy as np
from kokoro import KPipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)


class TTSService:
    def __init__(self, lang_code: str = "e"):
        self.pipeline = KPipeline(lang_code=lang_code)
        self.output_dir = OUTPUT_DIR

    def generate_audio(self, text: str, voice: str = "bm_fable", speed: float = 1.0) -> str:
        filename = f"{uuid.uuid4()}.wav"
        output_path = os.path.join(self.output_dir, filename)

        generator = self.pipeline(
            text,
            voice=voice,
            speed=speed,
            split_pattern=r'\n+'
        )

        for gs, ps, audio in generator:
            audio_np = audio.detach().cpu().numpy()
            audio_int16 = (audio_np * 32767).astype(np.int16)
            sf.write(output_path, audio_int16, 24000, subtype="PCM_16")
            break  # solo el primer chunk

        return filename

    def cleanup_old_files(self, max_age_seconds: int = 300):
        files = glob.glob(os.path.join(self.output_dir, "*.wav"))
        now = time.time()
        for f in files:
            if now - os.path.getmtime(f) > max_age_seconds:
                try:
                    os.remove(f)
                    print(f"Deleted old audio file: {f}")
                except Exception as e:
                    print(f"Failed to delete {f}: {e}")


class TTSRequest(BaseModel):
    text: str
    voice: str = "bm_fable"
    speed: float = 1.0


class TTSResponse(BaseModel):
    internal_url: str
    audio_url: str


tts_service = TTSService(lang_code="e")


@app.post("/tts", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    try:
        filename = tts_service.generate_audio(request.text, request.voice, request.speed)
        tts_service.cleanup_old_files()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

    internal_url = f"http://tts:8002/audio/{filename}"
    public_url = f"http://localhost:8002/audio/{filename}"

    return TTSResponse(internal_url=internal_url, audio_url=public_url)


@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="audio/wav")
