import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import sounddevice as sd
import numpy as np
import keyboard
import sys
import os
import logging
import transformers

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3" 
logging.getLogger("transformers").setLevel(logging.ERROR)
transformers.logging.set_verbosity_error()

MODEL_PATH = "./whisper_argentino" #Pesa 930 MB ya vamos a ver como lo subimos
SAMPLE_RATE = 16000


try:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    processor = WhisperProcessor.from_pretrained(MODEL_PATH)
    model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH).to(device)
    model.config.forced_decoder_ids = processor.get_decoder_prompt_ids(language="spanish", task="transcribe")
    model.config.suppress_tokens = []
    
    print(f" Modelo cargado en {device.upper()}")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

def transcribir(audio_np):
    audio_np = audio_np.astype(np.float32)
    
    input_features = processor(
        audio_np, 
        sampling_rate=SAMPLE_RATE, 
        return_tensors="pt"
    ).input_features.to(device)
    
    with torch.no_grad():
        predicted_ids = model.generate(
            input_features,
            language="spanish",
            task="transcribe",
            no_repeat_ngram_size=3,
            num_beams=1 
        )
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    return transcription.strip()

def seleccionar_microfono():
    print("\n Dispositivos de audio ")
    dispositivos = sd.query_devices()
    for i, dev in enumerate(dispositivos):
        if dev['max_input_channels'] > 0:
            print(f"ID: {i} | Nombre: {dev['name']}")
    print("-" * 40)
    
    while True:
        try:
            seleccion = input("\nID del micrófono: ")
            dev_id = int(seleccion)
            sd.check_input_settings(device=dev_id, samplerate=SAMPLE_RATE)
            print(f" Seleccionado: {dispositivos[dev_id]['name']}")
            return dev_id
        except Exception as e:
            print(f" Error: {e}")

def main():
    mic_id = seleccionar_microfono()

    print("\n" + "="*50)
    print(" Whisper argentino: Push-To-Talk")
    print(" Espacio para hablar | ESC para salir")
    print("="*50 + "\n")

    buffer_audio = []
    grabando = False
    
    with sd.InputStream(device=mic_id, samplerate=SAMPLE_RATE, channels=1) as stream:
        while True:
            try:
                if keyboard.is_pressed('esc'):
                    print("\n Saliendo")
                    break
                if keyboard.is_pressed('space'):
                    if not grabando:
                        print(" Escuchando", end="\r")
                        grabando = True
                        buffer_audio = []
                    chunk, _ = stream.read(int(SAMPLE_RATE * 0.1))
                    buffer_audio.append(chunk)
                elif grabando:
                    print("\n Pensando", end="\r")
                    grabando = False
                    
                    if len(buffer_audio) > 0:
                        full_audio = np.concatenate(buffer_audio, axis=0).flatten()
                        if len(full_audio) / SAMPLE_RATE < 0.5:
                            print("Audio muy corto")
                        else:
                            try:
                                texto = transcribir(full_audio)
                                alucinaciones = ["Gracias", "Subtítulos", "MBC", "."]
                                if texto in alucinaciones or len(texto) < 2:
                                    print("(Ignorado)")
                                else:
                                    print("\n" + "-"*40)
                                    print(f"{texto}")
                                    print("-"*40 + "\n")   
                            except Exception as e:
                                print(f"Error: {e}")
                    print("Esperando Espacio ", end="\r")
                else:
                    stream.read(int(SAMPLE_RATE * 0.1))     
            except KeyboardInterrupt:
                break

if __name__ == "__main__":
    main()