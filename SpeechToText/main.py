import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import pipeline

app = Flask(__name__)
CORS(app)
MODEL_PATH = os.getenv("MODEL_PATH", "openai/whisper-small")
DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

print(f" Configurando Whisper...")
print(f"Ruta del modelo: {MODEL_PATH}")
print(f" Dispositivo: {DEVICE}")

try:
    pipe = pipeline(
        "automatic-speech-recognition",
        model=MODEL_PATH,
        device=DEVICE,
        torch_dtype=torch_dtype
    )
    print("Modelo Custom Argentino cargado exitosamente.")
except Exception as e:
    print(f"Error cargando modelo custom ({e}).")
    print(" Descargando e iniciando modelo base 'openai/whisper-small'...")
    pipe = pipeline(
        "automatic-speech-recognition",
        model="openai/whisper-small",
        device=DEVICE
    )
    print(" Modelo Base cargado.")



@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "service": "whisper-argentino-api",
        "device": DEVICE
    })

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
        file.save(temp_audio.name)
        temp_path = temp_audio.name

    try:
        result = pipe(
            temp_path,
            generate_kwargs={
                "language": "spanish",
                "task": "transcribe",
                "temperature": 0.0

            }
        )
        
        text = result["text"].strip()
        print(f"🗣️ Audio procesado: '{text}'")

        if len(text) > 50 and len(set(text.split())) < 4:
            print(f" Alucinación detectada y eliminada: {text}")
            text = ""

        return jsonify({
            "text": text,
            "language": "es-AR"
        })

    except Exception as e:
        print(f"Error en transcripción: {e}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)