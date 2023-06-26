import torch
import torch.nn as nn
import utils
from param import conf
from data import FacialExpressionDataset
from model import FacialExpressionNet
from torch.utils.data import DataLoader


def eval(model, eval_loader):
  # switching to eval mode
  model.eval()

  # set up loss function
  criterion = nn.CrossEntropyLoss().cuda(conf.gpu_idx)

  accuracy_meter = utils.AverageMeter()
  loss_meter = utils.AverageMeter()

  for images, target in eval_loader:
    # reshape target to batch_size * num_categories
    target = torch.stack(target).transpose(0, 1).reshape(-1)

    # put data on GPU
    if torch.cuda.is_available():
      images = images.cuda(conf.gpu_idx, non_blocking=True)
      target = target.cuda(conf.gpu_idx, non_blocking=True)

    # perform inference
    output = model(images)

    # compute the loss
    loss = criterion(output, target)

    # update statistics
    accuracy = utils.get_accuracy(output, target)
    accuracy_meter.update(accuracy)
    loss_meter.update(loss.item())

  return accuracy_meter.aggregate(), loss_meter.aggregate()


def main():
  if torch.cuda.is_available():
    map_location = None  # use GPU
  else:
    map_location = 'cpu'

  # set up nerual network
  print('set up neural network...')
  model = FacialExpressionNet(conf.num_categories, conf.num_classes, 'small',
                              0.5)
  if torch.cuda.is_available():
    model = model.cuda(conf.gpu_idx)

  # load neural network
  if conf.model_path:
    print('loading saved model')
    ckpt = torch.load(conf.model_path, map_location=map_location)
    model.load_state_dict(ckpt, strict=True)
    print('saved model loaded')

  # load dataset
  print('loading validation data')
  eval_dataset = FacialExpressionDataset(conf.eval_label_path,
                                         conf.eval_img_folder, conf.num_classes)
  eval_loader = DataLoader(eval_dataset,
                           batch_size=conf.batch_size,
                           shuffle=True)

  # start validation
  print('start validation')
  eval_accuracy, eval_loss = eval(model, eval_loader)

  print('eval accuracy: {}'.format(round(eval_accuracy, 2)))
  print('eval loss: {}'.format(round(eval_loss, 2)))


if __name__ == '__main__':
  main()
