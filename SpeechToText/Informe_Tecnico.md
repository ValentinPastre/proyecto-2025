# Desarrollo de un Modelo Acústico BiLSTM Eficiente para el Reconocimiento del Español Argentino

**Autores:** Pastre Thuer Valentin, Francisco Andreani, Gribaudo Re Francisco
**Fecha:** Noviembre 2025

---

## Resumen
Este documento detalla la arquitectura, estrategia de entrenamiento y resultados de un sistema de Reconocimiento Automático de audio, diseñado específicamente para el español argentino. El modelo, basado en una red neuronal recurrente bidireccional (BiLSTM) y optimizado con la función de pérdida CTC, logró una **Tasa de Error de Caracteres (CER) del 6.2%**. Se discuten las decisiones de diseño tomadas para equilibrar la capacidad de aprendizaje con las limitaciones de memoria y el tiempo disponible con el hardware de consumo (NVIDIA Tesla T4 y RTX 5060).

---

## 1. Introducción

Este proyecto propone un modelo acústico entrenado desde cero utilizando el dataset `ylacombe/google-argentinian-spanish`, priorizando una arquitectura eficiente que pueda ser entrenada e inferida en entornos con recursos computacionales limitados.

## 2. Arquitectura del Modelo

El núcleo del sistema es una Red Neuronal Recurrente (RNN) diseñada para procesar secuencias temporales de audio.

### 2.1. Entrada: Espectrogramas Mel
El audio crudo no se ingresa directamente a la red. Se preprocesa convirtiéndolo a **Espectrogramas Mel**, una representación visual del sonido que imita la percepción no lineal del oído humano.
* **Resolución:** 128 bandas de frecuencia (`n_mels=128`).
* **Frecuencia de Muestreo:** 16.000 Hz.

### 2.2. El Núcleo: BiLSTM Profunda
Se seleccionó una arquitectura **BiLSTM (Bidirectional Long Short-Term Memory)**.

* **Bidireccionalidad:** A diferencia de una red estándar que lee de izquierda a derecha (pasado, futuro), la BiLSTM procesa el audio en ambas direcciones simultáneamente. Esto permite que el modelo entienda el contexto basándose en lo que se dijo antes y en lo que se dirá después.
* **Dimensiones:**
    * **Capas (Layers): 3**. Se determinó que 3 capas ofrecen equilibrio entre abstracción (capacidad de entender patrones complejos) y velocidad de entrenamiento. Pruebas con 5 capas resultaron en tiempos de entrenamiento excesivos para el presupuesto disponible.
    * **Nodos Ocultos (Hidden Size): 512**. Cada capa posee 512 neuronas de memoria, permitiendo retener suficiente información sobre la estructura fonética de oraciones de hasta 20 segundos.

### 2.3. Decodificación: CTC Loss
La red utiliza la **Clasificación Temporal Coneccionista (CTC)**. Dado que el audio es mucho más largo que el texto, la CTC permite alinear ambas secuencias sin necesidad de saber en qué milisegundo exacto se pronunció cada letra. Introduce el concepto de token `<BLANK>` para manejar los silencios y las transiciones entre caracteres.

## 3. Estrategia de Entrenamiento y Optimización

El entrenamiento se diseñó teniendo en cuenta restricciones estrictas de hardware, principalmente memoria de video.

### 3.1. Gestión de Memoria y Batch Size
El tamaño del lote (**Batch Size**) es crítico. Un batch muy grande mejora la estimación del gradiente pero consume mucha VRAM.
* **Limitación:** Con audios de hasta 20 segundos y un modelo de 512 nodos, un batch de 64 saturaba la memoria de 14GB de la Tesla T4 y los 6GB de la RTX 5060.
* **Solución:** Se utilizó un **Batch Size efectivo de 32** (o 16 con acumulación de gradientes en el caso de la 5060). Esto permitió mantener la estabilidad estadística del entrenamiento sin provocar errores de "Out of Memory" (OOM).

### 3.2. Preprocesamiento Robusto
Para evitar el colapso del modelo (predicción de silencios constantes) observado en iteraciones tempranas, se implementaron las siguientes técnicas:
1.  **Limpieza de Texto:** Eliminación de todo caracter que no fuera `a-z`, `ñ` o vocales acentuadas.
2.  **Normalización de Volumen:** Se fuerza el audio a ocupar todo el rango dinámico (0.0 a 1.0) antes de generar el espectrograma. Esto evita que grabaciones con bajo volumen sean interpretadas erróneamente como silencio.

## 4. Métricas de Evaluación: ¿Qué es el CER?

Para evaluar el modelo no se confió únicamente en la función de pérdida (*Loss*), ya que esta puede ser engañosa. Se utilizó el **CER (Character Error Rate)**.

### 4.1. Definición
El CER mide la distancia de edición entre la predicción y la realidad. Se calcula como:

$$CER = \frac{S + D + I}{N}$$

Donde:
* **S (Sustituciones):** Letras cambiadas (ej: "casa" por "caza").
* **D (Eliminaciones):** Letras que faltan.
* **I (Inserciones):** Letras que el modelo agregó incorrectamente.
* **N:** Número total de caracteres en la frase original.

### 4.2. Resultados
El modelo comenzó con un CER del 100% (sin aprendizaje). Tras **80 épocas** (en el caso mas exitoso del entrenamiento), se alcanzó un **CER del 6.59%** y posteriormente **6.2%** con un re-entrenamiento de 20 epocas sobre los mismos pesos. Esto indica que el modelo transcribe correctamente más del 93% de los caracteres, un resultado muy bueno para un modelo no pre-entrenado.

## 5. Inferencia y Limitaciones

El sistema final incluye un script de inferencia en tiempo real con modalidad "Push-to-Talk" llamado InputDeMicrophono.

* **Naturaleza Acústica:** Al ser un modelo puramente acústico, no tiene mucho conocimiento semántico o gramatical. Tiende a cometer errores ortográficos fonéticamente correctos (ej: escribe "hizó" como "iso" o "hizo", dependiendo del azar acústico).
* Se integró un corrector ortográfico (`pyspellchecker`) en la inferencia en la etapa de post-procesamiento para mitigar estos errores fonéticos, a pesar de esto el resultado no fue lo mejor, aunque teniendo en cuenta los recursos disponibles no fue necesariamente un mal resultado.

## 6. Conclusión

Se logró desarrollar un modelo de reconocimiento de voz ligero para español argentino, capaz de ejecutarse en hardware de consumo. La arquitectura de 3 capas con 512 nodos demostró ser el punto óptimo (*sweet spot*) entre rendimiento y costo computacional, validando que es posible obtener resultados de buena calidad (CER < 7%) mediante una curación de datos estricta y estrategias de entrenamiento adaptadas a la memoria disponible.

---

## 7. Referencias

### Tutoriales y Guías
**OhVeda.** [https://ohveda.com/building-a-high-accuracy-speech-to-text-model-a-step-by-step-tutorial-for-beginners/](https://ohveda.com/building-a-high-accuracy-speech-to-text-model-a-step-by-step-tutorial-for-beginners/). (Fuente de inspiración principal para la metodología de entrenamiento).

### Dataset
**Hugging Face & Lacombe.** (2023). *Google Argentinian Spanish Dataset*. Recuperado de [https://huggingface.co/datasets/ylacombe/google-argentinian-spanish](https://huggingface.co/datasets/ylacombe/google-argentinian-spanish).

