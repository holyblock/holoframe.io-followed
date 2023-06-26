import bpy
import json
import os

DATA_FOLDER = '/Users/hongzi/code/hg/generative-art/punks/json'
OUTPUT_FOLDER = '/Users/hongzi/code/hg/generative-art/punks/output'
PROGRESS_FILE = '/Users/hongzi/code/hg/generative-art/punks/progress'
EYE_BLINK_LEFT = 'eyeBlinkLeft'
EYE_BLINK_RIGHT = 'eyeBlinkRight'
JAW_OPEN = 'jawOpen'


def delete_objects_from_scene(object_prefix):
  keys = bpy.data.objects.keys()
  for k in keys:
    if object_prefix in k:
      obj_to_delete = bpy.data.objects[k]
      bpy.data.objects.remove(obj_to_delete)


def add_shape_key(obj, key_name, upper_z, lower_z):
  # base shape key
  sk_basis = obj.shape_key_add(name='Basis')
  sk_basis.interpolation = 'KEY_LINEAR'
  # animation shape key
  sk = obj.shape_key_add(name=key_name)
  sk.interpolation = 'KEY_LINEAR'
  for i in range(4):
    sk.data[i * 2 + 1].co.z = upper_z
  for i in range(4):
    sk.data[i * 2].co.z = lower_z


def generate_punk(data, punk_id):
  # location -> block map for easier retrieval
  block_map = {}

  # create pixel blocks as a punk
  for (i, pixel) in enumerate(data['pixel']):
    # set block position
    x = pixel[1] - 12
    z = 24 - pixel[0] - 12
    bpy.ops.mesh.primitive_cube_add(location=(x, 0, z))
    cube = bpy.data.objects['Cube']
    cube.name = 'punk-pixel-' + str(i)
    cube.dimensions = (1, 1, 1)  # overwrite default size
    # set block color
    mat = bpy.data.materials.new(name='punk-color-' + str(i))
    mat.use_nodes = True
    mat.node_tree.nodes['Principled BSDF'].inputs[0].default_value = (pixel[2],
                                                                      pixel[3],
                                                                      pixel[4],
                                                                      pixel[5])
    mat.diffuse_color = (pixel[2], pixel[3], pixel[4], pixel[5])
    cube.data.materials.append(mat)
    # cache block in the map
    block_map[(x, z)] = cube

  # create blendshape for the left eye
  if data['left_eye'][0] is not None:
    # get eye location
    x = data['left_eye'][1] - 12
    z = 24 - data['left_eye'][0] - 12
    # deform the eye block together with eyelid
    add_shape_key(block_map[(x, z + 1)], EYE_BLINK_LEFT, -1, -3)
    add_shape_key(block_map[(x + 1, z + 1)], EYE_BLINK_LEFT, -1, -3)
    add_shape_key(block_map[(x, z)], EYE_BLINK_LEFT, -1, -1)
    add_shape_key(block_map[(x + 1, z)], EYE_BLINK_LEFT, -1, -1)
    add_shape_key(block_map[(x, z + 2)], EYE_BLINK_LEFT, 1, -3)
    add_shape_key(block_map[(x + 1, z + 2)], EYE_BLINK_LEFT, 1, -3)

  # create blendshape for the right eye
  if data['right_eye'][0] is not None:
    # get eye location
    x = data['right_eye'][1] - 12
    z = 24 - data['right_eye'][0] - 12
    # deform the eye block together with eyelid
    add_shape_key(block_map[(x, z + 1)], EYE_BLINK_RIGHT, -1, -3)
    add_shape_key(block_map[(x + 1, z + 1)], EYE_BLINK_RIGHT, -1, -3)
    add_shape_key(block_map[(x, z)], EYE_BLINK_RIGHT, -1, -1)
    add_shape_key(block_map[(x + 1, z)], EYE_BLINK_RIGHT, -1, -1)
    add_shape_key(block_map[(x, z + 2)], EYE_BLINK_RIGHT, 1, -3)
    add_shape_key(block_map[(x + 1, z + 2)], EYE_BLINK_RIGHT, 1, -3)

  # create blendshape for the mouth (z = 18 in punk img)
  z = 24 - 18 - 12
  add_shape_key(block_map[(11 - 12, z)], JAW_OPEN, 1, -3)
  add_shape_key(block_map[(11 - 12, z - 1)], JAW_OPEN, -1, -1)
  add_shape_key(block_map[(12 - 12, z)], JAW_OPEN, 1, -3)
  add_shape_key(block_map[(12 - 12, z - 1)], JAW_OPEN, -1, -1)
  add_shape_key(block_map[(13 - 12, z)], JAW_OPEN, 1, -3)
  add_shape_key(block_map[(13 - 12, z - 1)], JAW_OPEN, -1, -1)

  # join all pixel blocks
  blocks = {}
  blocks['object'] = blocks['active_object'] = bpy.data.objects['punk-pixel-0']
  blocks['selected_objects'] = blocks['selected_editable_objects'] = [
      bpy.data.objects['punk-pixel-' + str(i)] for i in range(len(block_map))
  ]
  bpy.ops.object.join(blocks)

  # save as gltf
  output_path = os.path.join(OUTPUT_FOLDER, str(punk_id) + '.glb')
  bpy.context.scene.objects['punk-pixel-0'].select_set(True)
  bpy.ops.export_scene.gltf(filepath=output_path,
                            use_selection=True,
                            export_normals=False)


def read_progress():
  progress = 0
  with open(PROGRESS_FILE, 'r') as f:
    for line in f:
      progress = int(line)
  return progress


def write_progress(progress):
  with open(PROGRESS_FILE, 'w') as f:
    f.write(str(progress) + '\n')


def main():
  os.makedirs(OUTPUT_FOLDER, exist_ok=True)
  # remove the default cube from scene
  delete_objects_from_scene('Cube')
  # check current punk id to process
  progress = read_progress()
  # process punk
  punk_data = os.path.join(DATA_FOLDER, '{}.json'.format(progress))
  with open(punk_data, 'r') as f:
    data = json.load(f)
    generate_punk(data, progress)
  # update progress
  write_progress(progress + 1)


if __name__ == '__main__':
  main()
