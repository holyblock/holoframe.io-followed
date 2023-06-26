import json
import math

RENDER_INTERVAL = 0.01  # 100 Hz
ANIMATION_DURATION = 8  # seconds
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
data[lookX].append(gen_seq(2.5, 3, 0, 0.45))
data[lookX].append(gen_seq(3, 4, 0.45, -0.45))
data[lookX].append(gen_seq(4, 4.5, -0.45, 0))

# lookY
lookY = 'lookY'
data[lookY] = []
data[lookY].append(gen_seq(3.5, 3.75, 0, -0.05))
data[lookY].append(gen_seq(3.75, 4, -0.05, 0.05))
data[lookY].append(gen_seq(4, 4.5, 0.05, -0.05))
data[lookY].append(gen_seq(4.5, 5, -0.05, 0.05))
data[lookY].append(gen_seq(5, 5.25, 0.05, 0))

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
data[rightBlink].append(gen_seq(5.5, 5.7, 0, 1))
data[rightBlink].append(gen_seq(5.7, 6.8, 1, 1))
data[rightBlink].append(gen_seq(6.8, 7, 1, 0))

# mouth open
mouthOpen = 'mouthOpen'
data[mouthOpen] = []
data[mouthOpen].append(gen_seq(1, 1.5, 0, 0))
data[mouthOpen].append(gen_seq(1.5, 2.2, 0, 1))
data[mouthOpen].append(gen_seq(2.2, 2.8, 1, 1))
data[mouthOpen].append(gen_seq(2.8, 3.3, 1, 0))
data[mouthOpen].append(gen_seq(3.3, 4, 0, 0))
data[mouthOpen].append(gen_seq(5, 5.5, 0, 1))
data[mouthOpen].append(gen_seq(5.5, 6.8, 1, 1))

# smile
smile = 'smile'
data[smile] = []
data[smile].append(gen_seq(0, 0.2, 0, 0.5))
data[smile].append(gen_seq(0.2, 1.2, 0.5, 0.5))
data[smile].append(gen_seq(1.2, 2, 0.5, 1))
data[smile].append(gen_seq(2, 2.5, 1, 1))
data[smile].append(gen_seq(2.5, 3, 1, 0))
data[smile].append(gen_seq(5, 5.5, 0, 1))
data[smile].append(gen_seq(5.5, 6.8, 1, 0.5))
data[smile].append(gen_seq(6.8, 8, 0.5, 0.5))

# expressions
expressions = 'expressions'
data[expressions] = {}

# peace
peace = 'peace'
data[expressions][peace] = []
data[expressions][peace].append(gen_seq(1.6, 2.1, 0, 1))
data[expressions][peace].append(gen_seq(2.1, 2.7, 1, 1))

# fire
# fieryEyes = 'fieryEyes'
# data[expressions][fieryEyes] = []
# data[expressions][fieryEyes].append(gen_seq(2.8, 3.1, 0, 1))
# data[expressions][fieryEyes].append(gen_seq(3.1, 3.7, 1, 1))

json_data['parameters'] = data

# ---- write into json ----
with open(JSON_FILE, 'w') as f:
  json.dump(json_data, f)
