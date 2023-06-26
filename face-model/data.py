import math
import os
import pandas as pd
import platform
import torchvision
from torch.utils.data import Dataset

# torchvision's read_image hasn't fully supported M1 yet
# fallback to opencv's imread, then construct pytorch tensor
if platform.processor() == 'arm':
  import cv2
else:
  from torchvision.io import read_image


class FacialExpressionDataset(Dataset):

  def __init__(self,
               labels_file,
               img_dir,
               num_classes,
               transform=None,
               target_transform=None):
    self.img_labels = pd.read_csv(labels_file)
    self.img_dir = img_dir
    self.num_classes = num_classes
    self.granularity = 1 / (num_classes - 1)
    self.transform = transform
    self.target_transform = target_transform
    if platform.processor() == 'arm':
      self.read_image = self.read_image_arm
    else:
      self.read_image = self.read_image_x86

  def __len__(self):
    return len(self.img_labels)

  def __getitem__(self, idx):
    # index 0 is Timecode, for locating image file
    img_path = os.path.join(self.img_dir, self.img_labels.iloc[idx, 0] + '.jpg')
    image = self.read_image(img_path)
    # index mapping:
    # 2, 9: left/right eye blink
    # 19: jaw open
    # 25, 26: left/right mouth smile
    # 48: cheek puff
    labels = self.img_labels.iloc[idx, [2, 9, 19, 25, 26, 48]].tolist()
    labels = [math.floor(l / self.granularity) for l in labels]
    if self.transform:
      image = self.transform(image)
    if self.target_transform:
      labels = self.target_transform(labels)
    return image, labels

  def read_image_arm(self, img_path):
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = torchvision.transforms.functional.to_tensor(img)
    return img

  def read_image_x86(self, img_path):
    img = read_image(img_path)
    img = img / 255  # convert to Float
    return img
