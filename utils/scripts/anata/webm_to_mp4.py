from moviepy.editor import VideoFileClip
from PIL import Image
import cv2
import imageio
import os
import pathlib
import shutil

INPUT_FOLDER = '/Users/hongzi/Downloads/video-input'
TMP_FOLDER = '/Users/hongzi/Downloads/video-tmp'
OUTPUT_FOLDER = '/Users/hongzi/Downloads/live2d-mp4'
IMG_INTERVAL = 1
SKIP_COUNT = 20
CROP_X1 = 780
CROP_X2 = 2580
CROP_Y1 = 20
CROP_Y2 = 1780
# CROP_X1 = 880
# CROP_X2 = 2520
# CROP_Y1 = 40
# CROP_Y2 = 1680
# CROP_X1 = 984
# CROP_X2 = 2424
# CROP_Y1 = 230
# CROP_Y2 = 1670
PREFIX = 'anata-'
POSTFIX = '.webm'

pathlib.Path(OUTPUT_FOLDER).mkdir(parents=True, exist_ok=True)

all_paths = os.listdir(INPUT_FOLDER)
all_paths = [f[len(PREFIX):-len(POSTFIX)] for f in all_paths]
all_paths.sort(key=int)
all_paths = [PREFIX + f + POSTFIX for f in all_paths]

for (i, filename) in enumerate(all_paths):
  pathlib.Path(TMP_FOLDER).mkdir(parents=True, exist_ok=True)
  filepath = os.path.join(INPUT_FOLDER, filename)
  print('{}/{} {}'.format(i + 1, len(all_paths), filepath), end='\r')
  if filename.endswith('.webm'):
    video = cv2.VideoCapture(filepath)
    success, image = video.read()
    count = 0
    frame = 0
    while success:
      if count >= SKIP_COUNT and count % IMG_INTERVAL == 0:
        image = image[CROP_Y1:CROP_Y2, CROP_X1:CROP_X2]
        cv2.imwrite(
            os.path.join(TMP_FOLDER, '{}.png'.format(str(frame).zfill(2))),
            image)
        frame += 1
      success, image = video.read()
      count += 1

    # generate mp4
    script = 'ffmpeg -i ' + TMP_FOLDER + '/%02d.png -r 60 -vcodec libx264 -pix_fmt yuv420p -vf "setpts=0.85*PTS" ' + os.path.join(
        OUTPUT_FOLDER, '{}.mp4'.format(filename[:-5]))
    os.system(script)

  # remmove tmp folder
  shutil.copyfile(os.path.join(TMP_FOLDER, '00.png'),
                  os.path.join(OUTPUT_FOLDER, '{}.png'.format(filename[:-5])))
  shutil.rmtree(TMP_FOLDER)

print('')
