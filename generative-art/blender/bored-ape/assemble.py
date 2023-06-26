from inspect import trace
import bpy
import json
import os
from argparse import ArgumentDefaultsHelpFormatter, ArgumentParser
from pathlib import Path

import sys
import traceback


def main():
  sys.argv = sys.argv[sys.argv.index('--'):]

  # TODO add help to all arguments.
  parser = ArgumentParser('get asset or trait data from blueprint file')
  parser.add_argument('--ID', type=int, required=True)
  parser.add_argument('--path_base', type=str, required=True)
  parser.add_argument('--path_clothes', type=str)
  parser.add_argument('--path_earring', type=str)
  parser.add_argument('--path_or_shape_eyes', type=str)
  parser.add_argument('--path_or_shape_mouth', type=str)
  parser.add_argument('--path_hat', type=str)
  parser.add_argument('--fur', type=str)
  parser.add_argument('--output_dir', type=str, required=True)
  parser.add_argument('--overwrite', action='store_true')
  args = parser.parse_args()

  # output folders
  # the folder to store all gltf output, 1 for each avatar.
  output_dir = Path(args.output_dir)
  gltf_path = output_dir / f'all_gltf_output/{args.ID}.gltf'
  gltf_path.parent.mkdir(parents=True, exist_ok=True)
  qa_path_prefix = output_dir / f'qa/{args.ID}'
  qa_path_prefix.parent.mkdir(parents=True, exist_ok=True)

  # divide importable assets and shape key
  lst_assets = []
  lst_shapekeys = []

  for arg in [args.path_clothes, args.path_earring, args.path_or_shape_eyes, args.path_or_shape_mouth, args.path_hat]:
    if arg is None or arg == 'nan':
      continue

    if any(arg.endswith(suf) for suf in ['.gltf', '.glb']):
      lst_assets.append(arg)
    else:
      lst_shapekeys.append(arg)

  # remove all existing objects
  bpy.ops.object.select_all(action='SELECT')
  bpy.ops.object.delete(use_global=False)

  # step 1: load the clothes and accessory assets, remove all armatures
  for path_asset in lst_assets:
    bpy.ops.import_scene.gltf(filepath=path_asset)

  objects = bpy.data.objects
  lst_mesh = []
  for ob in objects:
    #print(ob.name, ob.type)
    if ob.type == 'ARMATURE':
      bpy.data.objects.remove(ob)
    elif ob.type == 'MESH':
      lst_mesh.append(ob)

  # step 2: attach clothes to body armature

  # load base body
  bpy.ops.import_scene.gltf(filepath=args.path_base)
  # attach each clothing/accessory mesh to body armature
  for mesh in lst_mesh:
    bpy.context.view_layer.objects.active = mesh
    bpy.context.object.modifiers["Armature"].object = bpy.data.objects["joints_grp"]

  # step 3: adjust shape key
  body_mesh = bpy.data.objects['Body_Base']
  for shape_key in lst_shapekeys:
    body_mesh.data.shape_keys.key_blocks[shape_key].value = 1

  # step 4: take an upper body portrait, before posing
  # add camera

  def create_camera(camera_name, locations, rotations):
    camera_data = bpy.data.cameras.new(name=camera_name)
    camera_object = bpy.data.objects.new(camera_name, camera_data)

    camera_object.location = locations
    camera_object.rotation_euler = rotations
    bpy.context.scene.collection.objects.link(camera_object)

  create_camera('upper_body', [-0.4, -1.7, 2], [1.27, 0, -0.08])

  # add lights
  def create_light(light_name, locations):
    light_data = bpy.data.lights.new(name=light_name, type='POINT')
    light_data.energy = 50
    light_object = bpy.data.objects.new(light_name, light_data)
    bpy.context.collection.objects.link(light_object)
    light_object.location = locations

  create_light('light_top', [0, 0, 2])
  create_light('light_front', [0, -0.5, 1])
  create_light('light_left', [0.5, 0.5, 1])
  create_light('light_right', [-0.5, 0.5, 1])

  # take snapshot
  for ob in bpy.context.scene.objects:
    if ob.type == 'CAMERA':
      bpy.context.scene.camera = ob
      img_path = str(qa_path_prefix) + ob.name + '.png'
      bpy.context.scene.render.filepath = img_path
      bpy.ops.render.render(write_still=True)

  # delete camera
  for ob in bpy.context.scene.objects:
    if ob.type == 'CAMERA':
      bpy.data.objects.remove(ob)

  # step 5: load pose from asset library

  pose_path = '/home/shiyun/Projects/core/generative-art/blender/bored-ape/data/ape_pose.blend'
  # bpy.data.libraries.load(pose_path, assets_only=True)
  with bpy.data.libraries.load(pose_path, assets_only=True) as (data_from, data_to):
      # Note this will print out the names of the objects,
      # Not the actual objects
      # print(data_from.actions)
    data_to.actions = data_from.actions
    # for attr in dir(data_to):
    # 	setattr(data_to, attr, getattr(data_from, attr))

  # print(data_to.objects)
  bpy.context.view_layer.objects.active = bpy.data.objects['joints_grp']
  # print('context object:', bpy.context.object)

  # print('objects', bpy.data.objects.keys())
  # print('actions', bpy.data.actions.keys())
  # bpy.ops.object.posemode_toggle()

  bpy.data.objects['joints_grp'].animation_data_create()
  bpy.data.objects['joints_grp'].animation_data.action = bpy.data.actions[0]

  # step 6: add cameras, take snapshots of the posed figure, save snapshots

  create_camera('cam_front', [0, -5.5, 1], [1.570796, 0, 0])
  create_camera('cam_right', [5.5, 0, 1], [1.570796, 0, 1.570796])
  create_camera('cam_top', [0, 0, 5], [3.14159, 3.14159, -3.14159])
  create_camera('cam_left', [-5.5, 0, 1], [1.570796, 0, -1.570796])

  # render images from different cameras, save images
  bpy.ops.object.select_all(action='SELECT')
  for ob in bpy.context.scene.objects:
    if ob.type == 'CAMERA':
      bpy.context.scene.camera = ob
      img_path = str(qa_path_prefix) + ob.name + '.png'
      bpy.context.scene.render.filepath = img_path
      bpy.ops.render.render(write_still=True)

  # step 7: delete cameras and lights, export gltf file
  for ob in bpy.context.scene.objects:
    if ob.type in ['CAMERA', 'LIGHT']:
      bpy.data.objects.remove(ob)

  bpy.ops.export_scene.gltf(filepath=str(gltf_path))
  print('done')

  # step 8: kill blender
  bpy.ops.wm.quit_blender()


if __name__ == '__main__':
  try:
    main()
  except Exception:
    traceback.print_exc()
    exit(1)
