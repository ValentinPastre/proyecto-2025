import sys
import json
import os
import io
from contextlib import redirect_stdout, redirect_stderr
from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "../models/yolo/data/runs/detect/train11/weights/best.pt")

def main():
    image_path = sys.argv[1]
    model = YOLO(MODEL_PATH)

    buffer = io.StringIO()
    with redirect_stdout(buffer), redirect_stderr(buffer):
        results = model.predict(image_path, verbose=False)

    objects = []
    for r in results:
        for box in r.boxes:
            objects.append({
                "class": int(box.cls[0]),
                "conf": float(box.conf[0]),
                "bbox": box.xyxy[0].tolist()
            })

    print(json.dumps({"objects": objects}))

if __name__ == "__main__":
    main()

import sys
sys.stdout.flush()
sys.exit(0)
