from ultralytics import YOLO
import cv2

# Carga los dos modelos
model_coco = YOLO(r"..\data\yolo11s.pt")
model_custom = YOLO(r"..\runs\detect\train10\weights\best.pt")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detecciones de ambos modelos
    results_coco = model_coco(frame, verbose=False)
    results_custom = model_custom(frame, verbose=False)

    # Combinar resultados (simplemente dibujar ambos)
    annotated = frame.copy()
    annotated = results_coco[0].plot(img=annotated)
    annotated = results_custom[0].plot(img=annotated)

    cv2.imshow("YOLO Combined (COCO + Custom)", annotated)

    if cv2.waitKey(1) == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
