import argparse
import json
import os
import pathlib

parser = argparse.ArgumentParser(description='process live2d files')
parser.add_argument('--src_folder', type=str, default='./output')
parser.add_argument('--dst_folder', type=str, default='./rename')
parser.add_argument('--ext', type=str, default='.zip')
conf = parser.parse_args()

pathlib.Path(os.path.join(conf.src_folder, '.DS_Store')).unlink(missing_ok=True)
pathlib.Path(conf.dst_folder).mkdir(parents=True, exist_ok=True)

all_files = os.listdir(conf.src_folder)
all_files.sort()
file_names_dict = {i: f for (i, f) in enumerate(all_files)}
with open(os.path.join(conf.dst_folder, 'name_map.json'), 'w') as f:
  json.dump(file_names_dict, f)

for (i, f) in file_names_dict.items():
  os.rename(os.path.join(conf.src_folder, f),
            os.path.join(conf.dst_folder,
                         str(i) + conf.ext))
