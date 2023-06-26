import bpy
import csv

MOCAP_SEQUENCE_FILE_PATH = './sequence.csv'
MOCAP_VIDEO_PATH = './video.mov'


def load_frames(csv_file_path):
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        data = {}
        for row in reader:
            for column, value in row.items():
                data.setdefault(column, []).append(value)
    return data


def load_video(file_path):
    # switch context to video sequence editor
    bpy.context.area.type = 'SEQUENCE_EDITOR'
    # load the video from file path
    bpy.ops.sequencer.movie_strip_add(filepath=file_path)


def insert_shape_keys(shape_key_frames):
    for shape_key in bpy.data.shape_keys:
        for key_block in shape_key.key_blocks:
            if key_block.name in shape_key_frames:
                for (i, v) in enumerate(shape_key_frames[key_block.name]):
                    key_block.value = float(v)
                    key_block.keyframe_insert('value', frame=i)


def main():
    # load shape key data
    shape_key_frames = load_frames(MOCAP_SEQUENCE_FILE_PATH)
    
    # load video into video sequencer 
    load_video(MOCAP_VIDEO_PATH)

    # insert shape key values into frames
    insert_shape_keys(shape_key_frames)

    # switch back to text editor
    bpy.context.area.type = 'TEXT_EDITOR'


if __name__ == '__main__':
    main()
