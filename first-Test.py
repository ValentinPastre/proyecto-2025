
from ultralytics import YOLO

# Cargar modelo preentrenado
model = YOLO("yolov8n.pt")  # versión ligera

source = "./input/image03.jpg"

results = model(source)

print(results)

results[0].show()