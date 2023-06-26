# Facial Action Unit Estimation with MetaHuman Nearest Neighbour

## Unreal Engine 5 & MetaHuman Documentation
### MetaHuman in Unreal Engine
1. Download a metahuman subject from Bridge Plugin
2. Click on export in Bridge
3. Open metahuman by dragging the object (blueprint) in (xxx/Metahuman/name/) folder to the scene
4. Import pre-configged action sequence into the project:
    - In the content drawer, under `name` subfolder, right click to add an `Level Sequencer` file and save it.
    - In the Sequencer, click `+Track` and choose `BP_name` to add tracking for the Metahuman.
    - Under `name/Face` in Sequencer, find and add the animation tab, click `+` to choose the preconfigged action sequence. The current preconfigged action sequence is assigning each of the AU to 1 one by one.
    - The current action sequence name is `mh_arkit_mapping_anim_test`.
    - Make sure `Spawnded` is checked.
    - Camera location: 50, 30, 128, Z rotation 128, focal length 90cm
    - Person location: -40, 30, -33, Z rotation 90
    - Make sure to change person Z according to their height

### To Change Animation Subjects
1. Drag the new subject into the project view panel and delete the old one.
2. Open the Level sequencer file. (Currently `Metahumans/test_mocap` Level Sequence)
3. Click on the `+Track` button to add the new subject.
4. Copy and paste the Animation under `BP_oldname/Face` to `BP_newname/Face` and delete whatever under that path previously
5. Change Camera Parameters accordingly.
6. Click camera for a preview, change character z accordingly.
7. __Important:__ Do not drag the time axis during preview, it has a huge chance to ruin the renderer. Directly proceed to generate the movie.

### To Edit Action Control Sequences
1. In the content drawer, under the `name/face` subfolder, double click the facemesh object (name_Facemesh) to open it. Click on the animation tab (Green one on top right, You may want to cancel the auto EV in Lit to stop it from shining).
2. Each curve corresponds to an action unit, double click to open curve editor. Change curve by adding / editing keyframes. 
3. To enable ARKit action unit mapping, import FaceCap_arkit_mapping_pose through `content drawer`, and set the `Animation/Preview Pose Asset` to `FaceCap_arkit_mapping_pose` for  target animation sequence.
4. Modify animation blueprint: in `Face_AnimBP` blueprint, click AnimGraph, drag `FaceCap_arkit_mapping_pose` into the blueprint, connect it between `Blend Pose 0` in “layered blend per bone` and whatever before it.

## Unsupervised Action Unit Generation with Extracted MetaHuman & Mediapipe Mesh 
1. Using off-the-shelf neural network [6DRepNet](https://github.com/thohemp/6DRepNet) for head rotation estimation
2. On Hologram server, go to folder `/home/hologram/Hologram/OptimizeAU`, make sure the processed MetaHuman mesh and AU diffs `MetaHuman_AU_diff` sub-folder is there. 
3. run `python main.py --data-dir DATA_DIR` to generate pseudo labels for images in `DATA_DIR`.

