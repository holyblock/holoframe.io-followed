import torch
import torch.nn.functional as F
from model import FacialExpressionNet
from param import conf


class OnnxCompatibleFacialExpressionNet(FacialExpressionNet):

  def forward(self, x):
    # internal forward function that runs until final softmax
    # we need this separation because ONNX doesn't support logsoftmax
    x = self._forward(x)
    # softmax, note: log_softmax is not supported in ONNX
    # output = F.softmax(x, dim=1)
    return x


def main():
  model = OnnxCompatibleFacialExpressionNet(conf.num_categories,
                                            conf.num_classes,
                                            'small',
                                            0.5,
                                            regression=True,
                                            exportable=True)
  if conf.model_path:
    print('loading saved model')
    ckpt = torch.load(conf.model_path, map_location='cpu')
    model.load_state_dict(ckpt, strict=True)
    print('saved model loaded')

  # eval mode
  model.eval()

  # dummy input to specify input size
  dummy_input = torch.zeros(1, 3, 224, 224)

  # export to onnx
  torch.onnx.export(model, dummy_input, conf.onnx_path, verbose=True)


if __name__ == '__main__':
  main()
