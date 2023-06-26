import numpy as np
import math
import matplotlib.pyplot as plt
from PIL import Image, ImageOps

gr = (1 + math.sqrt(5)) / 2 * 1.2  # revised golden ratio
lw = 9  # line width
r = math.pi / 30  # rotation
s = 3.7  # size
c = 8  # circle size
logo_name = 'logo.png'
inverse_logo_name = 'ilogo.png'
transparent = True  # transparent logo background

oh = []  # outer hexagon
it = []  # inner triangle

# get hexagon coordinates
oh.append([s, math.sqrt(3) * s])
oh.append([2 * s, 0])
oh.append([s, -math.sqrt(3) * s])
oh.append([-s, -math.sqrt(3) * s])
oh.append([-2 * s, 0])
oh.append([-s, math.sqrt(3) * s])

# get triangle coordinates
it.append([gr / (1 + gr) * s, math.sqrt(3) * gr / (1 + gr) * s])
it.append([gr / (1 + gr) * s, -math.sqrt(3) * gr / (1 + gr) * s])
it.append([-2 * gr / (1 + gr) * s, 0])


# apply rotation
def rotate(l):
  for i in range(len(l)):
    x = l[i][0] * math.cos(r) - l[i][1] * math.sin(r)
    y = l[i][0] * math.sin(r) + l[i][1] * math.cos(r)
    l[i][0] = x
    l[i][1] = y


rotate(oh)
rotate(it)


# draw logo
def draw_outer_lines(ax, lw, color):
  ax.plot([oh[0][0], oh[1][0]], [oh[0][1], oh[1][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([oh[1][0], oh[2][0]], [oh[1][1], oh[2][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([oh[2][0], oh[3][0]], [oh[2][1], oh[3][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([oh[3][0], oh[4][0]], [oh[3][1], oh[4][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([oh[4][0], oh[5][0]], [oh[4][1], oh[5][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([oh[5][0], oh[0][0]], [oh[5][1], oh[0][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')


def draw_inner_lines(ax, lw, color):
  ax.plot([it[0][0], it[1][0]], [it[0][1], it[1][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[1][0], it[2][0]], [it[1][1], it[2][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[2][0], it[0][0]], [it[2][1], it[0][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[0][0], oh[0][0]], [it[0][1], oh[0][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[0][0], oh[1][0]], [it[0][1], oh[1][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[0][0], oh[5][0]], [it[0][1], oh[5][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[1][0], oh[1][0]], [it[1][1], oh[1][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[1][0], oh[2][0]], [it[1][1], oh[2][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[1][0], oh[3][0]], [it[1][1], oh[3][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[2][0], oh[3][0]], [it[2][1], oh[3][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[2][0], oh[4][0]], [it[2][1], oh[4][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')
  ax.plot([it[2][0], oh[5][0]], [it[2][1], oh[5][1]],
          lw=lw,
          color=color,
          solid_capstyle='round')


fig, ax = plt.subplots()
circle = plt.Circle((0, 0), c, color='white')
ax.add_patch(circle)
draw_outer_lines(ax, lw * 2, 'white')
draw_outer_lines(ax, lw, 'black')
draw_inner_lines(ax, lw, 'black')

# save logo
ax.set_aspect(1)
plt.axis('off')
plt.savefig(logo_name, bbox_inches='tight', dpi=300, transparent=transparent)

# 1:1 ratio
im = Image.open(logo_name)
w, h = im.size  # Get dimensions
ns = min(w, h)
left = (w - ns) / 2
top = (h - ns) / 2
right = (w + ns) / 2
bottom = (h + ns) / 2

# crop the center of the image
im = im.crop((left, top, right, bottom))
im.save(logo_name, quality=100)

# save logo inverse color
im = Image.open(logo_name).convert('RGB')
im_invert = ImageOps.invert(im)
im_invert.save(inverse_logo_name, quality=100)