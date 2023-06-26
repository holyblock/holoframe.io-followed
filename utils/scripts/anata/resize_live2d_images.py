import argparse
import cv2
import glob
import os

parser = argparse.ArgumentParser(description='resize image')
parser.add_argument('--src_dim', type=int, default=4096)
parser.add_argument('--dst_dim', type=int, default=2048)
parser.add_argument('--img_folder', type=str, default='./')
parser.add_argument('--ext', type=str, default='png')
conf = parser.parse_args()

img_files = glob.glob(os.path.join(conf.img_folder, '*' + conf.ext))
for img_file in img_files:
  img = cv2.imread(img_file, cv2.IMREAD_UNCHANGED)
  dim = max(img.shape[0], img.shape[1])
  if dim > conf.dst_dim:
    ratio = dim / conf.dst_dim
    x = int(img.shape[1] / ratio)
    y = int(img.shape[0] / ratio)
    resized = cv2.resize(img, (x, y), interpolation=cv2.INTER_AREA)
    print('({}, {}) -> ({}, {})'.format(img.shape[1], img.shape[0], x, y))
    cv2.imwrite(img_file, resized, [cv2.IMWRITE_PNG_COMPRESSION, 9])
