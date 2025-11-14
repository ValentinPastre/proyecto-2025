# 1️⃣ Install kokoro
# !pip install -q kokoro>=0.9.4 soundfile
# 2️⃣ Install espeak, used for English OOD fallback and some non-English languages
# !apt-get -qq -y install espeak-ng > /dev/null 2>&1
# !pip install sounddevice
import os
import soundfile as sf
import torch
from kokoro import KPipeline


# Inicializamos la pipeline solo una vez 
pipeline = KPipeline(lang_code='b')  # Español (e) / Inglés (b)

# Carpeta de salida
OUTPUT_DIR = os.path.join("models", "TTS", "Outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generar_audio(texto: str, nombre_archivo: str = "output.wav", voz: str = "bm_fable", velocidad: float = 1.0) -> str:
    """
    Genera un archivo de audio a partir de un texto usando Kokoro TTS.
    
    Parámetros:
    ----------
    texto : str
        Texto que se convertirá en voz.
    nombre_archivo : str
        Nombre del archivo WAV a guardar.
    voz : str
        Nombre de la voz. Ej: 'em_santa' (español), 'bm_fable' (británico), 'hm_omega' (hindi)
    velocidad : float
        Factor de velocidad de la voz (1.0 = normal)

    Retorna:
    -------
    str : Ruta absoluta del archivo de audio generado.
    """
    # Generamos el audio
    generator = pipeline(
        texto,
        voice=voz,
        speed=velocidad,
        split_pattern=r'\n+'
    )
    
    # Guardamos el primer clip (si hay más, los concatenas o iteras)
    output_path = os.path.join(OUTPUT_DIR, nombre_archivo)

    for i, (gs, ps, audio) in enumerate(generator):
        sf.write(output_path, audio, 24000)
        print(f"✅ Audio generado y guardado en: {output_path}")

        break

    return output_path
