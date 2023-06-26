import torch
import torch.nn as nn
from blazeface import BlazeFace

ONNX_PATH = 'blazeface.onnx'


def main():
  blaze_face_net = BlazeFace(back_model=False)  # input 128 * 128
  blaze_face_net.load_weights('blazeface.pth')

  # dummy input to specify input size
  # Note: the input domain is [-1, 1]
  dummy_input = torch.zeros(1, 3, 128, 128)

  # export to onnx
  torch.onnx.export(blaze_face_net, dummy_input, ONNX_PATH, verbose=True)


if __name__ == '__main__':
  main()
