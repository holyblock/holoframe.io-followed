from PIL import Image
import argparse

parser = argparse.ArgumentParser(description='convert psd to png')
parser.add_argument('--images',
                    type=str,
                    default=['./img1.png', './img2.png'],
                    nargs='+')
parser.add_argument('--output_path', type=str, default='./output.png')
conf = parser.parse_args()

# read all images
imgs = []
for img_path in conf.images:
  img = Image.open(img_path).convert('RGBA')
  imgs.append(img)

# merge by putting one on top of each other
prev_img = imgs[0]
for i in range(1, len(imgs)):
  prev_img = Image.alpha_composite(prev_img, imgs[i])

prev_img.save(conf.output_path)
