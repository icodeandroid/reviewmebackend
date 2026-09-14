"""
Optional Python AI microservice for the CS619 project.

The NestJS backend works without this service (AI_PROVIDER=local uses a
built-in TypeScript sentiment engine). Run this service and set
AI_PROVIDER=http in the backend .env to use the real models named in the SRS:
Whisper for speech-to-text and a HuggingFace transformer for sentiment.

    pip install -r requirements.txt
    uvicorn main:app --port 8000

Note: ffmpeg must be installed and on PATH for Whisper to decode audio.
"""

import os
import tempfile
import time
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel

app = FastAPI(title="Review AI Service", version="1.0.0")

# Models are loaded lazily so the service starts instantly and only pays the
# loading cost for the feature that is actually used.
_sentiment_pipeline = None
_whisper_model = None

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
SENTIMENT_MODEL = os.getenv(
    "SENTIMENT_MODEL", "cardiffnlp/twitter-roberta-base-sentiment-latest"
)


def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        from transformers import pipeline

        _sentiment_pipeline = pipeline(
            "sentiment-analysis", model=SENTIMENT_MODEL, top_k=None
        )
    return _sentiment_pipeline


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper

        _whisper_model = whisper.load_model(WHISPER_MODEL_SIZE)
    return _whisper_model


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    label: str
    score: float
    confidence: float
    keywords: list[str]
    engine: str


@app.get("/health")
def health():
    return {"status": "ok", "sentiment_model": SENTIMENT_MODEL,
            "whisper_model": WHISPER_MODEL_SIZE}


@app.post("/sentiment", response_model=SentimentResponse)
def analyse_sentiment(request: SentimentRequest):
    """Returns a signed score in -1..+1 so it matches the NestJS contract."""
    classifier = get_sentiment_pipeline()
    raw = classifier(request.text[:512])[0]

    scores = {item["label"].upper(): item["score"] for item in raw}

    positive = scores.get("POSITIVE", scores.get("LABEL_2", 0.0))
    negative = scores.get("NEGATIVE", scores.get("LABEL_0", 0.0))
    neutral = scores.get("NEUTRAL", scores.get("LABEL_1", 0.0))

    signed_score = round(positive - negative, 4)

    if signed_score > 0.15:
        label = "POSITIVE"
    elif signed_score < -0.15:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"

    confidence = round(max(positive, negative, neutral), 4)

    return SentimentResponse(
        label=label,
        score=signed_score,
        confidence=confidence,
        keywords=_extract_keywords(request.text),
        engine=f"huggingface:{SENTIMENT_MODEL}",
    )


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: Optional[str] = Form(None)):
    """Speech-to-text for audio and video review uploads."""
    started = time.time()
    model = get_whisper_model()

    suffix = os.path.splitext(file.filename or "audio.mp3")[1] or ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        temp_path = tmp.name

    try:
        result = model.transcribe(temp_path, language=language, fp16=False)
        segments = result.get("segments") or []
        duration = segments[-1]["end"] if segments else None

        return {
            "text": result.get("text", "").strip(),
            "language": result.get("language", language or "en"),
            "duration": duration,
            "engine": f"whisper-{WHISPER_MODEL_SIZE}",
            "processing_ms": int((time.time() - started) * 1000),
        }
    finally:
        os.unlink(temp_path)


_STOP_WORDS = {
    "the", "and", "was", "were", "this", "that", "with", "for", "have", "has",
    "had", "but", "not", "you", "they", "them", "their", "our", "from", "are",
    "very", "just", "about", "would", "could", "there", "here", "what", "when",
}


def _extract_keywords(text: str, limit: int = 8) -> list[str]:
    counts: dict[str, int] = {}
    for token in "".join(c.lower() if c.isalnum() else " " for c in text).split():
        if len(token) < 4 or token in _STOP_WORDS:
            continue
        counts[token] = counts.get(token, 0) + 1

    return [word for word, _ in sorted(counts.items(), key=lambda kv: -kv[1])[:limit]]
