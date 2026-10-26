# Image de l'API FastAPI
FROM python:3.12-slim

WORKDIR /app

# Installe les dépendances d'abord (mis en cache si requirements.txt ne change pas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie le code de l'API
COPY . .

EXPOSE 8000

# --host 0.0.0.0 : rend l'API accessible depuis l'extérieur du conteneur
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
