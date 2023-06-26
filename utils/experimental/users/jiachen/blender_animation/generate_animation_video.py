import bpy
import json
import os
import random

import sys
sys.path.append('../../../../scripts/anata')
from project_finish_time import ProjectFinishTime

BASE_FOLDER = '/Users/jiachen/Desktop/bayc'
MODEL_FOLDER = os.path.join(BASE_FOLDER, 'original_models')
ANIMATION_FOLDER = os.path.join(BASE_FOLDER, 'animation_seqs')
METADATA_FOLDER = os.path.join(BASE_FOLDER, 'background_color_metadata.json')
OUTPUT_FOLDER = os.path.join(BASE_FOLDER, 'videos')
HOLOGRAM_LOGO_FILE = os.path.join(BASE_FOLDER, 'hologram_logo.png')
# PENGUIN_LOGO_FILE = os.path.join(BASE_FOLDER, 'penguin_logo.png')

with open(METADATA_FOLDER, 'r') as f:
  BACKGROUND_COLORS = json.load(f)
f.close()

COLORS = {
  "Purple":
    {
      "R": 0.127,
      "G": 0.091,
      "B": 0.127
    },
  "Yellow":
    {
      "R": 0.730,
      "G": 0.730,
      "B": 0.352
    },
  "Orange":
    {
      "R": 0.831,
      "G": 0.254,
      "B": 0.040
    },
  "Aquamarine":
    {
      "R": 0.019,
      "G": 0.753,
      "B": 0.413
    },
  "Army Green":
    {
      "R": 0.136,
      "G": 0.136,
      "B": 0.037
    },
  "Blue":
    {
      "R": 0.309,
      "G": 0.745,
      "B": 0.880
    },
  "New Punk Blue":
    {
      "R": 0.037,
      "G": 0.107,
      "B": 0.162
    },
  "Gray":
    {
      "R": 0.546,
      "G": 0.552,
      "B": 0.565
    }
}

def delete_objects_from_scene(object_prefix):
  keys = bpy.data.objects.keys()
  for k in keys:
    if object_prefix in k:
      obj_to_delete = bpy.data.objects[k]
      bpy.data.objects.remove(obj_to_delete)

def delete_objects_from_scene_except(exclude_object_names):
  keys = bpy.data.objects.keys()
  for k in keys:
    if k not in exclude_object_names:
      obj_to_delete = bpy.data.objects[k]
      bpy.data.objects.remove(obj_to_delete)

def model_animation_video(model_path, animation_path, r, g, b, num_frames, output_path):
  # load gltf
  bpy.ops.import_scene.vrm(filepath=model_path)

  # load animation
  bpy.ops.import_scene.fbx(filepath=animation_path)
  
  # link animation data
  bpy.data.objects['Armature'].select_set(True)
  bpy.data.objects['Armature.001'].select_set(True)
  bpy.ops.object.make_links_data(type='ANIMATION')

  # change background color
  background_node = bpy.data.worlds['World'].node_tree.nodes['Background']
  background_node.inputs[0].default_value = (r, g, b, 1)

  # generate video
  bpy.context.scene.frame_end = num_frames
  bpy.context.scene.render.filepath = output_path
  bpy.context.scene.render.image_settings.file_format = 'FFMPEG'
  bpy.context.scene.render.ffmpeg.format = 'MPEG4'
  bpy.context.scene.render.ffmpeg.constant_rate_factor = 'HIGH'
  bpy.ops.render.render(animation=True)

def set_up_stage():
  # reset blender
  bpy.ops.wm.read_homefile()

  # remove the default cube from scene
  delete_objects_from_scene('Cube')
  bpy.context.scene.render.resolution_x = 864
  bpy.context.scene.render.resolution_y = 864

  # set up camera
  bpy.data.objects['Camera'].location[0] = 0
  bpy.data.objects['Camera'].location[1] = -6
  bpy.data.objects['Camera'].location[2] = 0.7
  bpy.data.objects['Camera'].rotation_euler[0] = 1.61443
  bpy.data.objects['Camera'].rotation_euler[1] = 0
  bpy.data.objects['Camera'].rotation_euler[2] = 0

  # set up light
  bpy.ops.object.light_add(type='AREA', align='WORLD', location=(0, 0, 0), scale=(1, 1, 1))
  bpy.data.objects['Area'].location[0] = 0
  bpy.data.objects['Area'].location[1] = -10
  bpy.data.objects['Area'].location[2] = 0.5
  bpy.data.objects['Area'].rotation_euler[0] = 1.5708
  bpy.data.objects['Area'].rotation_euler[1] = 0
  bpy.data.objects['Area'].rotation_euler[2] = 0
  bpy.data.objects['Area'].data.energy = 850
  bpy.data.objects['Area'].data.size = 5

  # add hologram logo
  bpy.ops.import_image.to_plane(shader='SHADELESS', files=[{'name':HOLOGRAM_LOGO_FILE}])
  bpy.data.objects['hologram_logo'].scale[0] = 0.15
  bpy.data.objects['hologram_logo'].scale[1] = 0.15
  bpy.data.objects['hologram_logo'].scale[2] = 0.15
  bpy.data.objects['hologram_logo'].location[0] = 1.9
  bpy.data.objects['hologram_logo'].location[1] = 0
  bpy.data.objects['hologram_logo'].location[2] = -1

  # add penguin logo
  # bpy.ops.import_image.to_plane(shader='SHADELESS', files=[{'name':PENGUIN_LOGO_FILE}])
  # bpy.data.objects['penguin_logo'].scale[0] = 0.3
  # bpy.data.objects['penguin_logo'].scale[1] = 0.3
  # bpy.data.objects['penguin_logo'].scale[2] = 0.3
  # bpy.data.objects['penguin_logo'].location[0] = -2.1
  # bpy.data.objects['penguin_logo'].location[1] = 0
  # bpy.data.objects['penguin_logo'].location[2] = 0.8

def main():
  random.seed(42)

  # retrieve files
  animation_files = sorted([f for f in os.listdir(ANIMATION_FOLDER) if f.endswith('.fbx')])
  model_files = sorted([f for f in os.listdir(MODEL_FOLDER) if f.endswith('.vrm')])

  proj_time = ProjectFinishTime(total_steps=len(model_files))

  for (model_step, model_file) in enumerate(model_files):
    # parse model id
    model_id = int(model_file.split('.')[0])

    # extract background color
    bcolor = BACKGROUND_COLORS[str(model_id)]

    # randomly pick an animation seq
    # animation_seq = animation_files[model_step % 4]
    for aid, animation_seq in enumerate(animation_files):

      # parse number of frame
      num_frames = int(animation_seq.split('.')[0].split(' ')[-1]) * 2

      # set up stage for generating animation sequence
      set_up_stage()

      # generate animation sequence
      model_animation_video(
        os.path.join(MODEL_FOLDER, '{}.vrm'.format(model_id)),
        os.path.join(ANIMATION_FOLDER, animation_seq),
        COLORS[bcolor]["R"],
        COLORS[bcolor]["G"],
        COLORS[bcolor]["B"],
        num_frames,
        os.path.join(OUTPUT_FOLDER, '{}.mp4'.format(model_id)))
    
    # update elapsed time
    proj_time.update_progress(model_step + 1)


if __name__ == '__main__':
  main()
