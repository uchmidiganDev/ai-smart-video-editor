"""Face detection & tracking — real, local, always-on (OpenCV Haar cascade,
ships with opencv-python-headless, no model download required).

For a full production system this would be swapped for a DNN/YOLO face
detector, but Haar cascades are a genuine, functional, dependency-free CV
method suitable for sampling a handful of frames per second.
"""

from pathlib import Path

import cv2

_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
_face_cascade = cv2.CascadeClassifier(_CASCADE_PATH)


def detect_faces_over_time(video_path: Path, duration_sec: float, samples: int = 12) -> list[dict]:
    """Sample up to `samples` evenly-spaced frames and run face detection on
    each. Returns a list of {t, faces: [{x, y, w, h}] (normalized 0-1)}.
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return []

    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1)

    if frame_count <= 0 or duration_sec <= 0:
        cap.release()
        return []

    results: list[dict] = []
    for i in range(samples):
        t = (i + 0.5) * (duration_sec / samples)
        frame_idx = min(frame_count - 1, int(t * fps))
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ok, frame = cap.read()
        if not ok:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = _face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
        results.append(
            {
                "t": t,
                "faces": [
                    {"x": x / width, "y": y / height, "w": w / width, "h": h / height} for (x, y, w, h) in faces
                ],
            }
        )

    cap.release()
    return results
