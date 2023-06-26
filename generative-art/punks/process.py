import imageio
import json
import os

# Loading input
im = imageio.imread('./img/punks.png')
out_path = './json/'
os.makedirs(out_path, exist_ok=True)


def check_eye(im, i, j, w, h, eye):
  x = i * 24 + w
  y = j * 24 + h
  if (im[x, y, 0] != im[x, y + 1, 0] or \
     im[x, y, 1] != im[x, y + 1, 1] or \
     im[x, y, 2] != im[x, y + 1, 2]) and \
     (im[x, y, 0] != im[x, y - 1, 0] or \
     im[x, y, 1] != im[x, y - 1, 1] or \
     im[x, y, 2] != im[x, y - 1, 2]):
    eye[0] = w
    eye[1] = h


# Process and output
for i in range(100):
  for j in range(100):
    n = i * 100 + j  # punk id
    data = {'pixel': [], 'left_eye': [None, None], 'right_eye': [None, None]}

    # check female left eye
    check_eye(im, i, j, 13, 9, data['left_eye'])
    # check female right eye
    check_eye(im, i, j, 13, 14, data['right_eye'])
    # check male left eye
    check_eye(im, i, j, 12, 9, data['left_eye'])
    # check male right eye
    check_eye(im, i, j, 12, 14, data['right_eye'])

    # pixelated output
    for w in range(24):
      for h in range(24):
        x = i * 24 + w  # x value from whole image
        y = j * 24 + h  # y value from whole image
        r = float(im[x, y, 0]) / 255
        g = float(im[x, y, 1]) / 255
        b = float(im[x, y, 2]) / 255
        t = float(im[x, y, 3]) / 255  # transparency
        if t > 0:  # sparse output
          data['pixel'].append((w, h, r, g, b, t))

    with open(os.path.join(out_path, '{}.json'.format(n)), 'w') as f:
      # dump data to json file
      json.dump(data, f)

    print('{} / 10000'.format(n + 1), end='\r')
