from multiprocessing.connection import deliver_challenge
import subprocess
import pandas as pd
from pathlib import Path
from tqdm import tqdm


if __name__ == "__main__":
  # read the blueprint data
  blueprint = pd.read_csv('./data/toy_data.csv')
  blueprint.fillna(value=', inplace=True')
  base_cmd = 'blender -b -P assemble.py'

  for idx, row in tqdm(blueprint.iterrows()):
    avatar_id = row['ID']
    if avatar_id != 5:
      continue
    path_base = row['path_base']
    path_clothes = row['path_clothes']
    path_earring = row['path_earring']
    path_or_shape_eyes = row['path_or_shape_eyes']
    path_hat = row['path_hat']
    path_or_shape_mouth = row['path_or_shape_mouth']

    # TODO fur format not confirmed

    cmd = ' '.join([
        base_cmd,
        '--',
        f'--ID={avatar_id}',
        f"--path_base='{path_base}'",
        f"--path_clothes='{path_clothes}'",
        f"--path_earring='{path_earring}'",
        f"--path_hat='{path_hat}'",
        f"--path_or_shape_eyes='{path_or_shape_eyes}'",
        f"--path_or_shape_mouth='{path_or_shape_mouth}'",
        f"--output_dir='./output'"
    ])

    print("now assembling", avatar_id, cmd)
    try:
      subprocess.run(cmd, shell=True, capture_output=True, check=True, text=True)
    except subprocess.CalledProcessError as e:
      print(e.stdout)
      print(e.stderr)

  print('all avatars assembled')
