FROM python:3.10-slim

WORKDIR /app

COPY requirements.base.txt requirements.base.txt
# Corregido Usando el nombre de archivo que SÍ existe
COPY requirements.captioning.txt requirements.captioning.txt

RUN pip install --no-cache-dir -r requirements.base.txt
# Corregido Usando el nombre de archivo que SÍ existe
RUN pip install --no-cache-dir -r requirements.captioning.txt

COPY . .

# Expone el puerto que usará el contenedor
EXPOSE 3000

# Comando para iniciar el servidor Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]