# 1️⃣ Install kokoro
# !pip install -q kokoro>=0.9.4 soundfile
# 2️⃣ Install espeak, used for English OOD fallback and some non-English languages
# !apt-get -qq -y install espeak-ng > /dev/null 2>&1
import os
#os.system("python3 -m pip install kokoro>=0.9.4 soundfile") # "pip install kokoro>=0.9.4 soundfile"
#os.system("sudo pacman -S espeak-ng") # Si no usas pacman usar "apt-get install -y espeak-ng"

# 3️⃣ Initalize a pipeline
from kokoro import KPipeline
from IPython.display import display, Audio
import soundfile as sf
import torch

output_dir = os.path.join("models", "TTS", "Outputs")

# 🇺🇸 'a' => American English, 🇬🇧 'b' => British English
# 🇪🇸 'e' => Spanish es
# 🇫🇷 'f' => French fr-fr
# 🇮🇳 'h' => Hindi hi
# 🇮🇹 'i' => Italian it
# 🇯🇵 'j' => Japanese: pip install misaki[ja]
# 🇧🇷 'p' => Brazilian Portuguese pt-br
# 🇨🇳 'z' => Mandarin Chinese: pip install misaki[zh]
pipeline = KPipeline(lang_code='b') # <= make sure lang_code matches voice, reference above.

# This text is for demonstration purposes only, unseen during training
# Textos de ejemplo
text = 'The tendrils of my hair illuminate beneath the amber glow. Bathing. It must be this one. The last remaining streetlight to have withstood the test of time. The last yet to be replaced by the sickening blue-green of the future. I bathe. Calm; breathing air of the present but living in the past. The light flickers. I flicker back.'
#text = 'Ok guys, lets see in the spider mode how to program a number Singh.'
#text = 'Albion online es un MMORPG no lineal en el que escribes tu propia historia sin limitarte a seguir un camino prefijado'

# 4️⃣ Generate, display, and save audio files in a loop.
generator = pipeline(
    text, voice='bm_fable', # <= change voice here "Hindi = hm_omega", "British = bm_fable", "Spanish = em_santa"
    speed=1, 
    split_pattern=r'\n+'
)
# Alternatively, load voice tensor directly:
# voice_tensor = torch.load('path/to/voice.pt', weights_only=True)
# generator = pipeline(
#     text, voice=voice_tensor,
#     speed=1, split_pattern=r'\n+'
# )

for i, (gs, ps, audio) in enumerate(generator):
    output_path = os.path.join(output_dir, f"{i}.wav")
    sf.write(output_path, audio, 24000)
    print(f"✅ Archivo guardado: {output_path}")