import cv2
import numpy as np
import os
import pathlib
from sys import platform

IMAGE_WIDTH = 1280
IMAGE_HEIGHT = 720
REVERSE_COLOR = True
OPENCV_DISPLAY = False
if platform == 'win32':
  TMP_FILE_PATH = 'C:\\hologram\\holocam.bmp'
else:
  TMP_FILE_PATH = '/tmp/holocam.bmp'


def write_rgb_data(path, img):
  """
    CGCreateImage seems to accept only raw RGB images
    """
  assert len(img.shape) == 3 and img.shape[-1] == 4 and img.dtype == np.uint8
  with open(path, "wb") as f:
    for row in img:
      f.write(row.tobytes())

def save_image_mac(img, path):
  assert img.shape == (IMAGE_HEIGHT, IMAGE_WIDTH, 4)
  name, ext = os.path.splitext(path)
  tmp_path = name + "-tmp" + ext
  write_rgb_data(tmp_path, img)
  os.replace(tmp_path, path)


def save_image_win(img, path):
  assert img.shape == (IMAGE_HEIGHT, IMAGE_WIDTH, 4)
  write_rgb_data(TMP_FILE_PATH, img)


def main():
  pathlib.Path(os.path.dirname(TMP_FILE_PATH)).mkdir(exist_ok=True)
  vc = cv2.VideoCapture(1)

  # for windows, directly write into file; for mac, write into temp then rename
  if platform == 'win32':
    save_image = save_image_win
  else:
    save_image = save_image_mac

  while vc.isOpened():
    _, frame = vc.read()
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)
    frame = cv2.resize(frame, (IMAGE_WIDTH, IMAGE_HEIGHT))
    if REVERSE_COLOR:
      frame[:, :, 0] = 255 - frame[:, :, 0]
      frame[:, :, 1] = 255 - frame[:, :, 1]
      frame[:, :, 2] = 255 - frame[:, :, 2]
    save_image(frame, TMP_FILE_PATH)
    if OPENCV_DISPLAY:
      cv2.imshow(TMP_FILE_PATH, frame)
      key = cv2.waitKey(20)
      if key == 27:
        break


if __name__ == '__main__':
  main()
