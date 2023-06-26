import glob
import os
import random
from moviepy.editor import VideoFileClip, concatenate_videoclips

COOKED_FOLDER = './cooked'
OUTPUT_FOLDER = './output'
MAX_OPENS = 200


def concatenate_videos(videos, output_path, shuffle=False):
  if shuffle:
    # randomize video order
    random.shuffle(videos)
  # concatentate videos
  concatenated_video = concatenate_videoclips(videos)
  # write out the concatenated video
  concatenated_video.write_videofile(output_path)


def loop_video_files(video_list,
                     output_folder,
                     output_template,
                     delete_input=False):
  videos = []
  output_idx = 0
  for video_path in video_list:
    print('Loading {path}.'.format(path=video_path))
    video = VideoFileClip(video_path)
    videos.append(video)
    if len(videos) >= MAX_OPENS:
      output_name = output_template.format(output_idx)
      output_path = os.path.join(output_folder, output_name)
      # concatenate and save video
      concatenate_videos(videos, output_path)
      for video in videos:
        video.close()
      videos.clear()
      output_idx += 1

  # residual videos
  if len(videos) > 0:
    output_name = output_template.format(output_idx)
    output_path = os.path.join(output_folder, output_name)
    # concatenate and save video
    concatenate_videos(videos, output_path)

  # delete original videos
  if delete_input:
    for video_path in video_list:
      os.remove(video_path)


def main():
  os.makedirs(OUTPUT_FOLDER, exist_ok=True)
  # get list of files
  all_input_videos = glob.glob(os.path.join(COOKED_FOLDER, '*.mp4'))
  # run concatenation until a single video is left
  input_videos = all_input_videos
  delete_input = False
  loop_count = 0
  while len(input_videos) > 1:
    output_template = 'video_' + str(loop_count) + '_{}.mp4'
    loop_video_files(input_videos, OUTPUT_FOLDER, output_template, delete_input)
    # new set of videos
    input_videos = glob.glob(os.path.join(OUTPUT_FOLDER, '*.mp4'))
    loop_count += 1
    delete_input = True


if __name__ == '__main__':
  main()
