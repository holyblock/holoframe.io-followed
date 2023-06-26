import numpy as np
import torch.nn as nn
import torch.optim as optim
from face_detection import RetinaFace
from model import SixDRepNet
from torchvision import transforms
import torch.backends.cudnn as cudnn
from PIL import Image
import time
from utils import *
import csv
import argparse

parser = argparse.ArgumentParser(description='Labeler Script')
parser.add_argument('--data-dir', type=str, default='', help='dataset used for generation')
args = parser.parse_args()

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

transformations = transforms.Compose([transforms.Resize(224),
                                      transforms.CenterCrop(224),
                                      transforms.ToTensor(),
                                      transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
cudnn.enabled = True
gpu = 0
snapshot_path = '6DRepNet_300W_LP_AFLW2000.pth'
model = SixDRepNet(backbone_name='RepVGG-B1g2',
                   backbone_file='',
                   deploy=True,
                   pretrained=False)
detector = RetinaFace(gpu_id=gpu)
saved_state_dict = torch.load(os.path.join(
    snapshot_path), map_location='cpu')

if 'model_state_dict' in saved_state_dict:
    model.load_state_dict(saved_state_dict['model_state_dict'])
else:
    model.load_state_dict(saved_state_dict)
model.cuda(gpu)
model.eval()  # Change model to 'eval' mode (BN uses moving mean/var).
BLEND_SHAPE_MASK = np.array(BLEND_SHAPE_TIERS, dtype=np.float)
BLEND_SHAPE_MASK[BLEND_SHAPE_MASK == 1] = 0.06
BLEND_SHAPE_MASK[BLEND_SHAPE_MASK == 2] = 0.2
BLEND_SHAPE_MASK[BLEND_SHAPE_MASK == 3] = 0.4
BLEND_SHAPE_MASK[BLEND_SHAPE_MASK == 4] = 0.4
BLEND_SHAPE_MASK[BLEND_SHAPE_MASK == 5] = 0.2
BLEND_SHAPE_MASK = torch.from_numpy(BLEND_SHAPE_MASK).cuda()
METAHUMAN_NUM = 54

# network parameters & optimizers
class Net(nn.Module):
    def __init__(self, rotation_mat):
        super(Net, self).__init__()
        self.AU_coeff = nn.Parameter(torch.zeros(METAHUMAN_NUM, 42))  # 54, 42
        self.scale = nn.Parameter(torch.ones(METAHUMAN_NUM, 1, 1))  #54, 1
        self.offset = nn.Parameter(torch.zeros(METAHUMAN_NUM, 1, 3))  # 54, 1, 3
        self.rotation_mat = rotation_mat  # 3,3

    def forward(self, landmark_diff, base_landmark):
        '''

        :param landmark_diff: 54, 42, 478, 3
        :param base_landmark: 54, 478, 3
        :return: landmark_pred: 54, 478, 3
        '''

        AU_coeff = self.AU_coeff.data
        AU_coeff = AU_coeff.clamp(0, 1)
        self.AU_coeff.data = AU_coeff

        landmark_pred = self.AU_coeff.unsqueeze(-1).unsqueeze(-1) * landmark_diff  # 54, 42, 478, 3
        landmark_pred = landmark_pred.sum(1)  # 54, 478, 3
        landmark_pred = landmark_pred + base_landmark  # 54, 478, 3

        landmark_pred = torch.matmul(self.rotation_mat, landmark_pred.transpose(1, 2))
        landmark_pred = landmark_pred.transpose(1, 2)  # 54, 478, 3
        landmark_pred *= self.scale
        landmark_pred += self.offset
        return landmark_pred

mp_face_mesh = mp.solutions.face_mesh
landmark_diff_dict = {}
base_landmark_dict = {}
name_list = os.listdir('MetaHuman_AU_diff')
name_list.sort()  # 54 metahuman candidates
landmark_diff_list = []
base_landmark_list = []
for name_idx, name in enumerate(name_list):
    if name.startswith('.'):
        continue
    neural_lbl_file = 'MetaHuman_AU_diff/{}/neutral.npy'.format(name)
    neural_lbl = np.load(neural_lbl_file)  # 478, 3
    landmark_diff = []
    for i in range(42):
        lbl_file = 'MetaHuman_AU_diff/{}'.format(name)+'/{0:02d}.npy'.format(i)
        lbl = np.load(lbl_file)
        diff = lbl - neural_lbl
        landmark_diff.append(diff)
    landmark_diff = np.array(landmark_diff)  # 42, 478, 3
    # copy all np array to torch, declare scale, offset, AU coefficient
    landmark_diff_list.append(landmark_diff)
    base_landmark_list.append(neural_lbl)

    landmark_diff = torch.from_numpy(landmark_diff)
    base_landmark = torch.from_numpy(neural_lbl)
    landmark_diff = landmark_diff.float()
    base_landmark = base_landmark.float()

    landmark_diff_dict[name] = landmark_diff
    base_landmark_dict[name] = base_landmark

# load landmark
data_dir = args.data_dir
image_list = os.listdir(data_dir)
image_list.sort()
AU_label = os.path.join(data_dir, 'labels_GD_Meta.csv')
sample_csv = 'test_video_images/labels_ArKit.csv'
with open(sample_csv, 'r') as sample_csv_file:
    csv_keys = sample_csv_file.readline()[:-1]
    firstLine = [i for i in csv_keys.split(',')]
    csv_keys_list = csv_keys.split(',')[2:]
f_csv_pred = open(AU_label, 'w')
f_csv_pred = csv.writer(f_csv_pred)
f_csv_pred.writerow(firstLine)

for img_idx, img_dir in enumerate(image_list):
    print('{}/{}, {}'.format(img_idx+1, len(image_list), img_dir))
    if not img_dir.endswith('.jpg'):
        continue
    img_dir_full = os.path.join(data_dir, img_dir)
    landmark_np = np.zeros([478, 3])
    min_loss = np.inf
    min_AU_activation = np.inf

    # get mediapipe facemesh
    with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5) as face_mesh:
        image = cv2.imread(img_dir_full)
        results = face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        # Print and draw face mesh landmarks on the image.
        # get head rotation
        with torch.no_grad():
            # frame = cv2.imread(image)
            frame = image
            faces = detector(frame)
            for box, landmarks, score in faces:
                # Print the location of each face in this image
                if score < .95:
                    continue
                x_min = int(box[0])
                y_min = int(box[1])
                x_max = int(box[2])
                y_max = int(box[3])
                bbox_width = abs(x_max - x_min)
                bbox_height = abs(y_max - y_min)

                x_min = max(0, x_min - int(0.2 * bbox_height))
                y_min = max(0, y_min - int(0.2 * bbox_width))
                x_max = x_max + int(0.2 * bbox_height)
                y_max = y_max + int(0.2 * bbox_width)

                img = frame[y_min:y_max, x_min:x_max]
                img = Image.fromarray(img)
                img = img.convert('RGB')
                img = transformations(img)

                img = torch.Tensor(img[None, :]).cuda(gpu)
                # img = torch.Tensor(img[None, :])
                start = time.time()
                R_pred = model(img)
                end = time.time()

                euler = compute_euler_angles_from_rotation_matrices(
                    R_pred)
                p_pred_deg = float(euler[:, 0].cpu())
                y_pred_deg = float(euler[:, 1].cpu())
                r_pred_deg = float(euler[:, 2].cpu())
                rotation_angle = torch.from_numpy(np.array([-p_pred_deg, y_pred_deg, r_pred_deg])).float()
                rotation_mat = euler_angles_to_matrix(rotation_angle, 'XYZ')

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                for idx, landmark in enumerate(face_landmarks.landmark):
                    landmark_np[idx, 0] = landmark.x
                    landmark_np[idx, 1] = landmark.y
                    landmark_np[idx, 2] = landmark.z

    target_landmark = torch.from_numpy(landmark_np)
    target_landmark = target_landmark.float().cuda()  # 478, 3
    target_landmark_th = target_landmark.unsqueeze(0).tile([METAHUMAN_NUM, 1, 1])  # 54, 478, 3
    landmark_diff_np = np.array(landmark_diff_list)  # 54, 42, 478, 3
    base_landmark_np = np.array(base_landmark_list)  # 54, 478, 3
    landmark_diff_th = torch.from_numpy(landmark_diff_np).float().cuda()
    base_landmark_th = torch.from_numpy(base_landmark_np).float().cuda()
    net = Net(rotation_mat.cuda())
    net = net.float().cuda()
    AU_param = []
    Linear_param = []
    for k, v in net.named_parameters():
        if 'AU' in k:
            AU_param.append(v)
        else:
            Linear_param.append(v)
    optimizer_AU = optim.AdamW(AU_param, lr=0.02)
    optimizer_Linear = optim.AdamW(Linear_param, lr=0.1)
    criterion = nn.MSELoss(reduction='none')

    for ep in range(3000):
        optimizer_AU.zero_grad()
        optimizer_Linear.zero_grad()
        # forward passing
        landmark_pred = net(landmark_diff_th, base_landmark_th)  # 54, 478, 3
        loss = criterion(landmark_pred, target_landmark_th)  # 54, 478, 3

        # reweight with xyz
        loss[:, :, 2] *= 0.1
        # reweight with attribute
        loss[:, leftEyeVertices] *= 30.
        loss[:, rightEyeVertices] *= 30.
        loss[:, mouthVertices] *= 10.
        loss[:, leftBrowVertices] *= 10.
        loss[:, rightBrowVertices] *= 10.

        loss = torch.mean(loss, dim=[-1, -2])  # 54

        # add a regularization for AU activation
        l2_lambda = 0.0001/54.
        l2_loss = 0
        for p_idx, p in enumerate(AU_param):
            l2_loss += (p.pow(2.0)*BLEND_SHAPE_MASK.unsqueeze(0)).sum()
        loss += l2_lambda * l2_loss

        # backward, optimize parameter
        loss_mean = torch.mean(loss)
        loss_mean.backward()
        optimizer_Linear.step()
        optimizer_AU.step()
        optimizer_Linear.zero_grad()
        optimizer_AU.zero_grad()

    AU_coeff = net.AU_coeff.data.clamp(0, 1)
    _, ind = torch.topk(loss, 8)
    AU_coeff = AU_coeff[ind].mean(0)
    AU_coeff = AU_coeff.detach().cpu()

    img_path = img_dir[:-4]
    line_to_write = [img_path, 61]
    for csv_key in csv_keys_list:
        if csv_key in MODEL_BLEND_SHAPES:
            au_idx = MODEL_BLEND_SHAPES.index(csv_key)
            val = float(AU_coeff[au_idx])
        else:
            if csv_key == 'HeadYaw':
                val = float(euler[:,1].cpu())/np.pi
            elif csv_key == 'HeadPitch':
                val = float(euler[:,0].cpu())/np.pi
            elif csv_key == 'HeadRoll':
                val = float(euler[:,2].cpu())/np.pi
            else:
                val = 0
        line_to_write.append(val)
    f_csv_pred.writerow(line_to_write)

