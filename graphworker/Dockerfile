FROM python:3.11-slim

WORKDIR /app

COPY zscaler.crt /usr/local/share/ca-certificates/zscaler.crt

RUN apt-get update && apt-get install -y ca-certificates

RUN update-ca-certificates

COPY ./graphworker/requirements.txt ./requirements.txt

ENV PIP_CERT=/etc/ssl/certs/ca-certificates.crt

RUN pip install --no-cache-dir -r requirements.txt

COPY ./graphworker /app 

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7373"]
