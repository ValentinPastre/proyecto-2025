import torch
import torch.nn as nn
import torch.nn.functional as F
import torchaudio
import sounddevice as sd
import numpy as np
import json
import keyboard
import time
import os
import sys
from spellchecker import SpellChecker

INPUT_SIZE = 128
HIDDEN_SIZE = 512
NUM_LAYERS = 3
SAMPLE_RATE = 16000

USAR_CORRECTOR = True
IDIOMA_CORRECTOR = 'es'

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class SpeechRecognitionModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers):
        super(SpeechRecognitionModel, self).__init__()
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers=num_layers,
            bidirectional=True, batch_first=True, dropout=0.3
        )
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_size * 2, output_size)

    def forward(self, x):
        if x.dim() == 4: x = x.squeeze(1)
        x, _ = self.lstm(x)
        x = self.dropout(x)
        x = self.fc(x)
        x = F.log_softmax(x, dim=2)
        return x

corrector = SpellChecker(language=IDIOMA_CORRECTOR)

def cargar_modelo(modelo_path="pesos_modelo_stt_argentino.pth", vocab_path="vocabulario.json"):
    if not os.path.exists(modelo_path):
        sys.exit(1)

    with open(vocab_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    index_map = {int(k): v for k, v in data['index_map'].items()}
    output_size = max(index_map.keys()) + 1

    model = SpeechRecognitionModel(INPUT_SIZE, HIDDEN_SIZE, output_size, NUM_LAYERS)

    try:
        checkpoint = torch.load(modelo_path, map_location=device)
        saved_size = checkpoint['fc.bias'].shape[0]
        if saved_size != output_size:
            model = SpeechRecognitionModel(INPUT_SIZE, HIDDEN_SIZE, saved_size, NUM_LAYERS)

        model.load_state_dict(checkpoint)
    except Exception as e:
        sys.exit(1)

    model.to(device)
    model.eval()
    return model, index_map

transform_mel = torchaudio.transforms.MelSpectrogram(
    sample_rate=SAMPLE_RATE, n_mels=INPUT_SIZE
).to(device)

def limpiar_y_corregir(texto_crudo):
    if not USAR_CORRECTOR: return texto_crudo
    palabras = texto_crudo.split()
    palabras_corregidas = []
    for palabra in palabras:
        if palabra in corrector:
            palabras_corregidas.append(palabra)
        else:
            sugerencia = corrector.correction(palabra)
            palabras_corregidas.append(sugerencia if sugerencia else palabra)
    return " ".join(palabras_corregidas)

def transcribir(audio_np, model, index_map):
    waveform = torch.from_numpy(audio_np).float()

    max_val = waveform.abs().max()
    if max_val > 0: waveform = waveform / max_val
    else: return "", ""

    waveform = waveform.unsqueeze(0)

    with torch.no_grad():
        spectrogram = transform_mel(waveform.to(device))
        inputs = spectrogram.permute(0, 2, 1)
        outputs = model(inputs)
        decoded = torch.argmax(outputs, dim=2)
        raw = decoded[0].cpu().numpy()

        texto_fonetico = ""
        last = -1
        for token in raw:
            if token != 0 and token != last:
                texto_fonetico += index_map.get(token, "")
            last = token

    texto_final = limpiar_y_corregir(texto_fonetico)
    return texto_final, texto_fonetico

def main():
    print("\nDispositivos de audio disponibles:")
    print(sd.query_devices())
    print("-" * 60)

    dev_id = input("ID del micrófono (Enter para default): ")
    try:
        if dev_id.strip():
            sd.default.device = int(dev_id)
            print(f"Dispositivo seleccionado: {dev_id}")
        else:
            print("Dispositivo por defecto.")
    except Exception as e:
        print(f"Error seleccionando dispositivo: {e}")

    model, index_map = cargar_modelo()

  
    print("Mantener el boton de espacio para hablar. ESC para salir.\n")

    buffer_audio = []
    grabando = False

    stream = sd.InputStream(samplerate=SAMPLE_RATE, channels=1)
    stream.start()

    while True:
        try:
            if keyboard.is_pressed('esc'):
                break

            if keyboard.is_pressed('space'):
                if not grabando:
                    print("Grabando", end="\r")
                    grabando = True
                    buffer_audio = []

                chunk, overflow = stream.read(int(SAMPLE_RATE * 0.1))
                buffer_audio.append(chunk)

            elif grabando:
                print("Procesando", end="\r")
                grabando = False

                full_audio = np.concatenate(buffer_audio, axis=0).flatten()

                corte_inicio = int(SAMPLE_RATE * 0.15)
                if len(full_audio) > corte_inicio:
                    full_audio = full_audio[corte_inicio:]

                duracion = len(full_audio) / SAMPLE_RATE

                if duracion < 0.5:
                    print("Audio muy corto.")
                else:
                    try:
                        texto_limpio, texto_crudo = transcribir(full_audio, model, index_map)
                        print(f"Texto: {texto_limpio}")
                    except Exception as e:
                        print(f"Error: {e}")
            else:
                stream.read(int(SAMPLE_RATE * 0.1))
                time.sleep(0.01)

        except KeyboardInterrupt:
            break
    stream.stop()
    stream.close()

if __name__ == "__main__":
    main()