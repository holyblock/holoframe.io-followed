import json
import math

RENDER_INTERVAL = 0.01  # 100 Hz
ANIMATION_DURATION = 6  # seconds
JSON_FILE = '../../plugins/studio/animationWrapper/animationSequence.json'
START = 'start'
END = 'end'
VALUE = 'value'


# ---- motion trajectory ----
def smooth_motion(start, end, duration, speedup=1):
  values = []
  for i in range(int(duration / RENDER_INTERVAL)):
    # reshaped sigmoid
    values.append((end - start) /
                  (1 + math.exp(-8 * speedup *
                                (i * RENDER_INTERVAL / duration - 0.5))) +
                  start)
  return values


def gen_seq(start_time, end_time, start_value, end_value):
  d = {}
  d[START] = start_time
  d[END] = end_time
  d[VALUE] = smooth_motion(start_value, end_value, end_time - start_time)
  return d


# ---- animation sequence ----
json_data = {}
json_data['renderInterval'] = RENDER_INTERVAL
json_data['animationDuration'] = ANIMATION_DURATION

data = {}
# lookX
lookX = 'lookX'
data[lookX] = []
data[lookX].append(gen_seq(2, 2.5, 0, 0.45))
data[lookX].append(gen_seq(2.5, 3.5, 0.45, -0.45))
data[lookX].append(gen_seq(3.5, 4, -0.45, 0))

# lookY
lookY = 'lookY'
data[lookY] = []
data[lookY].append(gen_seq(2.25, 2.75, 0, -0.05))
data[lookY].append(gen_seq(2.75, 3.25, -0.05, 0.05))
data[lookY].append(gen_seq(3.25, 3.5, 0.05, -0.05))
data[lookY].append(gen_seq(3.5, 3.75, -0.05, 0.05))
data[lookY].append(gen_seq(3.75, 4, 0.05, 0))

# left eye look in / out
leftLookIn = 'leftLookIn'
leftLookOut = 'leftLookOut'
data[leftLookIn] = []
data[leftLookOut] = []
data[leftLookIn].append(gen_seq(1, 1.25, 0, 0.8))
data[leftLookOut].append(gen_seq(1, 1.25, 0, -0.8))
data[leftLookIn].append(gen_seq(1.25, 1.75, 0.8, -0.8))
data[leftLookOut].append(gen_seq(1.25, 1.75, -0.8, 0.8))
data[leftLookIn].append(gen_seq(1.75, 2, -0.8, 0))
data[leftLookOut].append(gen_seq(1.75, 2, 0.8, 0))

# right eye look in / out
rightLookIn = 'rightLookIn'
rightLookOut = 'rightLookOut'
data[rightLookIn] = []
data[rightLookOut] = []
data[rightLookIn].append(gen_seq(1, 1.25, 0, -0.8))
data[rightLookOut].append(gen_seq(1, 1.25, 0, 0.8))
data[rightLookIn].append(gen_seq(1.25, 1.75, -0.8, 0.8))
data[rightLookOut].append(gen_seq(1.25, 1.75, 0.8, -0.8))
data[rightLookIn].append(gen_seq(1.75, 2, 0.8, 0))
data[rightLookOut].append(gen_seq(1.75, 2, -0.8, 0))

# left brow
leftBrowInnerUp = 'leftBrowInnerUp'
data[leftBrowInnerUp] = []
data[leftBrowInnerUp].append(gen_seq(5.2, 5.45, 0, 1))
data[leftBrowInnerUp].append(gen_seq(5.45, 5.6, 1, 0))
data[leftBrowInnerUp].append(gen_seq(5.6, 5.75, 0, 1))
data[leftBrowInnerUp].append(gen_seq(5.75, 5.9, 1, 0))

# right brow
rightBrowInnerUp = 'rightBrowInnerUp'
data[rightBrowInnerUp] = []
data[rightBrowInnerUp].append(gen_seq(5.2, 5.45, 0, 1))
data[rightBrowInnerUp].append(gen_seq(5.45, 5.6, 1, 0))
data[rightBrowInnerUp].append(gen_seq(5.6, 5.75, 0, 1))
data[rightBrowInnerUp].append(gen_seq(5.75, 5.9, 1, 0))

# left eye look up / down
leftLookUp = 'leftLookUp'
leftLookDown = 'leftLookDown'
data[leftLookUp] = []
data[leftLookDown] = []
data[leftLookUp].append(gen_seq(1, 1.35, 0, 0.5))
data[leftLookDown].append(gen_seq(1, 1.35, 0, -0.5))
data[leftLookUp].append(gen_seq(1.35, 1.85, 0.5, 0.5))
data[leftLookDown].append(gen_seq(1.35, 1.85, -0.5, -0.5))
data[leftLookUp].append(gen_seq(1.85, 3, 0.5, 0))
data[leftLookDown].append(gen_seq(1.85, 1.85, -0.5, 0))

# right eye look up / down
rightLookUp = 'rightLookUp'
rightLookDown = 'rightLookDown'
data[rightLookUp] = []
data[rightLookDown] = []
data[rightLookUp].append(gen_seq(1, 1.35, 0, 0.5))
data[rightLookDown].append(gen_seq(1, 1.35, 0, -0.5))
data[rightLookUp].append(gen_seq(1.35, 1.85, 0.5, 0.5))
data[rightLookDown].append(gen_seq(1.35, 1.85, -0.5, -0.5))
data[rightLookUp].append(gen_seq(1.85, 3, 0.5, 0))
data[rightLookDown].append(gen_seq(1.85, 1.85, -0.5, 0))

# left blink
leftBlink = 'leftBlink'
data[leftBlink] = []
data[leftBlink].append(gen_seq(4.1, 4.3, 0, 1))
data[leftBlink].append(gen_seq(4.3, 4.5, 1, 0))
data[leftBlink].append(gen_seq(4.8, 4.95, 0, 1))
data[leftBlink].append(gen_seq(4.95, 5.1, 1, 0))

# right blink
rightBlink = 'rightBlink'
data[rightBlink] = []
data[rightBlink].append(gen_seq(4.1, 4.3, 0, 1))
data[rightBlink].append(gen_seq(4.3, 4.5, 1, 0))
data[rightBlink].append(gen_seq(4.8, 4.95, 0, 1))
data[rightBlink].append(gen_seq(4.95, 5.1, 1, 0))

# mouth open
mouthOpen = 'mouthOpen'
data[mouthOpen] = []
data[mouthOpen].append(gen_seq(3.3, 3.5, 0, 1))
data[mouthOpen].append(gen_seq(3.5, 4, 1, 1))
data[mouthOpen].append(gen_seq(4, 4.2, 1, 0))
data[mouthOpen].append(gen_seq(4.8, 5.1, 0, 1))
data[mouthOpen].append(gen_seq(5.1, 5.65, 1, 1))
data[mouthOpen].append(gen_seq(5.65, 5.8, 1, 0))

json_data['parameters'] = data

# ---- write into json ----
with open(JSON_FILE, 'w') as f:
  json.dump(json_data, f)
