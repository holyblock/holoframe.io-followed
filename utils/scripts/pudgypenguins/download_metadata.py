import argparse
import os
import pathlib
import time
import wget

import sys

sys.path.append('../anata')
from project_finish_time import ProjectFinishTime

parser = argparse.ArgumentParser(description='download metadata')
parser.add_argument('--download_path',
                    type=str,
                    default='/Users/hongzi/Downloads/penguins_metadata')
parser.add_argument(
    '--metadata_uri',
    type=str,
    default=
    'https://ipfs.io/ipfs/QmWXJXRdExse2YHRY21Wvh4pjRxNRQcWVhcKw4DLVnqGqs/')
parser.add_argument('--start_idx', type=int, default=0)
parser.add_argument('--end_idx', type=int, default=8887)
parser.add_argument('--sleep_time', type=float, default=1)
conf = parser.parse_args()


def main():
  pathlib.Path(conf.download_path).mkdir(parents=True, exist_ok=True)

  proj_time = ProjectFinishTime(total_steps=conf.end_idx - conf.start_idx,
                                same_line=True)

  for i in range(conf.start_idx, conf.end_idx):
    output_path = os.path.join(conf.download_path, '{}.json'.format(i))
    url = conf.metadata_uri + str(i)
    wget.download(url, out=output_path)
    proj_time.update_progress(i - conf.start_idx)
    time.sleep(conf.sleep_time)


if __name__ == '__main__':
  main()
