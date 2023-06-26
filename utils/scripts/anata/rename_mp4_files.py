import argparse
import json
import os
import pathlib

parser = argparse.ArgumentParser(description='process live2d files')
parser.add_argument('--src_folder', type=str, default='./live2d-mp4')
parser.add_argument('--dst_folder', type=str, default='./live2d-export')
parser.add_argument('--name_map', type=str, default='./name_map.json')
conf = parser.parse_args()

pathlib.Path(conf.dst_folder).mkdir(parents=True, exist_ok=True)

with open(conf.name_map, 'r') as f:
  name_map = json.load(f)

for (i, f) in name_map.items():
  f = f[:-4]
  os.rename(os.path.join(conf.src_folder, 'anata-{}.mp4'.format(i)),
            os.path.join(conf.dst_folder, f + '.mp4'))
  os.rename(os.path.join(conf.src_folder, 'anata-{}.png'.format(i)),
            os.path.join(conf.dst_folder, f + '.png'))
  # os.rename(os.path.join(conf.src_folder, '{}.zip'.format(i)),
  #           os.path.join(conf.dst_folder, f + '.zip'))
