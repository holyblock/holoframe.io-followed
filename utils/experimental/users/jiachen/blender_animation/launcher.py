import os

BLENDER_PATH = '/Applications/Blender.app/Contents/MacOS/Blender'
SCRIPT_PATH = 'generate_animation_video.py'

command = '{} --background --python {}'.format(BLENDER_PATH, SCRIPT_PATH)

os.system(command)
