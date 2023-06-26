import math
import os
import random
import time
import torch
import torch.nn as nn
import utils
import numpy as np
import matplotlib.pyplot as plt
from data import FacialExpressionDataset
from model import FacialExpressionNet
from param import conf
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from torchvision import transforms
from torch.nn import functional as F
from utils import earth_mover_distance, accuracy, TimeMeter
from utils import idx_category_map, category_idx_map, adjust_learning_rate

HAS_GPU = torch.cuda.is_available()

progress_str_fmt = \
    "{name:5} #{epoch} [{batch:4}/{total_batch:4}]:" \
    "{time:4.2f}s({gpu_time:4.2f}s + {data_time:4.2f}s)" \
    " top1 acc: {top1_acc:.3f}({top1_acc_avg:.4f})" \
    " top3 acc: {top3_acc:.3f}({top3_acc_avg:.4f})" \
    " ce loss: {ce_loss:.3f}({ce_loss_avg:.4f})" \
    " emd loss: {emd_loss:.3f}({emd_loss_avg:.4f})" \
    " l2 loss: {l2_loss:.3f}({l2_loss_avg:.4f})"

summary_str_fmt = \
    "Epoch {epoch} {name:10}: {epoch_time:.2f}s elapsed, " \
    " top1 acc: {top1_acc_avg: .4f}" \
    " top3 acc: {top3_acc_avg: .4f}" \
    " ce loss: {ce_loss_avg: .4f}" \
    " emd loss: {emd_loss_avg: .4f}" \
    " l2 loss: {l2_loss_avg: .4f}"


def plot_bar(labels, values, title):
    x = np.arange(len(labels))  # the label locations
    width = 0.35  # the width of the bars

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(x, values, width)

    # Add some text for labels, title and custom x-axis tick labels, etc.
    # ax.set_ylabel('Skeleton Err (mm)')
    ax.set_title(title)
    ax.set_xticks(x)
    ax.set_xticklabels([label[:15] for label in labels])
    # ax.set_ylim([0, 100])
    ax.grid()
    fig.tight_layout()
    fig.canvas.draw()  # draw the canvas, cache the renderer
    width, height = fig.get_size_inches() * fig.get_dpi()
    img = np.fromstring(fig.canvas.tostring_rgb(), dtype='uint8').reshape(int(height), int(width), 3).astype(
        float) / 255
    plt.close(fig)
    return img


def loop(model, data_loader, logger, criterion, criterion_regress, optimizer, epoch, loss_type, train=True):
    if train:
        model.train()
    else:
        model.eval()

    top1_meter = utils.AverageMeter()
    top3_meter = utils.AverageMeter()
    ce_loss_meter = utils.AverageMeter()
    emd_loss_meter = utils.AverageMeter()
    l2_loss_meter = utils.AverageMeter()
    epoch_timer = TimeMeter()
    data_timer = TimeMeter()
    gpu_timer = TimeMeter()
    category_top1_meters = []
    category_top3_meters = []
    category_ce_meters = []
    category_emd_meters = []
    category_l2_meters = []
    for category_idx in range(conf.num_categories):
        category_top1_meters.append(utils.AverageMeter())
        category_top3_meters.append(utils.AverageMeter())
        category_ce_meters.append(utils.AverageMeter())
        category_emd_meters.append(utils.AverageMeter())
        category_l2_meters.append(utils.AverageMeter())
    epoch_timer.tic()
    data_timer.tic()

    for idx, (images, target, target_regress) in enumerate(data_loader):

        # stop data timer and start gpu timer
        data_timer.toc()
        gpu_timer.tic()

        # reshape target to batch_size * num_categories
        target = torch.stack(target).transpose(0, 1)
        target = target.reshape(-1)

        target_regress = torch.stack(target_regress).transpose(0, 1)
        target_regress = target_regress.reshape(-1)

        # put data on GPU
        if HAS_GPU:
            images = images.cuda(conf.gpu_idx, non_blocking=True)
            target = target.cuda(conf.gpu_idx, non_blocking=True)
            target_regress = target_regress.cuda(conf.gpu_idx, non_blocking=True)

        # perform inference
        output = model(images)

        # if conf.regression:
        #     loss_l2 =
        # else:
        #     # handle output

        # CE loss
        output_softmax = F.softmax(output)
        target_onehot = F.one_hot(target, num_classes=output_softmax.shape[1])
        loss_ce = criterion(output, target)

        # EMD loss
        y_true = target_onehot
        y_pred = output_softmax
        loss_emd = earth_mover_distance(y_true, y_pred)
        loss_l2 = loss_emd

        # loss = loss_emd
        if loss_type == 'ce':
            loss = loss_ce
        elif loss_type == 'emd':
            loss = loss_emd
        elif loss_type == 'l2':
            loss = loss_l2
        else:
            raise NotImplementedError
        # compute gradient and do a training step

        if train:
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # update statistics
        top1, top3 = accuracy(output, target, topk=(1, 3))
        top1_meter.update(top1.item())
        top3_meter.update(top3.item())

        # get accuracy for every class, every category
        output_category = output.reshape([-1, conf.num_categories, conf.num_classes])
        target_category = target.reshape([-1, conf.num_categories])
        y_true_category = y_true.reshape([-1, conf.num_categories, conf.num_classes])
        y_pred_category = y_pred.reshape([-1, conf.num_categories, conf.num_classes])
        for category_idx in range(conf.num_categories):
            output_ = output_category[:, category_idx]
            target_ = target_category[:, category_idx]
            top1_, top3_ = accuracy(output_, target_, topk=(1, 3))
            loss_ce_ = criterion(output_, target_)
            y_true_ = y_true_category[:, category_idx]
            y_pred_ = y_pred_category[:, category_idx]
            loss_emd_ = earth_mover_distance(y_true_, y_pred_)
            loss_l2_ = loss_emd_
            category_top1_meters[category_idx].update(top1_.item())
            category_top3_meters[category_idx].update(top3_.item())
            category_ce_meters[category_idx].update(loss_ce_.item())
            category_emd_meters[category_idx].update(loss_emd_.item())
            category_l2_meters[category_idx].update(loss_l2_.item())
            # category_idx_name = int(conf.category.split(',')[category_idx])
            # category_name = idx_category_map[category_idx_name]

        ce_loss_meter.update(loss_ce.item())
        emd_loss_meter.update(loss_emd.item())
        l2_loss_meter.update(loss_l2.item())

        # stop gpu timer
        gpu_timer.toc()

        if idx % conf.print_freq == 0:
            print(progress_str_fmt.format(
                name="Train" if train else "Valid",
                epoch=epoch,
                batch=idx,
                total_batch=len(data_loader),
                time=gpu_timer.average() + data_timer.average(),
                gpu_time=gpu_timer.average(reset=True),
                data_time=data_timer.average(reset=True),
                top1_acc=top1_meter.value(),
                top1_acc_avg=top1_meter.average(),
                top3_acc=top3_meter.value(),
                top3_acc_avg=top3_meter.average(),
                ce_loss=ce_loss_meter.value(),
                ce_loss_avg=ce_loss_meter.average(),
                emd_loss=emd_loss_meter.value(),
                emd_loss_avg=emd_loss_meter.average(),
                l2_loss=l2_loss_meter.value(),
                l2_loss_avg=l2_loss_meter.average(),
            ))

        data_timer.tic()
    epoch_timer.toc()

    # log statistics
    top1_acc = top1_meter.average()
    top3_acc = top3_meter.average()
    ce_loss = ce_loss_meter.average()
    emd_loss = emd_loss_meter.average()
    l2_loss = l2_loss_meter.average()
    logger.add_scalar('top1', top1_acc, epoch)
    logger.add_scalar('top3', top3_acc, epoch)
    logger.add_scalar('CE_Loss', ce_loss, epoch)
    logger.add_scalar('EMD_Loss', emd_loss, epoch)
    logger.add_scalar('L2_Loss', l2_loss, epoch)
    logger.add_scalar('learning_rate', optimizer.param_groups[0]['lr'], epoch)

    # log image for every attribute
    category_name_list = []
    top1_list = []
    top3_list = []
    loss_ce_list = []
    loss_emd_list = []
    loss_l2_list = []
    for category_idx in range(conf.num_categories):
        top1_list.append(category_top1_meters[category_idx].average())
        top3_list.append(category_top3_meters[category_idx].average())
        loss_ce_list.append(category_ce_meters[category_idx].average())
        loss_emd_list.append(category_emd_meters[category_idx].average())
        loss_l2_list.append(category_l2_meters[category_idx].average())
        category_idx_name = int(conf.category.split(',')[category_idx])
        category_name = idx_category_map[category_idx_name]
        category_name_list.append(category_name)
    top1_img = plot_bar(category_name_list, top1_list, 'top1 for each attr')
    top3_img = plot_bar(category_name_list, top3_list, 'top3 for each attr')
    loss_ce_img = plot_bar(category_name_list, loss_ce_list, 'ce loss for each attr')
    loss_emd_img = plot_bar(category_name_list, loss_emd_list, 'emd loss for each attr')
    loss_l2_img = plot_bar(category_name_list, loss_l2_list, 'emd loss for each attr')
    logger.add_image('attr top1', top1_img, epoch, dataformats='HWC')
    logger.add_image('attr top3', top3_img, epoch, dataformats='HWC')
    logger.add_image('attr loss ce', loss_ce_img, epoch, dataformats='HWC')
    logger.add_image('attr loss emd', loss_emd_img, epoch, dataformats='HWC')
    logger.add_image('attr loss l2', loss_l2_img, epoch, dataformats='HWC')

    # print epoch summary
    print(
        summary_str_fmt.format(
            name="Training" if train else "Validation",
            epoch=epoch,
            epoch_time=epoch_timer.total(),
            top1_acc_avg=top1_meter.average(),
            top3_acc_avg=top3_meter.average(),
            ce_loss_avg=ce_loss_meter.average(),
            emd_loss_avg=emd_loss_meter.average(),
            l2_loss_avg=l2_loss_meter.average(),
        )
    )
    return ce_loss, emd_loss, l2_loss, top1_acc, top3_acc


def main():
    if HAS_GPU:
        map_location = None  # use GPU
    else:
        map_location = 'cpu'

    # seed
    torch.manual_seed(conf.seed)
    random.seed(conf.seed)

    # make directory for saving models
    os.makedirs(conf.model_save_folder, exist_ok=True)

    # set up neural network
    print('set up neural network...')
    print('loading training data')
    category_list = conf.category.split(',')
    conf.num_categories = len(category_list)
    print('Training on {} facial attribute'.format(conf.num_categories))
    model = FacialExpressionNet(conf.num_categories, conf.num_classes, 'small', 0.5)
    if HAS_GPU:
        model = model.cuda(conf.gpu_idx)

    # load neural network
    if conf.model_path:
        print('loading saved model')
        ckpt = torch.load(conf.model_path, map_location=map_location)
        # pretrained_dict = {k: v for k, v in ckpt.items() if k != 'conv_stem.weight'}
        # for k, v in pretrained_dict.items():
        #     print(k)
        model.load_state_dict(ckpt, strict=False)
        print('saved model loaded')

    # load dataset
    # transforms
    # train_transform = transforms.Compose([
    #     transforms.RandomResizedCrop(size=224, scale=(0.2, 1.)),
    #     # transforms.RandomResizedCrop(size=224, scale=(0.95, 1.)),
    #     transforms.RandomApply([
    #         transforms.ColorJitter(0.4, 0.4, 0.4, 0.1)
    #     ], p=0.8),
    #     transforms.RandomGrayscale(p=0.2),
    #     transforms.ToTensor(),
    # ])

    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.5, 1.)),
        transforms.ToTensor(),
    ])
    val_transform = transforms.Compose([
        transforms.Resize(size=224),
        transforms.CenterCrop(size=224),
        transforms.ToTensor(),
    ])
    train_dataset = FacialExpressionDataset(conf.train_label_path,
                                            conf.train_img_folder,
                                            conf.num_classes, train_transform,
                                            category_list=conf.category,
                                            category_list_flip=conf.category_flip)
    train_loader = DataLoader(train_dataset,
                              batch_size=conf.batch_size,
                              num_workers=8,
                              shuffle=True)
    print('loading validation data')
    eval_dataset = FacialExpressionDataset(conf.eval_label_path,
                                           conf.eval_img_folder, conf.num_classes, val_transform,
                                           category_list=conf.category,train=False)
    eval_loader = DataLoader(eval_dataset,
                             batch_size=conf.batch_size,
                             shuffle=True)

    # start training
    print('start training')
    # set up loss function and optimizer
    num_epoch = conf.num_epochs
    criterion = nn.CrossEntropyLoss().cuda(conf.gpu_idx)
    criterion_regress = nn.MSELoss().cuda(conf.gpu_idx)

    # config optimizer and cosine learning rate
    print('Training using {} optimizer, with learning rate {}, cosine {}'.format(conf.optimizer, conf.learning_rate,
                                                                                 conf.cosine))
    if conf.optimizer == 'Adam':
        optimizer = torch.optim.Adam(model.parameters(), conf.learning_rate)
    elif conf.optimizer == 'AdamW':
        optimizer = torch.optim.AdamW(model.parameters(), conf.learning_rate)
    else:
        optimizer = torch.optim.SGD(model.parameters(),
                                    lr=conf.learning_rate,
                                    momentum=conf.momentum,
                                    weight_decay=conf.weight_decay)
    iterations = conf.lr_decay_epochs.split(',')
    conf.lr_decay_epochs = list([])
    for it in iterations:
        conf.lr_decay_epochs.append(int(it))
    conf.warm = False
    conf.warmup_from = 0.01
    conf.warm_epochs = 10
    conf.epochs = conf.num_epochs
    eta_min = conf.learning_rate * (conf.lr_decay_rate ** 3)
    conf.warmup_to = eta_min + (conf.learning_rate - eta_min) * (
            1 + math.cos(math.pi * conf.warm_epochs / conf.num_epochs)) / 2

    train_logger = SummaryWriter(os.path.join(conf.model_save_folder, 'train'), flush_secs=2)
    val_logger = SummaryWriter(os.path.join(conf.model_save_folder, 'val'), flush_secs=2)

    # best validation accuracy for saving model
    # best_eval_accuracy = -math.inf
    best_val_loss = math.inf
    for ep in range(num_epoch):
        adjust_learning_rate(conf, optimizer, ep)

        train_ce_loss, train_emd_loss, train_l2_loss, train_top1, train_top3 = \
            loop(model, train_loader, train_logger, criterion, criterion_regress, optimizer, ep, loss_type='ce')
        with torch.no_grad():
            val_ce_loss, val_emd_loss, val_l2_loss, val_top1, val_top3 = \
                loop(model, eval_loader, val_logger, criterion, criterion_regress, optimizer, ep, loss_type='ce', train=False)

        # save model every few intervals
        if ep % conf.save_freq == 0:
            torch.save(model.state_dict(), os.path.join(conf.model_save_folder, 'ep_{}.pth'.format(ep)))
        # if best so far, save a model
        # if eval_accuracy > best_eval_accuracy:
        if val_l2_loss < best_val_loss:
            # best_eval_accuracy = eval_accuracy
            best_val_loss = val_l2_loss
            torch.save(model.state_dict(), os.path.join(conf.model_save_folder, 'best.pth'))
            print('New best model at ep {}.'.format(ep))


if __name__ == '__main__':
    main()
