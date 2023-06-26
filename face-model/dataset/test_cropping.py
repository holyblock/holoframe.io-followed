import argparse
import cv2
import os
import glob

parser = argparse.ArgumentParser(description='test cropping')
parser.add_argument('--x', type=int, default=330)
parser.add_argument('--y', type=int, default=200)
parser.add_argument('--s', type=int, default=710)
conf = parser.parse_args()

TAKE_FOLDER = './takes/'
OUTPUT_DATA_FOLDER = './data/'
VIDEO_POSTFIX = '*.mov'
OUTPUT_IMAGE_SIZE = 368

os.makedirs(OUTPUT_DATA_FOLDER, exist_ok=True)
for video_path in glob.glob(os.path.join(TAKE_FOLDER, VIDEO_POSTFIX)):
  video = cv2.VideoCapture(video_path)
  success, image = video.read()
  if success:
    image = image[conf.x:conf.x + conf.s, conf.y:conf.y + conf.s]
    # resize image
    image = cv2.resize(image, (OUTPUT_IMAGE_SIZE, OUTPUT_IMAGE_SIZE))
    frame_path = os.path.join(OUTPUT_DATA_FOLDER, 'test_only.jpg')
    cv2.imwrite(frame_path, image)
    break
