from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from deep_translator import GoogleTranslator
import torch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.post("/caption")
async def caption_image(file: UploadFile = File(...)):
    img = Image.open(file.file).convert("RGB")
    inputs = processor(img, return_tensors="pt")

    output = model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)

    translator = GoogleTranslator(source='en', target='es')
    spanish_caption = translator.translate(caption)

    return {"caption": spanish_caption}
