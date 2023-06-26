import os
from pyairtable import Table
import urllib.request

output_path = './output/'
api_key = os.environ["AIRTABLE_API_KEY"]
base_id = 'appcCWzgZj2kgVUiT'
table_id = 'tbl4f5XSnV7xJR8gB'

table = Table(api_key, base_id, table_id)
table_data = table.all(sort=['attribute', 'fullName'])

psd_map = {}
for record in table_data:
  fullName = record['fields']['fullName']
  attribute = record['fields']['attribute']
  name = record['fields']['name']
  color = record['fields'].get('color', '')
  image = record['fields']['image']

  if attribute not in psd_map:
    psd_map[attribute] = {}

  try:
    psd_map[attribute][name].append(image)
  except KeyError:
    psd_map[attribute][name] = [image]

for attribute in psd_map:
  attribute_dir_name = output_path + attribute
  os.mkdir(attribute_dir_name)
  for name in psd_map[attribute]:
    name_dir_name = attribute_dir_name + '/' + name
    os.mkdir(name_dir_name)
    images = psd_map[attribute][name]
    for image in images:
      url = image[0]['url']
      filename = image[0]['filename']
      image_dir_name = name_dir_name + '/' + filename
      urllib.request.urlretrieve(url, image_dir_name)