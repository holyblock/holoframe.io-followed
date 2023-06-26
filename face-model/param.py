import argparse

parser = argparse.ArgumentParser(description='Facial model training parameters')

# -- Basic --
parser.add_argument('--seed',
                    type=int,
                    default=42,
                    help='random seed (default: 42)')
parser.add_argument('--eps',
                    type=float,
                    default=1e-6,
                    help='epsilon (default: 1e-6)')
parser.add_argument('--lr_rate',
                    type=float,
                    default=1e-3,
                    help='learning rate (default: 1e-3)')
parser.add_argument('--batch_size',
                    type=int,
                    default=64,
                    help='batch size (default: 64)')
parser.add_argument('--num_epochs',
                    type=int,
                    default=100,
                    help='number of training epochs (default: 100)')
parser.add_argument('--gpu_idx',
                    type=int,
                    default=None,
                    help='index of gpu to use (default: None, use all)')
parser.add_argument('--save_interval',
                    type=int,
                    default=1,
                    help='epoch interval for saving model (default: 1)')
parser.add_argument('--model_save_folder',
                    type=str,
                    default='./weights',
                    help='model saving directory (default: ./weights)')

# -- Dataset --
parser.add_argument(
    '--num_categories',
    type=int,
    default=6,
    help='number of prediction categories ' +
    '(default: 6, l/r blink, jaw open, l/r mouth smile, cheek puff)')
parser.add_argument(
    '--num_classes',
    type=int,
    default=11,
    help='classification granularity (default: 11, i.e., 0, 0.1, 0.2, ..., 1)')
parser.add_argument('--model_path',
                    type=str,
                    default='./weights/lm_model0.pth',
                    help='path to pretrained model')
parser.add_argument('--train_label_path',
                    type=str,
                    default='./data/train/labels.csv',
                    help='path to training labels csv')
parser.add_argument('--train_img_folder',
                    type=str,
                    default='./data/train',
                    help='path to training image folder')
parser.add_argument('--eval_label_path',
                    type=str,
                    default='./data/eval/labels.csv',
                    help='path to validation labels csv')
parser.add_argument('--eval_img_folder',
                    type=str,
                    default='./data/eval',
                    help='path to validation image folder')

# -- ONNX deployment --
parser.add_argument('--onnx_path',
                    type=str,
                    default='./weights/model.onnx',
                    help='path to onnx output')

conf = parser.parse_args()