import math
import os
import pandas as pd
import shutil
from project_finish_time import ProjectFinishTime

INPUT_DATA_FOLDER = './data'
INPUT_LABEL = 'take_2.csv'
OUTPUT_LABEL = 'labels.csv'
SPLITTED_DATA_FOLDER = '../data'
IMAGE_POSTFIX = '.jpg'
TRAIN_EVAL_RATIO = 0.8


def copy_images(labels, input_folder, output_folder):
  elasped_estimator = ProjectFinishTime(total_steps=len(labels['Timecode']),
                                        same_line=True)
  for (i, t) in enumerate(labels['Timecode']):
    img_name = t + IMAGE_POSTFIX
    shutil.copyfile(os.path.join(input_folder, img_name),
                    os.path.join(output_folder, img_name))
    elasped_estimator.update_progress(i + 1)
  print('')


def main():
  train_folder = os.path.join(SPLITTED_DATA_FOLDER, 'train')
  eval_folder = os.path.join(SPLITTED_DATA_FOLDER, 'eval')
  os.makedirs(train_folder, exist_ok=True)
  os.makedirs(eval_folder, exist_ok=True)

  # read labels
  label_file_path = os.path.join(INPUT_DATA_FOLDER, INPUT_LABEL)
  labels = pd.read_csv(label_file_path)

  # split train/eval labels
  num_rows = len(labels)
  train_rows = math.ceil(num_rows * TRAIN_EVAL_RATIO)

  # shuffle dataset
  labels = labels.sample(frac=1)

  # save labels
  train_labels = labels[0:train_rows]
  eval_labels = labels[train_rows:num_rows]

  train_labels.to_csv(os.path.join(train_folder, OUTPUT_LABEL), index=False)
  eval_labels.to_csv(os.path.join(eval_folder, OUTPUT_LABEL), index=False)

  # copy over images
  copy_images(train_labels, INPUT_DATA_FOLDER, train_folder)
  copy_images(eval_labels, INPUT_DATA_FOLDER, eval_folder)


if __name__ == '__main__':
  main()
