import torch
import time
import numpy as np
import math

class AverageMeter(object):
    """Computes and stores the average and current value"""
    def __init__(self):
        self.initialized = False
        self.val = None
        self.avg = None
        self.sum = None
        self.count = None

    def initialize(self, val, weight):
        self.val = val
        self.avg = val
        self.sum = val*weight
        self.count = weight
        self.initialized = True

    def update(self, val, weight=1):
        val = np.asarray(val)
        if not self.initialized:
            self.initialize(val, weight)
        else:
            self.add(val, weight)

    def add(self, val, weight):
        self.val = val
        if val > 0:
            self.sum += val * weight
            self.count += weight
            self.avg = self.sum / self.count

    def value(self):
        return self.val.tolist()

    def average(self):
        return self.avg.tolist()

# class AverageMeter(object):
#
#     def __init__(self):
#         self.n = 0
#         self.v = 0
#
#     def update(self, v):
#         self.v += v
#         self.n += 1
#
#     def aggregate(self):
#         if self.n == 0:
#             return 0
#         else:
#             return self.v / self.n


class TimeMeter(object):
    def __init__(self):
        self.sum = 0
        self.count = 0
        self.last_tic = None

    def reset(self):
        self.sum = 0
        self.count = 0
        self.last_tic = None

    def tic(self):
        self.last_tic = time.time()

    def toc(self):
        torch.cuda.synchronize()
        if not self.last_tic:
            raise (RuntimeError("Timer not started yet."))
        self.count += 1
        self.sum += time.time() - self.last_tic
        self.last_tic = None

    def average(self, reset=False):
        res = self.sum / self.count
        if reset:
            self.reset()
        return res

    def total(self, reset=False):
        res = self.sum
        if reset:
            self.reset()
        return res
def warmup_learning_rate(args, epoch, batch_id, total_batches, optimizer):
    if args.warm and epoch <= args.warm_epochs:
        p = (batch_id + (epoch - 1) * total_batches) / \
            (args.warm_epochs * total_batches)
        lr = args.warmup_from + p * (args.warmup_to - args.warmup_from)

        for param_group in optimizer.param_groups:
            param_group['lr'] = lr
def adjust_learning_rate(args, optimizer, epoch):
    lr = args.learning_rate
    if args.cosine:
        eta_min = lr * (args.lr_decay_rate ** 3)
        lr = eta_min + (lr - eta_min) * (
                1 + math.cos(math.pi * epoch / args.epochs)) / 2
    else:
        steps = np.sum(epoch > np.asarray(args.lr_decay_epochs))
        if steps > 0:
            lr = lr * (args.lr_decay_rate ** steps)

    for param_group in optimizer.param_groups:
        param_group['lr'] = lr

def get_accuracy(output, target):
    pred_labels = output.argmax(dim=1)
    top1_accuracy = sum(pred_labels == target).cpu().numpy() / len(target)
    return top1_accuracy

def accuracy(output, target, topk=(1,)):
    """Computes the accuracy over the k top predictions for the specified values of k"""
    with torch.no_grad():
        maxk = max(topk)
        batch_size = target.size(0)

        _, pred = output.topk(maxk, 1, True, True)
        pred = pred.t()
        correct = pred.eq(target.view(1, -1).expand_as(pred))

        res = []
        for k in topk:
            correct_k = correct[:k].reshape(-1).float().sum(0, keepdim=True)
            res.append(correct_k.mul_(100.0 / batch_size))
        return res

def earth_mover_distance(y_true, y_pred):
    return torch.sum(torch.mean(torch.square(torch.cumsum(y_true, dim=-1) - torch.cumsum(y_pred, dim=-1)), dim=-1))


# tier1: 2, 9, 8, 15, 19, 25, 26
# tier2: 7, 14, 21, 22, 27, 28, 35, 36, 43, 44, 45, 46, 47, 51, 52
# tier3: 48, 39, 40, 41, 42, 23, 24
# tier4: 18, 17, 20, 29, 30, 31, 32, 33, 34, 37, 38, 49, 50

tier12_list = '2,9,8,15,19,25,26,7,14,21,22,27,28,36,35,43,44,45,46,47,51,52,54,55,56'
tier12_list_flip = '9,2,15,8,19,26,25,14,7,21,22,28,27,36,35,44,43,45,47,46,52,51,54,55,56'

tier34_list =      '48,39,40,41,42,24,23,18,17,20,29,30,31,32,33,34,37,38,49,50'
tier34_list_flip = '48,40,39,42,41,23,24,17,18,20,30,29,32,31,33,34,38,37,50,49'

# eyeball movement
tier5_list     = '4,11,5,12,6,13,3,10'
tier5_list_flip = '11,4,12,5,13,6,10,3'

idx_category_map = {2: 'EyeBlinkLeft', 3: 'EyeLookDownLeft', 4: 'EyeLookInLeft', 5: 'EyeLookOutLeft',
                    6: 'EyeLookUpLeft', 7: 'EyeSquintLeft', 8: 'EyeWideLeft', 9: 'EyeBlinkRight',
                    10: 'EyeLookDownRight', 11: 'EyeLookInRight', 12: 'EyeLookOutRight', 13: 'EyeLookUpRight',
                    14: 'EyeSquintRight', 15: 'EyeWideRight', 16: 'JawForward', 17: 'JawRight', 18: 'JawLeft',
                    19: 'JawOpen', 20: 'MouthClose', 21: 'MouthFunnel', 22: 'MouthPucker', 23: 'MouthRight',
                    24: 'MouthLeft', 25: 'MouthSmileLeft', 26: 'MouthSmileRight', 27: 'MouthFrownLeft',
                    28: 'MouthFrownRight', 29: 'MouthDimpleLeft', 30: 'MouthDimpleRight', 31: 'MouthStretchLeft',
                    32: 'MouthStretchRight', 33: 'MouthRollLower', 34: 'MouthRollUpper', 35: 'MouthShrugLower',
                    36: 'MouthShrugUpper', 37: 'MouthPressLeft', 38: 'MouthPressRight', 39: 'MouthLowerDownLeft',
                    40: 'MouthLowerDownRight', 41: 'MouthUpperUpLeft', 42: 'MouthUpperUpRight', 43: 'BrowDownLeft',
                    44: 'BrowDownRight', 45: 'BrowInnerUp', 46: 'BrowOuterUpLeft', 47: 'BrowOuterUpRight',
                    48: 'CheekPuff', 49: 'CheekSquintLeft', 50: 'CheekSquintRight', 51: 'NoseSneerLeft',
                    52: 'NoseSneerRight', 53: 'TongueOut', 54: 'HeadYaw', 55: 'HeadPitch', 56: 'HeadRoll',
                    57: 'LeftEyeYaw', 58: 'LeftEyePitch', 59: 'LeftEyeRoll', 60: 'RightEyeYaw', 61: 'RightEyePitch',
                    62: 'RightEyeRoll'}
category_idx_map = {'EyeBlinkLeft': 2, 'EyeLookDownLeft': 3, 'EyeLookInLeft': 4, 'EyeLookOutLeft': 5,
                    'EyeLookUpLeft': 6, 'EyeSquintLeft': 7, 'EyeWideLeft': 8, 'EyeBlinkRight': 9,
                    'EyeLookDownRight': 10, 'EyeLookInRight': 11, 'EyeLookOutRight': 12, 'EyeLookUpRight': 13,
                    'EyeSquintRight': 14, 'EyeWideRight': 15, 'JawForward': 16, 'JawRight': 17, 'JawLeft': 18,
                    'JawOpen': 19, 'MouthClose': 20, 'MouthFunnel': 21, 'MouthPucker': 22, 'MouthRight': 23,
                    'MouthLeft': 24, 'MouthSmileLeft': 25, 'MouthSmileRight': 26, 'MouthFrownLeft': 27,
                    'MouthFrownRight': 28, 'MouthDimpleLeft': 29, 'MouthDimpleRight': 30, 'MouthStretchLeft': 31,
                    'MouthStretchRight': 32, 'MouthRollLower': 33, 'MouthRollUpper': 34, 'MouthShrugLower': 35,
                    'MouthShrugUpper': 36, 'MouthPressLeft': 37, 'MouthPressRight': 38, 'MouthLowerDownLeft': 39,
                    'MouthLowerDownRight': 40, 'MouthUpperUpLeft': 41, 'MouthUpperUpRight': 42, 'BrowDownLeft': 43,
                    'BrowDownRight': 44, 'BrowInnerUp': 45, 'BrowOuterUpLeft': 46, 'BrowOuterUpRight': 47,
                    'CheekPuff': 48, 'CheekSquintLeft': 49, 'CheekSquintRight': 50, 'NoseSneerLeft': 51,
                    'NoseSneerRight': 52, 'TongueOut': 53, 'HeadYaw': 54, 'HeadPitch': 55, 'HeadRoll': 56,
                    'LeftEyeYaw': 57, 'LeftEyePitch': 58, 'LeftEyeRoll': 59, 'RightEyeYaw': 60, 'RightEyePitch': 61,
                    'RightEyeRoll': 62}

if __name__ == '__main__':
    tier12_list = tier12_list.split(',')
    tier12_list = [int(i) for i in tier12_list]
    print(len(category_idx_map))
    # for i in tier12_list:
    #     print(i, idx_category_map[i])