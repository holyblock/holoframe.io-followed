import torch.nn as nn
import torch.nn.functional as F
import geffnet.mobilenetv3
import geffnet.efficientnet_builder as geb


# genereate model paramters
# https://github.com/rwightman/gen-efficientnet-pytorch/blob/master/geffnet/mobilenetv3.py
def _gen_mobilenet_v3_kwargs(variant,
                             channel_multiplier=1.0,
                             exportable=False,
                             **kwargs):
    """Creates a MobileNet-V3 large/small/minimal models.
      Ref impl: https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet/mobilenet_v3.py
      Paper: https://arxiv.org/abs/1905.02244
      Args:
        channel_multiplier: multiplier to number of channels per layer.
    """
    if 'small' in variant:
        num_features = 1024
        if 'minimal' in variant:
            act_layer = 'relu'
            arch_def = [
                # stage 0, 112x112 in
                ['ds_r1_k3_s2_e1_c16'],
                # stage 1, 56x56 in
                ['ir_r1_k3_s2_e4.5_c24', 'ir_r1_k3_s1_e3.67_c24'],
                # stage 2, 28x28 in
                ['ir_r1_k3_s2_e4_c40', 'ir_r2_k3_s1_e6_c40'],
                # stage 3, 14x14 in
                ['ir_r2_k3_s1_e3_c48'],
                # stage 4, 14x14in
                ['ir_r3_k3_s2_e6_c96'],
                # stage 6, 7x7 in
                ['cn_r1_k1_s1_c576'],
            ]
        else:
            act_layer = 'hard_swish'
            arch_def = [
                # stage 0, 112x112 in
                ['ds_r1_k3_s2_e1_c16_se0.25_nre'],  # relu
                # stage 1, 56x56 in
                ['ir_r1_k3_s2_e4.5_c24_nre', 'ir_r1_k3_s1_e3.67_c24_nre'],  # relu
                # stage 2, 28x28 in
                ['ir_r1_k5_s2_e4_c40_se0.25',
                 'ir_r2_k5_s1_e6_c40_se0.25'],  # hard-swish
                # stage 3, 14x14 in
                ['ir_r2_k5_s1_e3_c48_se0.25'],  # hard-swish
                # stage 4, 14x14in
                ['ir_r3_k5_s2_e6_c96_se0.25'],  # hard-swish
                # stage 6, 7x7 in
                ['cn_r1_k1_s1_c576'],  # hard-swish
            ]
    else:
        num_features = 1280
        if 'minimal' in variant:
            act_layer = 'relu'
            arch_def = [
                # stage 0, 112x112 in
                ['ds_r1_k3_s1_e1_c16'],
                # stage 1, 112x112 in
                ['ir_r1_k3_s2_e4_c24', 'ir_r1_k3_s1_e3_c24'],
                # stage 2, 56x56 in
                ['ir_r3_k3_s2_e3_c40'],
                # stage 3, 28x28 in
                [
                    'ir_r1_k3_s2_e6_c80', 'ir_r1_k3_s1_e2.5_c80',
                    'ir_r2_k3_s1_e2.3_c80'
                ],
                # stage 4, 14x14in
                ['ir_r2_k3_s1_e6_c112'],
                # stage 5, 14x14in
                ['ir_r3_k3_s2_e6_c160'],
                # stage 6, 7x7 in
                ['cn_r1_k1_s1_c960'],
            ]
        else:
            act_layer = 'hard_swish'
            arch_def = [
                # stage 0, 112x112 in
                ['ds_r1_k3_s1_e1_c16_nre'],  # relu
                # stage 1, 112x112 in
                ['ir_r1_k3_s2_e4_c24_nre', 'ir_r1_k3_s1_e3_c24_nre'],  # relu
                # stage 2, 56x56 in
                ['ir_r3_k5_s2_e3_c40_se0.25_nre'],  # relu
                # stage 3, 28x28 in
                [
                    'ir_r1_k3_s2_e6_c80', 'ir_r1_k3_s1_e2.5_c80',
                    'ir_r2_k3_s1_e2.3_c80'
                ],  # hard-swish
                # stage 4, 14x14in
                ['ir_r2_k3_s1_e6_c112_se0.25'],  # hard-swish
                # stage 5, 14x14in
                ['ir_r3_k5_s2_e6_c160_se0.25'],  # hard-swish
                # stage 6, 7x7 in
                ['cn_r1_k1_s1_c960'],  # hard-swish
            ]

    # add exportable argument to instruct the underlying geffnet to bypass
    # HardSwish operation that breaks ONNX
    if exportable:
        kwargs['exportable'] = exportable

    with geffnet.config.layer_config_kwargs(kwargs):
        model_kwargs = dict(
            block_args=geb.decode_arch_def(arch_def),
            num_features=num_features,
            stem_size=16,
            channel_multiplier=channel_multiplier,
            act_layer=geb.resolve_act_layer(kwargs, act_layer),
            se_kwargs=dict(act_layer=geb.get_act_layer('relu'),
                           gate_fn=geb.get_act_fn('hard_sigmoid'),
                           reduce_mid=True,
                           divisor=8),
            norm_kwargs=geb.resolve_bn_args(kwargs),
            **kwargs,
        )
    return model_kwargs


class FacialExpressionNet(geffnet.mobilenetv3.MobileNetV3):

    def __init__(self,
                 num_categories,
                 num_classes,
                 size='small',
                 channel_multiplier=1.0,
                 exportable=False,
                 regression=False):
        kwargs = _gen_mobilenet_v3_kwargs([size],
                                          channel_multiplier=channel_multiplier,
                                          exportable=exportable)
        super(FacialExpressionNet, self).__init__(**kwargs)

        self.num_categories = num_categories
        self.num_classes = num_classes

        # 1 layer FC
        self.fc1 = nn.Linear(1024, 1024)
        self.regression = regression
        if regression:
            # self.fc2 = nn.Linear(128 * num_categories, num_categories)
            self.fc2 = nn.Linear(1024, num_categories)
        else:
            self.fc2 = nn.Linear(1024, num_classes * num_categories)

        # MLP with Conv1


    def _forward(self, x):
        # pass through MobileNet
        x = self.features(x)
        x = x.flatten(1)
        # fully connected to categorical prediction
        x = self.fc1(x)
        x = F.relu(x)
        # output to categories
        x = self.fc2(x)  # bs, Num_classes * num_catetgory
        # reshape to [batch_size * num_categories, num_classes]
        if not self.regression:
            x = x.reshape(-1, self.num_classes)
        return x

    def forward(self, x):
        # internal forward function that runs until final softmax
        # we need this separation because ONNX doesn't support logsoftmax
        x = self._forward(x)
        # log_softmax
        output = x
        # print(x[0])
        if not self.regression:
            output = F.log_softmax(output, dim=1)
        return output
