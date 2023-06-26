from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
from PIL import Image

import argparse
import cv2
import glob
import os
import pathlib
import shutil

parser = argparse.ArgumentParser(description='video')
parser.add_argument('--input_path',
                    type=str,
                    default='/Users/hongzi/Desktop/videos/1.m4v')
parser.add_argument('--overlay_text',
                    type=str,
                    default='/Users/hongzi/Desktop/videos/text-placeholder.png')
parser.add_argument('--output_folder',
                    type=str,
                    default='/Users/hongzi/Desktop/videos/')
parser.add_argument('--output_video_name', type=str, default='1')
parser.add_argument('--tmp_path',
                    type=str,
                    default='/Users/hongzi/Desktop/tmp_video_frames/')
conf = parser.parse_args()


def main():
  pathlib.Path(conf.tmp_path).mkdir(parents=True, exist_ok=True)

  video = cv2.VideoCapture(conf.input_path)
  success, image = video.read()
  count = 0
  while success:
    img_path = os.path.join(conf.tmp_path, '{}.png'.format(str(count).zfill(3)))
    cv2.imwrite(img_path, image)
    success, image = video.read()
    count += 1

  # generate mp4
  script = 'ffmpeg -i ' + conf.tmp_path + '/%03d.png -r 60 -vcodec libx264 -crf 25 -pix_fmt yuv420p -vf "setpts=0.4*PTS" ' + os.path.join(
      conf.output_folder, '{}.mp4'.format(conf.output_video_name))
  os.system(script)

  # remove tmp folder
  shutil.rmtree(conf.tmp_path)

  # overlay text
  output_video_path = os.path.join(conf.output_folder,
                                   '{}.mp4'.format(conf.output_video_name))
  videoClip = VideoFileClip(output_video_path)
  overlay_text = ImageClip(conf.overlay_text).set_start(0).set_duration(
      videoClip.duration)

  textVideo = CompositeVideoClip([videoClip, overlay_text])
  text_video_path = os.path.join(
      conf.output_folder, '{}.mp4'.format(conf.output_video_name + '-text'))
  textVideo.write_videofile(os.path.join(conf.output_folder, text_video_path))

  # generate gif
  pathlib.Path(conf.tmp_path).mkdir(parents=True, exist_ok=True)
  video = cv2.VideoCapture(text_video_path)
  success, image = video.read()
  count = 0
  frame = 0
  while success:
    if count % 10 == 0:
      image = cv2.resize(image, (512, 512))
      img_path = os.path.join(conf.tmp_path,
                              '{}.png'.format(str(frame).zfill(3)))
      cv2.imwrite(img_path, image)
      frame += 1
    success, image = video.read()
    count += 1

  output_gif_path = os.path.join(conf.output_folder,
                                 '{}.gif'.format(conf.output_video_name))

  imgs = (Image.open(f)
          for f in sorted(glob.glob(os.path.join(conf.tmp_path, '*'))))
  img = next(imgs)
  img.save(fp=output_gif_path,
           format='GIF',
           append_images=imgs,
           save_all=True,
           loop=0)
  shutil.rmtree(conf.tmp_path)


if __name__ == '__main__':
  main()
