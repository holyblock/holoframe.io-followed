import math
import os
import pathlib
from moviepy.editor import VideoFileClip, clips_array

INPUT_FOLDER = '/Users/hongzi/Downloads/video-output'
OUTPUT_FOLDER = '/Users/hongzi/Downloads/video-export'
OUTPUT_FILENAME = 'video.mp4'
INPUT_RESIZE_WIDTH = 1280
INPUT_RESIZE_HEIGHT = 720
INPUT_CROP_X1 = 280
INPUT_CROP_X2 = 1000
INPUT_CROP_Y1 = 0
INPUT_CROP_Y2 = 720
NUM_VIDEOS_PER_GROUP_ROW = 3
NUM_VIDEOS_PER_GROUP = 27
NUM_GROUPS_PER_ROW = 3
START_SEC = 1
END_SEC = 7
POSTFIX = '.mp4'

# read all video files and sort file name numerically
pathlib.Path(OUTPUT_FOLDER).mkdir(parents=True, exist_ok=True)
all_paths = os.listdir(INPUT_FOLDER)
all_paths = [f[:-len(POSTFIX)] for f in all_paths]
all_paths.sort(key=int)
all_paths = [f + POSTFIX for f in all_paths]

# read all video clips
clips = []
for (i, path) in enumerate(all_paths):
  full_path = os.path.join(INPUT_FOLDER, path)
  print('{}/{} {}'.format(i + 1, len(all_paths), full_path), end='\r')
  clip = VideoFileClip(full_path)
  # trim
  clip = clip.subclip(START_SEC, END_SEC)
  # resize
  clip = clip.resize(width=INPUT_RESIZE_WIDTH, height=INPUT_RESIZE_HEIGHT)
  # crop
  clip = clip.crop(x1=INPUT_CROP_X1,
                   x2=INPUT_CROP_X2,
                   y1=INPUT_CROP_Y1,
                   y2=INPUT_CROP_Y2)
  clips.append(clip)
print('')

# group all clips
print('grouping and arranging videos...')
grouped_clips = []
for i in range(math.floor(len(clips) / NUM_VIDEOS_PER_GROUP)):
  grouped_clips.append([])
  for j in range(NUM_VIDEOS_PER_GROUP):
    grouped_clips[-1].append(clips[i * NUM_VIDEOS_PER_GROUP + j])

# arrange all clips in grid
arranged_clips = []
for _ in range(math.ceil(NUM_VIDEOS_PER_GROUP / NUM_VIDEOS_PER_GROUP_ROW)):
  arranged_clips.append([])
for group in grouped_clips:
  for i in range(math.ceil(NUM_VIDEOS_PER_GROUP / NUM_VIDEOS_PER_GROUP_ROW)):
    for j in range(NUM_VIDEOS_PER_GROUP_ROW):
      arranged_clips[i].append(group[i * NUM_VIDEOS_PER_GROUP_ROW + j])

# stack into a single video clip
print('stacking videos...')
stacked_clips = clips_array(arranged_clips)

# TODO: resize before saving

# write into video file
print('saving videos...')
stacked_clips.write_videofile(os.path.join(OUTPUT_FOLDER, OUTPUT_FILENAME),
                              audio=False)
