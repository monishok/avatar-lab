from flask import current_app
from flask1.utils.file_name import generate_mp4_filename
import os
import subprocess
import numpy as np
import cv2
import torch
from tqdm import tqdm
from flask1.lsmodel.audio import load_wav, melspectrogram
from flask1.lsmodel import face_detection
from flask1.lsmodel.wmodel import load_model_once 

device = 'cuda' if torch.cuda.is_available() else 'cpu'


def get_smoothened_boxes(boxes, T=5):
    for i in range(len(boxes)):
        window = boxes[i:i + T] if i + T < len(boxes) else boxes[-T:]
        boxes[i] = np.mean(window, axis=0)
    return boxes


def face_detect(images, face_det_batch_size, pads, nosmooth):
    detector = face_detection.FaceAlignment(face_detection.LandmarksType._2D, flip_input=False, device=device)
    results = []

    while True:
        predictions = []
        try:
            for i in range(0, len(images), face_det_batch_size):
                predictions.extend(detector.get_detections_for_batch(np.array(images[i:i + face_det_batch_size])))
        except RuntimeError:
            face_det_batch_size = max(1, face_det_batch_size // 2)
            continue
        break

    pady1, pady2, padx1, padx2 = pads
    for rect, image in zip(predictions, images):
        if rect is None:
            raise ValueError("Face not detected.")
        y1, y2 = max(0, rect[1] - pady1), min(image.shape[0], rect[3] + pady2)
        x1, x2 = max(0, rect[0] - padx1), min(image.shape[1], rect[2] + padx2)
        results.append([x1, y1, x2, y2])

    boxes = np.array(results)
    if not nosmooth:
        boxes = get_smoothened_boxes(boxes)

    return [[image[y1:y2, x1:x2], (y1, y2, x1, x2)] for image, (x1, y1, x2, y2) in zip(images, boxes)]


def prepare_batch(img_batch, mel_batch, frame_batch, coords_batch, img_size):
    img_batch = np.asarray(img_batch)
    mel_batch = np.asarray(mel_batch)
    img_masked = img_batch.copy()
    img_masked[:, img_size // 2:] = 0
    img_batch = np.concatenate((img_masked, img_batch), axis=3) / 255.
    mel_batch = np.reshape(mel_batch, (len(mel_batch), mel_batch.shape[1], mel_batch.shape[2], 1))
    return img_batch, mel_batch, frame_batch, coords_batch


def datagen(frames, mels, static, batch_size, img_size, pads, nosmooth):
    img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []

    face_det_results = face_detect([frames[0]] if static else frames, batch_size, pads, nosmooth)

    for i, mel in enumerate(mels):
        idx = 0 if static else i % len(frames)
        frame = frames[idx].copy()
        face, coords = face_det_results[idx]
        face = cv2.resize(face, (img_size, img_size))

        img_batch.append(face)
        mel_batch.append(mel)
        frame_batch.append(frame)
        coords_batch.append(coords)

        if len(img_batch) >= batch_size:
            yield prepare_batch(img_batch, mel_batch, frame_batch, coords_batch, img_size)
            img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []

    if img_batch:
        yield prepare_batch(img_batch, mel_batch, frame_batch, coords_batch, img_size)


def generate_lipsynced_video(
    face_path,
    audio_path,
    temp_video_path="./flask1/files/temp/result.avi",
    static=False,
    fps=25.,
    pads=[0, 10, 0, 0],
    face_det_batch_size=16,
    wav2lip_batch_size=128,
    resize_factor=1,
    crop=[0, -1, 0, -1],
    rotate=False,
    nosmooth=False
):
    img_size = 96

    video_file_name = generate_mp4_filename()
    final_path = current_app.config['FINAL_OUTPUT_FOLDER']
    output_path = os.path.join(final_path, video_file_name)

    if not os.path.isfile(face_path):
        raise FileNotFoundError(f"Face video not found: {face_path}")
    if not os.path.isfile(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    if face_path.split('.')[-1] in ['jpg', 'png', 'jpeg']:
        static = True
        full_frames = [cv2.imread(face_path)]
    else:
        video_stream = cv2.VideoCapture(face_path)
        fps = video_stream.get(cv2.CAP_PROP_FPS)
        full_frames = []
        while True:
            ret, frame = video_stream.read()
            if not ret: break
            if resize_factor > 1:
                frame = cv2.resize(frame, (frame.shape[1] // resize_factor, frame.shape[0] // resize_factor))
            if rotate:
                frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)
            y1, y2, x1, x2 = crop
            y2, x2 = y2 if y2 != -1 else frame.shape[0], x2 if x2 != -1 else frame.shape[1]
            full_frames.append(frame[y1:y2, x1:x2])
        video_stream.release()
    print(f"Number of frames available for inference: {len(full_frames)}")

    wav = load_wav(audio_path, 16000)
    mel = melspectrogram(wav)

    mel_step_size = 16
    mel_chunks = []
    mel_idx_multiplier = 80. / fps
    i = 0
    while True:
        start_idx = int(i * mel_idx_multiplier)
        if start_idx + mel_step_size > mel.shape[1]:
            mel_chunks.append(mel[:, -mel_step_size:])
            break
        mel_chunks.append(mel[:, start_idx:start_idx + mel_step_size])
        i += 1

    print(f"Length of mel chunks: {len(mel_chunks)}")

    full_frames = full_frames[:len(mel_chunks)]

    model = load_model_once()

    frame_h, frame_w = full_frames[0].shape[:-1]
    out = cv2.VideoWriter(temp_video_path, cv2.VideoWriter_fourcc(*'DIVX'), fps, (frame_w, frame_h))

    for img_batch, mel_batch, frames, coords in tqdm(
        datagen(full_frames.copy(), mel_chunks, static, face_det_batch_size, img_size, pads, nosmooth),
        total=int(np.ceil(len(mel_chunks) / float(wav2lip_batch_size)))
    ):
        img_batch = torch.FloatTensor(np.transpose(img_batch, (0, 3, 1, 2))).to(device)
        mel_batch = torch.FloatTensor(np.transpose(mel_batch, (0, 3, 1, 2))).to(device)

        with torch.no_grad():
            pred = model(mel_batch, img_batch).cpu().numpy().transpose(0, 2, 3, 1) * 255.

        for p, f, c in zip(pred, frames, coords):
            y1, y2, x1, x2 = c
            f[y1:y2, x1:x2] = cv2.resize(p.astype(np.uint8), (x2 - x1, y2 - y1))
            out.write(f)

    out.release()

    command = f'ffmpeg -y -i "{audio_path}" -i "{temp_video_path}" -strict -2 -q:v 1 "{output_path}"'
    subprocess.call(command, shell=True)
    print(f"Final output video saved to: {output_path}")

    return output_path, video_file_name
