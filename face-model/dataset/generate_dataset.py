import csv
import cv2
import glob
import os
import numpy as np
from project_finish_time import ProjectFinishTime

TAKE_FOLDER = './takes/'
OUTPUT_DATA_FOLDER = './data/'
VIDEO_POSTFIX = '*.mov'
CROP_X = 330
CROP_Y = 200
CROP_S = 710
OUTPUT_IMAGE_SIZE = 368
NUM_INIT_FRAMES = 2048
FRAME_DIFF_PERCENTILE = 90
CONFIDENT_FRAMES = 25


def convert_time(timestamp):
  # format: HH:MM:SS:mm.uuu
  timestamp_split = timestamp.split(':')
  hour = int(timestamp_split[0]) * 60 * 60
  minute = int(timestamp_split[1]) * 60
  second = int(timestamp_split[2])
  subsecond = float(timestamp_split[3]) / 60
  coverted_time = hour + minute + second + subsecond
  return coverted_time


def advance_row_until_hit(row, csv_iter, start_time, frame_time, fps):
  take_timestamp = row[0]
  curr_time = convert_time(take_timestamp) - start_time

  # declare hit if any of the follows occurs
  # 1. frame time and csv row time close enough (within 1 / fps)
  # 2. csv time is ahead of frame time
  # 3. rows run out
  while abs(curr_time - frame_time) > 1 / fps and frame_time > curr_time:
    row = next(csv_iter, None)
    if row is None:
      break
    take_timestamp = row[0]
    curr_time = convert_time(take_timestamp) - start_time

  return row


def sample_frame_diff(video_path, num_frames, cut_off_ratio):
  video = cv2.VideoCapture(video_path)
  prev_image = None
  frame_count = 0
  diffs = []
  success = True
  while success:
    success, image = video.read()
    if prev_image is not None:
      diff = ((prev_image - image)**2).sum()
      diffs.append(diff)
    prev_image = image
    frame_count += 1
    if frame_count >= num_frames:
      break
  video.release()
  return np.percentile(diffs, cut_off_ratio)


def generate_dataset(video_path, csv_path):
  file_reader = open(csv_path, 'r')
  file_writer = open(
      os.path.join(OUTPUT_DATA_FOLDER, os.path.basename(csv_path)), 'w')
  csv_reader = csv.reader(file_reader, delimiter=',')
  csv_writer = csv.writer(file_writer, delimiter=',')
  csv_iter = iter(csv_reader)

  # read first few frames to establish frame diff
  cut_off_diff = sample_frame_diff(video_path, NUM_INIT_FRAMES,
                                   FRAME_DIFF_PERCENTILE)

  # write header
  data_header = next(csv_iter)
  csv_writer.writerow(data_header)

  # use first row to get start time
  row = next(csv_iter)
  start_time = convert_time(row[0])

  # read video
  video = cv2.VideoCapture(video_path)
  num_frames = video.get(cv2.CAP_PROP_FRAME_COUNT)
  fps = video.get(cv2.CAP_PROP_FPS)
  elasped_time_estimator = ProjectFinishTime(total_steps=num_frames,
                                             same_line=True)

  frame_time = 0
  frame_count = 0
  diff_frame_count = 0
  success = True
  prev_image = None
  diff = 0
  while success:
    success, image = video.read()
    row = advance_row_until_hit(row, csv_iter, start_time, frame_time, fps)
    if row is None:
      break
    take_timestamp = row[0]
    curr_time = convert_time(take_timestamp) - start_time

    if abs(curr_time - frame_time) <= 1 / fps and len(row) > 10:

      if prev_image is not None:
        diff = ((image - prev_image)**2).sum()
        if diff > cut_off_diff:
          diff_frame_count = 0
      prev_image = image
      diff_frame_count += 1

      if diff_frame_count == CONFIDENT_FRAMES:
        # data exists
        csv_writer.writerow(row)
        # crop image at the center
        image = image[CROP_X:CROP_X + CROP_S, CROP_Y:CROP_Y + CROP_S]
        # resize image
        image = cv2.resize(image, (OUTPUT_IMAGE_SIZE, OUTPUT_IMAGE_SIZE))
        frame_path = os.path.join(OUTPUT_DATA_FOLDER, take_timestamp + '.jpg')
        cv2.imwrite(frame_path, image)

      row = next(csv_iter, None)
      if row is None:
        break

    frame_count += 1
    frame_time += 1 / fps
    elasped_time_estimator.update_progress(frame_count)

  file_reader.close()
  file_writer.close()


def main():
  os.makedirs(OUTPUT_DATA_FOLDER, exist_ok=True)
  for video_path in glob.glob(os.path.join(TAKE_FOLDER, VIDEO_POSTFIX)):
    csv_path = video_path[:-4] + '.csv'
    generate_dataset(video_path, csv_path)


if __name__ == '__main__':
  main()
