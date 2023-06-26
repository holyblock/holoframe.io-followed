from psd_tools import PSDImage
import argparse
import pathlib
import os

parser = argparse.ArgumentParser(description='convert psd to png')
parser.add_argument('--psd_folder', type=str, default='./psd')
parser.add_argument('--img_folder', type=str, default='./image')
parser.add_argument('--ext', type=str, default='png')
conf = parser.parse_args()


def save_psd_layers(psd, dir):
  l = len(psd)
  for i in range(l):
    psd[i].visible = False
  for i in range(l):
    psd[i - 1].visible = False
    psd[i].visible = True
    filename = psd[i].name.replace(' ', '_')
    psd.composite(force=True).save(os.path.join(dir, filename + '.' + conf.ext))


for subdir, dirs, files in os.walk(conf.psd_folder):
  if subdir == conf.psd_folder:
    newdir = conf.img_folder
  else:
    psd_folder = conf.psd_folder
    if not psd_folder.endswith('/'):
      psd_folder += '/'
    path = subdir.removeprefix(psd_folder)
    newdir = os.path.join(conf.img_folder, path)
  newdir = newdir.replace(' ', '_')
  pathlib.Path(newdir).mkdir(parents=True, exist_ok=True)
  for file in files:
    if file.endswith('.psd'):
      psd = PSDImage.open(os.path.join(subdir, file))
      save_psd_layers(psd, newdir)
      print('converted {}'.format(file))
