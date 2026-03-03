#!/bin/sh
set -e

echo "Starting ingestion..."

python ./parser/main.py

echo "Finished."

