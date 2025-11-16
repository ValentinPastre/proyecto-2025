import requests
import json
from deep_translator import GoogleTranslator
import time
from TTS import generar_audio   # usamos tu TTS

# --- CONFIGURACIÓN ---
RUTA_IMAGEN = r"C:\Users\frana\Desktop\images.jpeg" #Cambiar para que funcione con el frontend
URL_API = "http://localhost:8001/caption"  # API de caption Node.js
# ----------------------

print(f"Intentando obtener caption para: {RUTA_IMAGEN}")

start_time = time.time()

try:
    with open(RUTA_IMAGEN, 'rb') as f:
        files = {
            'image': (RUTA_IMAGEN, f, 'image/jpeg')
        }

        print("Enviando imagen a la API...")
        response = requests.post(URL_API, files=files)

        if response.status_code == 200:
            data_ingles = response.json()
            caption_ingles = data_ingles['caption']

            print("\n¡ÉXITO!")
            print(f"Caption (Inglés): {caption_ingles}")

            # Traducion a espaniol
            try:
                print("\nTraduciendo al español...")
                translator = GoogleTranslator(source='en', target='es')
                caption_espanol = translator.translate(caption_ingles)
                print(f"Caption (Español): {caption_espanol}")
            except Exception as e:
                print("\n ERROR DE TRADUCCIÓN")
                print(e)
                caption_espanol = None
            

            # audio en espaniol
            try:
                print("\nGenerando audio con TTS (español)...")
                ruta_audio = generar_audio(
                    texto=caption_espanol,
                    nombre_archivo="caption_audio_es.wav",
                    voz="em_santa",      # voz española
                    velocidad=1.0
                )
                print(f" Audio generado en: {ruta_audio}")
            except Exception as e:
                print("\n ERROR EN TTS")
                print(e)
                ruta_audio = None
            

            # Tiempo
            end_time = time.time()
            elapsed_time = end_time - start_time
            print("\n" + "-"*30)
            print(f"  Tiempo total de proceso: {elapsed_time:.2f} segundos")
            print("-" * 30)

            # Guardamos los resultados en un .json
            nombre_archivo_salida = "caption_resultado.json"
            resultado_final = {
                "caption_ingles": caption_ingles,
                "caption_espanol": caption_espanol,
                "audio_generado": ruta_audio,
                "tiempo_segundos": round(elapsed_time, 2)
            }

            try:
                with open(nombre_archivo_salida, "w", encoding="utf-8") as json_file:
                    json.dump(resultado_final, json_file, indent=4, ensure_ascii=False)

                print(f"\n Resultados guardados en: {nombre_archivo_salida}")
            except Exception as e:
                print("\n ERROR AL GUARDAR JSON")
                print(e)

        else:
            end_time = time.time()
            elapsed_time = end_time - start_time
            print(f"\n(Tiempo de intento fallido: {elapsed_time:.2f} segundos)")
            print(f"\n ERROR DE API (Código: {response.status_code})")
            print(response.text)

# Manejo de errores generales
except FileNotFoundError:
    print("\n ERROR")
    print(f"No se pudo encontrar la imagen en la ruta: {RUTA_IMAGEN}")

except requests.exceptions.ConnectionError:
    print("\n ERROR DE CONEXIÓN")
    print(f"No se pudo conectar a {URL_API}. ¿Está corriendo la API?")

except Exception as e:
    print("\n UN ERROR INESPERADO OCURRIÓ")
    print(e)
