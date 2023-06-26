import urllib.request, json 

root_url = 'https://ipfs.io/ipfs/QmSZaGTScaLwdg1j3L6FiuUxbBa3bMwbNJeme3phij9cbT'
output_file = 'cryptocoven_metadata.json'
num_nfts = 2
res = {}

for i in range(1, num_nfts + 1):
  download_url = root_url + '/' + str(i) + '.json'
  with urllib.request.urlopen(download_url) as url:
    data = json.loads(url.read().decode())
    res[i] = data

with open(output_file, 'w') as f:
  json.dump(res, f)