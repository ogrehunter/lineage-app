FROM python:3.11-slim

WORKDIR /app

COPY zscaler.crt /usr/local/share/ca-certificates/zscaler.crt

RUN apt-get update && apt-get install -y ca-certificates

RUN update-ca-certificates

# Install system dependencies
RUN apt-get update \
    && apt-get install -y curl gnupg apt-transport-https unixodbc unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*


# Add Microsoft GPG key properly (no apt-key)
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
    | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg

# Add Microsoft repository (Debian 12)
RUN echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
    > /etc/apt/sources.list.d/mssql-release.list

# Install SQL Server ODBC driver
RUN apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*


COPY ./parser/requirements.txt ./requirements.txt

ENV PIP_CERT=/etc/ssl/certs/ca-certificates.crt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY ./parser/entrypoint.sh /

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["python", "main.py"]
