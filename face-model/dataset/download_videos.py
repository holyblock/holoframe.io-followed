import os
import wget

RAW_FOLDER = './raw'


def download_file(url, download_path):
  if not os.path.exists(download_path):
    print('Downloading {url} to {path}'.format(url=url, path=download_path))
    wget.download(url, out=download_path)
  else:
    print('File {path} already exists, skip downloading.'.format(
        path=download_path))


def generate_ryerson_download_list():
  '''
  The Ryerson Audio-Visual Database of Emotional Speech and Song (RAVDESS)
  https://zenodo.org/record/1188976#.Yc1FSC-B0UQ
  '''
  num_actors = 24
  url_template = 'https://zenodo.org/record/1188976/files/Video_Song_Actor_{actor_id}.zip'
  download_path_template = os.path.join(RAW_FOLDER, 'ryerson_{actor_id}.zip')
  download_list = []
  for i in range(num_actors):
    actor_id_str = str(i + 1).zfill(2)
    download_list.append((url_template.format(actor_id=actor_id_str),
                          download_path_template.format(actor_id=actor_id_str)))
  return download_list


def generate_hot_ones_youtube_interview_list():
  download_list = []
  return download_list


def generate_all_download_lists():
  download_list = []
  download_list.extend(generate_ryerson_download_list())
  download_list.extend(generate_hot_ones_youtube_interview_list())
  return download_list


def download_all_videos():
  download_list = generate_all_download_lists()
  for (url, download_path) in download_list:
    download_file(url, download_path)


# download videos from all sources
os.makedirs(RAW_FOLDER, exist_ok=True)
download_all_videos()
