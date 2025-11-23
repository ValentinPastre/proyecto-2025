from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from pydantic import BaseModel
from deep_translator import GoogleTranslator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaptionService:
    def __init__(self):
        self.processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        self.model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        )
        self.translator = GoogleTranslator(source='en', target='es')

    def generate_caption(self, img: Image.Image) -> str:
        inputs = self.processor(images=img, return_tensors="pt")
        output = self.model.generate(**inputs, max_new_tokens=50)
        caption_en = self.processor.decode(output[0], skip_special_tokens=True)
        caption_es = self.translator.translate(caption_en)
        return caption_es
    

caption_service = CaptionService()


class CaptionResponse(BaseModel):
    caption: str


@app.post("/caption", response_model=CaptionResponse)
async def caption_image(file: UploadFile = File(...)):
    try:
        img = Image.open(file.file).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="File not valid as image.")
    
    try:
        caption_es = caption_service.generate_caption(img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error while generating caption: {str(e)}")
    
    return CaptionResponse(caption=caption_es)
