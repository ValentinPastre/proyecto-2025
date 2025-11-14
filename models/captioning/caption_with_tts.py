import requests
import json
from deep_translator import GoogleTranslator
import time
from TTS import generar_audio 

RUTA_IMAGEN = r"C:\Users\frana\Pictures\Camera Roll\WIN_20251002_13_47_49_Pro.jpg" 
URL_API = "http://localhost:8001/caption"  # API Node.js


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

            print("\n" + "="*30)
            print("       ¡ÉXITO!       ")
            print("="*30)
            print(f"Caption (Inglés): {caption_ingles}")
            
            try:
                print("\nGenerando audio con TTS (inglés)...")
                ruta_audio = generar_audio(
                    texto=caption_ingles,
                    nombre_archivo="caption_audio_en.wav",
                    voz="bm_fable",
                    velocidad=1.0
                )
                print(f"🔊 Audio generado en: {ruta_audio}")
            except Exception as e:
                print("\n--- ERROR EN TTS ---")
                print(e)
                ruta_audio = None
           

            try:
                print("Traduciendo al español...")
                translator = GoogleTranslator(source='en', target='es')
                caption_espanol = translator.translate(caption_ingles)
                print(f"Caption (Español): {caption_espanol}")
            except Exception as e:
                print("\n--- ERROR DE TRADUCCIÓN ---")
                print(e)
                caption_espanol = None
            
            end_time = time.time()
            elapsed_time = end_time - start_time

            print("\n" + "-"*30)
            print(f"⏱️  Tiempo total de proceso: {elapsed_time:.2f} segundos")
            print("-" * 30)

           
            nombre_archivo_salida = 'caption_resultado.json'
            resultado_final = {
                'caption_ingles': caption_ingles,
                'caption_espanol': caption_espanol,
                'audio_generado': ruta_audio,
                'tiempo_segundos': round(elapsed_time, 2)
            }

            try:
                with open(nombre_archivo_salida, 'w', encoding='utf-8') as json_file:
                    json.dump(resultado_final, json_file, indent=4, ensure_ascii=False)

                print(f"\n✅ Resultados guardados en: {nombre_archivo_salida}")

            except Exception as e:
                print("\n--- ERROR AL GUARDAR JSON ---")
                print(e)

        else:
            end_time = time.time()
            elapsed_time = end_time - start_time
            print(f"\n(Tiempo de intento fallido: {elapsed_time:.2f} segundos)")

            print(f"\n--- ERROR DE API (Código: {response.status_code}) ---")
            print(response.text)

except FileNotFoundError:
    print("\n--- ERROR ---")
    print(f"No se pudo encontrar la imagen en la ruta: {RUTA_IMAGEN}")

except requests.exceptions.ConnectionError:
    print("\n--- ERROR DE CONEXIÓN ---")
    print(f"No se pudo conectar a {URL_API}.")
    print("¿Estás seguro de que la API está corriendo?")

except Exception as e:
    print("\n--- UN ERROR INESPERADO OCURRIÓ ---")
    print(e)
