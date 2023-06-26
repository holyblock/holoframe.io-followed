import argparse
import cv2
import json
import os
import pathlib
import patoolib
import shutil
import zipfile
from project_finish_time import ProjectFinishTime

DS_STORE = '.DS_Store'

parser = argparse.ArgumentParser(description='process live2d files')
parser.add_argument('--dst_dim', type=int, default=2048)
parser.add_argument('--src_folder', type=str, default='./input')
parser.add_argument('--dst_folder', type=str, default='./output')
parser.add_argument('--ext', type=str, default='png')
conf = parser.parse_args()


def remove_if_exists(filepath):
  if os.path.exists(filepath):
    os.remove(filepath)


def resize_image(img_file, dst_dim):
  img = cv2.imread(img_file, cv2.IMREAD_UNCHANGED)
  dim = max(img.shape[0], img.shape[1])
  if dim > dst_dim:
    ratio = dim / dst_dim
    x = int(img.shape[1] / ratio)
    y = int(img.shape[0] / ratio)
    resized = cv2.resize(img, (x, y), interpolation=cv2.INTER_AREA)
    print('({}, {}) -> ({}, {})'.format(img.shape[1], img.shape[0], x, y))
    cv2.imwrite(img_file, resized, [cv2.IMWRITE_PNG_COMPRESSION, 9])


def flatten_folder(path):
  all_files = os.listdir(path)
  for file in all_files:
    new_path = os.path.join(path, file)
    if os.path.isdir(new_path):
      if any(f.endswith('.model3.json') for f in os.listdir(new_path)):
        tmp_path = os.path.abspath(os.path.join(path, '..', file))
        os.rename(new_path, tmp_path)
        shutil.rmtree(path)
        os.rename(tmp_path, path)
        break


pathlib.Path(os.path.join(conf.src_folder, '.DS_Store')).unlink(missing_ok=True)
pathlib.Path(conf.dst_folder).mkdir(parents=True, exist_ok=True)
remove_if_exists(os.path.join(conf.src_folder, DS_STORE))
all_paths = os.listdir(conf.src_folder)
all_paths.sort()
proj_time = ProjectFinishTime(total_steps=len(all_paths))

for (i, filename) in enumerate(all_paths):
  print('{}/{} {}'.format(i + 1, len(all_paths), filename))
  filepath = os.path.join(conf.src_folder, filename)

  # unzip if it is a zipped folder
  if filename.endswith('.zip'):
    with zipfile.ZipFile(filepath, 'r') as zip_ref:
      zip_ref.extractall(conf.src_folder)
    # now use unzipped folder
    filename = filename[:-4]
    flatten_folder(os.path.join(conf.src_folder, filename))

  # unrar if it is a rar folder
  if filename.endswith('.rar'):
    patoolib.extract_archive(filepath, outdir=conf.src_folder)
    # now use unrar folder
    filename = filename[:-4]

  # check all folder
  live2d_folder = os.path.join(conf.src_folder, filename)
  all_live2d_names = os.listdir(live2d_folder)
  for path in all_live2d_names:
    live2d_img_folder = os.path.join(live2d_folder, path)
    if os.path.isdir(live2d_img_folder):
      all_images = os.listdir(live2d_img_folder)
      for image in all_images:
        if image.endswith(conf.ext):
          image_path = os.path.join(live2d_img_folder, image)
          resize_image(image_path, conf.dst_dim)
    # remove unwanted .DS_Store
    remove_if_exists(os.path.join(live2d_img_folder, DS_STORE))

  # correct model3.json if file name is erroneously capitalized
  model3_name = [s for s in all_live2d_names if s.endswith('.model3.json')]
  physics_name = [s for s in all_live2d_names if s.endswith('.physics3.json')]
  cdi3_name = [s for s in all_live2d_names if s.endswith('.cdi3.json')]
  moc3_name = [s for s in all_live2d_names if s.endswith('.moc3')]
  texture_folder_name = [
      s for s in all_live2d_names
      if s.endswith('.8192') or s.endswith('.4096') or s.endswith('.2048')
  ]
  if len(model3_name) == 1 and len(physics_name) == 1 and len(
      cdi3_name) == 1 and len(moc3_name) == 1 and len(texture_folder_name) == 1:
    model3_name = model3_name[0]
    physics_name = physics_name[0]
    cdi3_name = cdi3_name[0]
    moc3_name = moc3_name[0]
    texture_folder_name = texture_folder_name[0]

  with open(os.path.join(live2d_folder, model3_name), 'r') as f:
    data = json.load(f)
    if 'FileReferences' in data:
      file_ref = data['FileReferences']
      if 'Textures' in file_ref:
        json_name = file_ref['Textures'][0].split('/')[0]
        if json_name != texture_folder_name:
          os.rename(os.path.join(live2d_folder, texture_folder_name),
                    os.path.join(live2d_folder, json_name))
      if 'Physics' in file_ref and file_ref['Physics'] != physics_name:
        os.rename(os.path.join(live2d_folder, physics_name),
                  os.path.join(live2d_folder, file_ref['Physics']))
      if 'DisplayInfo' in file_ref and file_ref['DisplayInfo'] != cdi3_name:
        os.rename(os.path.join(live2d_folder, cdi3_name),
                  os.path.join(live2d_folder, file_ref['DisplayInfo']))
      if 'Moc' in file_ref and file_ref['Moc'] != moc3_name:
        os.rename(os.path.join(live2d_folder, moc3_name),
                  os.path.join(live2d_folder, file_ref['Moc']))

  # remove unwanted .DS_Store
  remove_if_exists(os.path.join(live2d_folder, DS_STORE))

  # zip into output folder
  shutil.make_archive(os.path.join(conf.dst_folder, filename), 'zip',
                      conf.src_folder, filename)

  # update progress
  proj_time.update_progress(i + 1)
