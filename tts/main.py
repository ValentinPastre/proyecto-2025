from fastapi import FastAPI, Query
from pydantic import BaseModel
import os
import glob
import uuid
import soundfile as sf
from kokoro import KPipeline
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/tts")
async def generate_tts(
    text: str = Query(...),
    voice: str = Query("bm_fable"),
    speed: float = Query(1.0)
):
    clean_outputs()

    # generate unique filename
    filename = f"{uuid.uuid4()}.wav"
    output_path = os.path.join(OUTPUT_DIR, filename)

    generator = pipeline(
        text,
        voice=voice,
        speed=speed,
        split_pattern=r'\n+'
    )

    # get first audio segment for simplicity
    for gs, ps, audio in generator:
        sf.write(output_path, audio, 24000)
        break

    return {"audio_url": f"http://localhost:8002/audio/{filename}"}

# serve audio files
from fastapi.staticfiles import StaticFiles
app.mount("/audio", StaticFiles(directory=OUTPUT_DIR), name="audio")
