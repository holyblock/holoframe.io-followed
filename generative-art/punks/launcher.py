import os

BLENDER_PATH = '/Applications/Blender.app/Contents/MacOS/Blender'
SCRIPT_PATH = './gen.py'
PROGRESS_PATH = './progress'
START_IDX = 0
NUM_PUNKS = 10000

with open(PROGRESS_PATH, 'w') as f:
  f.write(str(START_IDX) + '\n')

for i in range(NUM_PUNKS):
  command = '{} --background --python {}'.format(BLENDER_PATH, SCRIPT_PATH)
  os.system(command)
  print('{} / {}'.format(i + 1, NUM_PUNKS))
