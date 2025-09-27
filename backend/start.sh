#!/bin/bash

# Download spacy model if not present
python -m spacy download en_core_web_sm || true

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}