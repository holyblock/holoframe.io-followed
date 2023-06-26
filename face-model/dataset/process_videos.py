import cv2
import glob
import os
import platform
from project_finish_time import ProjectFinishTime

if platform.processor() != 'arm':
  import mediapipe as mp

RAW_FOLDER = './raw'
COOKED_FOLDER = './cooked'
COOKED_VIDEO_POSTFIX = '.mp4'
PROCESSED_LIST = os.path.join(COOKED_FOLDER, 'processed_list')
RESIZE_IMAGE_SIZE = 512
NUM_BUFFERING_FRAMES = 400
NUM_FRAMES_TO_RECORD = 5000
FRAME_SUBSAMPLE_RATIO = 30
FRAME_REPEAT = 3
OUTPUT_FRAME_RATE = 6
BACKEND_OPENCV = 'opencv'
BACKEND_MEDIAPIPE = 'mediapipe'

if platform.processor() != 'arm':
  BACKEND = BACKEND_MEDIAPIPE
else:
  BACKEND = BACKEND_OPENCV


def read_processed_list():
  processed_list = []
  if os.path.exists(PROCESSED_LIST):
    with open(PROCESSED_LIST, 'r') as f:
      for line in f:
        processed_list.append(line[:-1])
  return processed_list


def append_processed_list(s):
  os.makedirs(COOKED_FOLDER, exist_ok=True)
  with open(PROCESSED_LIST, 'a+') as f:
    f.write(s + '\n')


def crop_image(img, x, y, s):
  adjustment = max(0, s - x, s - y, x + s - img.shape[1], y + s - img.shape[0])
  adjusted_s = s - adjustment
  return img[y - adjusted_s:y + adjusted_s, x - adjusted_s:x + adjusted_s]


class VideoProcesser(object):

  def __init__(self):
    self.image_buff = []
    self.video_idx = len(
        glob.glob(os.path.join(COOKED_FOLDER, '*' + COOKED_VIDEO_POSTFIX)))
    if BACKEND == BACKEND_OPENCV:
      self.face_cascade = cv2.CascadeClassifier(
          cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
      self.get_face_bounding_box = self.get_opencv_bounding_box
    else:
      self.face_detection = mp.solutions.face_detection.FaceDetection(
          model_selection=1, min_detection_confidence=0.5)
      self.get_face_bounding_box = self.get_mediapipe_bounding_box

  def get_opencv_bounding_box(self, image):
    # gray out the image
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # find the face
    faces = self.face_cascade.detectMultiScale(gray_image,
                                               scaleFactor=1.2,
                                               minNeighbors=12)
    if len(faces) > 0:
      return faces[0]
    else:
      return [None]

  def get_mediapipe_bounding_box(self, image):
    results = self.face_detection.process(cv2.cvtColor(image,
                                                       cv2.COLOR_BGR2RGB))
    if results.detections:
      relative_location = results.detections[
          0].location_data.relative_bounding_box
      x = int(relative_location.xmin * image.shape[1])
      y = int(relative_location.ymin * image.shape[0])
      w = int(relative_location.width * image.shape[1])
      h = int(relative_location.height * image.shape[0])
      return x, y, w, h
    else:
      return [None]

  def process_video(self, path):
    video = cv2.VideoCapture(path)
    num_frames = min(NUM_FRAMES_TO_RECORD, video.get(cv2.CAP_PROP_FRAME_COUNT))
    elasped_time_estimator = ProjectFinishTime(total_steps=num_frames,
                                               same_line=True)
    frame_count = 0
    subsample_count = 0
    success, image = video.read()
    while success:
      face = self.get_face_bounding_box(image)
      if len(face) == 4 and subsample_count == 0:
        x, y, w, h = face
        # crop around the face
        x_center = x + int(w / 2)
        y_center = y + int(h / 2)
        s = int(max(w, h) * 1.2)
        cropped_image = crop_image(image, x_center, y_center, s)
        # skip if cropped image is too small
        if cropped_image.shape[0] > 0 and cropped_image.shape[1] > 0:
          # scale the face image to proper size
          resized_image = cv2.resize(cropped_image,
                                     (RESIZE_IMAGE_SIZE, RESIZE_IMAGE_SIZE))
          # genereate video if image buffer is full
          for _ in range(FRAME_REPEAT):
            self.image_buff.append(resized_image)
          if len(self.image_buff) >= NUM_BUFFERING_FRAMES:
            video_path = os.path.join(
                COOKED_FOLDER,
                str(self.video_idx) + COOKED_VIDEO_POSTFIX)
            video_fourcc = cv2.VideoWriter_fourcc(*'MP4V')
            video_writer = cv2.VideoWriter(
                video_path, video_fourcc, OUTPUT_FRAME_RATE,
                (RESIZE_IMAGE_SIZE, RESIZE_IMAGE_SIZE))
            for buffered_image in self.image_buff:
              video_writer.write(buffered_image)
            video_writer.release()

            # reset image buffer
            self.video_idx += 1
            self.image_buff = []

      # increment frame count and update progress
      frame_count += 1
      subsample_count = (subsample_count + 1) % FRAME_SUBSAMPLE_RATIO
      elasped_time_estimator.update_progress(frame_count)
      if frame_count >= NUM_FRAMES_TO_RECORD:
        break

      # read next frame
      success, image = video.read()


def main():
  processed_list = set(read_processed_list())
  video_processor = VideoProcesser()
  for raw_path in os.listdir(RAW_FOLDER):
    if raw_path in processed_list:
      print('File {path} already processed, skip.'.format(path=raw_path))
    else:
      print('Processing {path}'.format(path=raw_path))
      append_processed_list(raw_path)
      video_processor.process_video(os.path.join(RAW_FOLDER, raw_path))


if __name__ == '__main__':
  main()