import os

HASH_FILE_PATH = '/Users/hongzi/Downloads/MIL.txt'
RENAME_FILE_PATH = '/Users/hongzi/Downloads/MiladyModels/'
POST_FIX = '.zip'
NFT_COUNT = 10006

with open(HASH_FILE_PATH, 'r') as f:
  hash_string = f.readline()

hashes = hash_string.split(',')
for i in range(NFT_COUNT):
  src_path = os.path.join(RENAME_FILE_PATH, str(i) + POST_FIX)
  dst_path = os.path.join(RENAME_FILE_PATH, hashes[i] + POST_FIX)
  if os.path.exists(src_path):
    os.rename(src_path, dst_path)
  print('{} out of {}'.format(i + 1, NFT_COUNT), end='\r')
