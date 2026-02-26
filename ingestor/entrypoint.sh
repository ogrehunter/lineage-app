#!/bin/sh
set -e

echo "Starting ingestion..."

python ./ingestor/main.py

echo "Finished."

