import os
import pathlib
import shutil

INPUT_FOLDER = '/Users/hongzi/Downloads/live2d-input'
OUTPUT_FOLDER = '/Users/hongzi/Downloads/live2d-output'

pathlib.Path(OUTPUT_FOLDER).mkdir(parents=True, exist_ok=True)
all_paths = os.listdir(INPUT_FOLDER)
for (i, filename) in enumerate(all_paths):
  filepath = os.path.join(INPUT_FOLDER, filename)
  print('{}/{} {}'.format(i + 1, len(all_paths), filepath), end='\r')
  if os.path.isdir(filepath):
    shutil.make_archive(os.path.join(OUTPUT_FOLDER, filename), 'zip',
                        INPUT_FOLDER, filename)
print('')
