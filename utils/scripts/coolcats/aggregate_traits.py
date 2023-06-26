import argparse
import json
import os
import pathlib
import xlsxwriter

import sys

sys.path.append('../anata')
from project_finish_time import ProjectFinishTime

parser = argparse.ArgumentParser(description='download metadata')
parser.add_argument('--download_path',
                    type=str,
                    default='/Users/hongzi/Downloads/coolcats_metadata')
parser.add_argument('--output_path',
                    type=str,
                    default='/Users/hongzi/Downloads/coolcats_metadata')
parser.add_argument('--xlsx_name', type=str, default='traits.xlsx')
parser.add_argument('--image_source', type=str, default='image')
parser.add_argument('--start_idx', type=int, default=0)
parser.add_argument('--end_idx', type=int, default=9955)
conf = parser.parse_args()


def main():
  pathlib.Path(conf.output_path).mkdir(parents=True, exist_ok=True)

  proj_time = ProjectFinishTime(total_steps=conf.end_idx - conf.start_idx,
                                same_line=True)

  id_to_image = {}
  traits_to_id = {}

  print('Read all data ...')
  for i in range(conf.start_idx, conf.end_idx):
    metadata_path = os.path.join(conf.download_path, '{}.json'.format(i))
    with open(metadata_path, 'r') as f:
      data = json.load(f)
      for d in data['attributes']:
        t = d['trait_type']
        v = d['value']
        if t not in traits_to_id:
          traits_to_id[t] = {}
        if v not in traits_to_id[t]:
          traits_to_id[t][v] = []
        traits_to_id[t][v].append(i)
      id_to_image[i] = data[conf.image_source]
    proj_time.update_progress(i - conf.start_idx)

  print('Aggregate all data ...')
  workbook = xlsxwriter.Workbook(os.path.join(conf.output_path, conf.xlsx_name))
  worksheet = workbook.add_worksheet()

  row = 1
  for trait in traits_to_id:
    # ignore "body type" trait
    if trait == 'body':
      continue
    for (i, t) in enumerate(traits_to_id[trait]):
      trait_str = trait[0].upper() + '-' + str(i + 1) + ' ' + t
      iamge_url = id_to_image[traits_to_id[trait][t][0]]
      row += 1
      worksheet.write('A{}'.format(row), trait_str)
      worksheet.write('B{}'.format(row), '=IMAGE("{}")'.format(iamge_url))

  workbook.close()


if __name__ == '__main__':
  main()
