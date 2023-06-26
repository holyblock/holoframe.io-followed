import os
import csv
import torch
import torch.nn as nn
from param import conf
from data import FacialExpressionDataset
from model import FacialExpressionNet
from torch.utils.data import DataLoader

LABEL_INDICES = [2, 9, 19, 25, 26, 48]
FULL_LABEL_LENGTH = 63
PREDICTION_NAME = 'prediction.csv'


def test(model, eval_loader):
  # switching to eval mode
  model.eval()

  pred_labels = []
  for images, _ in eval_loader:
    # put data on GPU
    if torch.cuda.is_available():
      images = images.cuda(conf.gpu_idx, non_blocking=True)

    # perform inference
    output = model(images)

    # write result to csv
    top_1 = output.argmax(dim=1)
    top_1 = top_1.reshape(
        -1, conf.num_categories)  # reshape to [batch_size * num_categories]

    for r in range(top_1.shape[0]):
      labels = [0] * FULL_LABEL_LENGTH
      for (i, j) in enumerate(LABEL_INDICES):
        labels[j] = top_1[r, i].item() / (conf.num_classes - 1)
      pred_labels.append(labels)

  return pred_labels


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
                           shuffle=False)

  # start validation
  print('start validation')
  pred_labels = test(model, eval_loader)
  print('validation completed')

  # write the result to file
  print('writing results')
  file_reader = open(conf.eval_label_path, 'r')
  file_writer = open(os.path.join(conf.eval_img_folder, PREDICTION_NAME), 'w')
  csv_reader = csv.reader(file_reader, delimiter=',')
  csv_writer = csv.writer(file_writer, delimiter=',')
  csv_iter = iter(csv_reader)
  data_header = next(csv_iter)
  csv_writer.writerow(data_header)

  for (label, row) in zip(pred_labels, csv_iter):
    label[0] = row[0]
    csv_writer.writerow(label)

  file_reader.close()
  file_writer.close()
  print('script completed')


if __name__ == '__main__':
  main()
