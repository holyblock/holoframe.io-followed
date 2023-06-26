## Facial expression model training and deployment

### Dependencies
```
pip3 install --user torch torchvision geffnet wget opencv-python mediapipe moviepy pandas tensorboard
```

For Mac
```
brew install ffmpeg
```

For Linux
```
sudo apt install python3-pip ffmpeg libsm6 libxext6
```

### Data preparation
Put raw video clips in `raw/` folder. Use `download_videos.py` for fixed set of URLs. Then run `process_videos.py` to center on face for each frame. Finally, `concatenate_videos.py` will merge all outputs from the previous steps (clips of a few minutes each) into a single long video. After collecting the labels for the concatentated video, use `generate_dataset.py` to genereate image-label pair for training data.

### Data workflow
Multiple folders will be generated to host data at different stage. The flow is `raw` (video clips) -> `cooked` (squared videos of faces) -> `output` (a single concatenated video of square faces) -> `takes` (face video and labels) -> `data` (image-label pairs).

### Old Training / testing workflow (Depreciated)
Run `python3 train.py --model_path ./weights/lm_model0.pth` for training. Run `python3 test.py --model_path ./weights/best.pth` to evaluate the trained model over eval dataset and generate a csv file for prediction labels.

### New Model Training Pipeline
1. Access training repo on Hologram server:
- `cd /home/hologram/Hologram/face-model`
- `python train_reg.py --model_save_folder SAVE_FOLDER --learning_rate 0.002 --lr_decay_epochs 400,550 --num_epochs 600 --save_freq 10 --optimizer AdamW --train_label_path labels/TRAIN_LABEL.CSV--eval_label_path labels/TEST_LABEL.csv --category 2,9,8,15,19,25,26,7,14,21,22,27,28,36,35,43,44,45,46,47,51,52,54,55,56,48,39,40,41,42,24,23,18,17,20,29,30,31,32,33,34,37,38,49,50,4,11,5,12,6,13,3,10 --category_flip 9,2,15,8,19,26,25,14,7,21,22,28,27,36,35,44,43,45,47,46,52,51,54,55,56,48,40,39,42,41,23,24,17,18,20,30,29,32,31,33,34,38,37,50,49,11,4,12,5,13,6,10,3 --batch_size 512`
2. To export the trained model to ONNX: 
- `python deploy_onnx.py --model_path SAVE_FOLDER/best.pth --num_categories 53`.
3. To add/delete categories:
- refer to `utils.py/idx_category_map` to check index to category mapping
- change `--category` and `--category_flip` parameter in __train_reg.py__ and `--num_categores` parameters in __depoly_onnx.py__ accordingly.  
4. run `tensorboard --logdir=./face-model --port PORT` for tensorboard visualization of the training process.


### Data visualization
In the repo root folder, run `yarn build-face-data-vis`. Make sure the data exists in `dataset/data` and the csv label file matches the name in `data-visualization/src/index.js`. To view, run `python3 -m http.server` then in a browser navigate to `localhost:8000/data-visualization/dist/index.html`.

### Model visualization
In `face-model/`, run `python3 deploy_onnx.py --model_path ./weights/best.pt`. Then in the repo root folder, run `yarn build-face-data-vis`. Make sure the data exists in `dataset/data`, the csv label file matches the name in `data-visualization/src/index.js` and `model.onnx` exists in `weights/`. To view, run `python3 -m http.server` then in a browser navigate to `localhost:8000/data-visualization/dist/model.html`.

### Model simulation
In `face-model/blaze-face`, run `python3 deploy_onnx.py`. Then in the repo root folder, run `yarn build-face-data-vis`. Make sure `blazeface.onnx` exists in `face-model/blaze-face/`. To view, run `python3 -m http.server` then in a browser navigate to `localhost:8000/data-visualization/dist/simulation.html`.

