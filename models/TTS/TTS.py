# 1️⃣ Install kokoro
# !pip install -q kokoro>=0.9.4 soundfile
# 2️⃣ Install espeak for English fallback
# !apt-get -qq -y install espeak-ng > /dev/null 2>&1
# !pip install sounddevice

import os
import soundfile as sf
from kokoro import KPipeline

# Inicializamos pipeline una sola vez
pipeline = KPipeline(lang_code='b')  # Inglés = 'b', Español = 'e'

# Carpeta de salida
OUTPUT_DIR = os.path.join("models", "TTS", "Outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generar_audio(texto: str, nombre_archivo: str = "output.wav",
                  voz: str = "bm_fable", velocidad: float = 1.0) -> str:
    """
    Genera un archivo de audio WAV a partir de un texto usando Kokoro TTS.
    """

    generator = pipeline(
        texto,
        voice=voz,
        speed=velocidad,
        split_pattern=r'\n+'
    )

    output_path = os.path.join(OUTPUT_DIR, nombre_archivo)

    # Guardamos el primer fragmento del audio
    for i, (gs, ps, audio) in enumerate(generator):
        sf.write(output_path, audio, 24000)
        print(f"✅ Audio generado y guardado en: {output_path}")
        break

    return output_path
