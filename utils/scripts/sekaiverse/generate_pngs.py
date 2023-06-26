from PIL import Image
from project_finish_time import ProjectFinishTime
import json
import pathlib
import os

trait_list_path = '/Users/hongzi/Desktop/Sekaiverse/sekaiverse_trait_list.json'
image_input_folder = '/Users/hongzi/Desktop/Sekaiverse/img'
image_output_path = '/Users/hongzi/Desktop/Sekaiverse/output'
displayed_trait = 'Displayed_Traits'
undisplayed_trait = 'Undisplayed_Traits'
start_idx = 1


def read_img(img_path, resize=True, resize_width=2000, resize_height=2000):
  img = Image.open(img_path).convert('RGBA')
  if resize:
    img = img.resize((resize_width, resize_height))
  return img


def merge_imgs(imgs, output_path):
  # merge by putting one on top of each other
  prev_img = imgs[0]
  for i in range(1, len(imgs)):
    prev_img = Image.alpha_composite(prev_img, imgs[i])
  prev_img.save(output_path)


def separate_color(trait):
  words = trait.split()
  if words[-2] == 'Yellowish' or words[-2] == 'Light' or words[
      -2] == 'Reddish' or words[-2] == 'Turquoise':
    name = ' '.join(words[:-2])
    color = ' '.join(words[-2:])
  else:
    name = ' '.join(words[:-1])
    color = ' '.join(words[-1:])
  return name, color


def main():
  pathlib.Path(image_output_path).mkdir(parents=True, exist_ok=True)
  with open(trait_list_path, 'r') as f:
    trait_list = json.load(f)
  num_models = len(trait_list)

  time_estimator = ProjectFinishTime(total_steps=num_models, same_line=True)

  for i in range(start_idx, num_models + 1):
    traits = trait_list[str(i)]

    # parse traits
    species = traits[0]
    skin_color = traits[1]
    contour = traits[2]
    background = traits[3]
    back_accessories = traits[4]
    clothes = traits[5]
    necklace = traits[6]
    mouth = traits[7]
    eyes = traits[8]
    avatar_type = traits[9]
    eye_accessories = traits[10]
    earring = traits[11]
    hair = traits[12]
    special_accessories = traits[13]
    hand_accessories = traits[14]
    hand = traits[15]

    # image layers
    imgs = []

    # background
    bg_parse = background.split()
    bg_species = bg_parse[0]
    bg_rarity = bg_parse[-2]
    bg_prefix = 'Rare_' if bg_rarity == 'Rare' else ''
    if bg_species.endswith('s'):
      bg_species = bg_species[:-1]
    bg_str = bg_prefix + bg_species + '_Background'
    img = read_img(
        os.path.join(image_input_folder, displayed_trait, 'Background',
                     bg_species + '_Background', bg_str + '.png'))
    imgs.append(img)

    # back accessories
    back_folder = 'Accessories_carried_on_the_Back'
    if back_accessories == 'The Thousand-Armed Kannon (Black)':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, back_folder,
                       'The_Thousand-armed_Kannon',
                       'The_Thousand-armed_Kannon_Black.png'))
      imgs.append(img)
    elif back_accessories == 'The Thousand-Armed Kannon (Gold)':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, back_folder,
                       'The_Thousand-armed_Kannon',
                       'The_Thousand-armed_Kannon_Gold.png'))
      imgs.append(img)
    elif back_accessories == 'Wing (Black)':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, back_folder, 'Wing',
                       'Wing_Black.png'))
      imgs.append(img)
    elif back_accessories == 'Wing (White)':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, back_folder, 'Wing',
                       'Wing_White.png'))
      imgs.append(img)
    elif back_accessories != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, back_folder,
                       back_accessories.replace(' ', '_') + '.png'))
      imgs.append(img)

    # hair (tail)
    hair_name, _ = separate_color(hair)
    hair_tail_file = os.path.join(image_input_folder, displayed_trait, 'Head',
                                  hair_name.replace(' ', '_'),
                                  hair.replace(' ', '_') + '(tail).png')
    if os.path.exists(hair_tail_file):
      img = read_img(hair_tail_file)
      imgs.append(img)

    # hair (back)
    if not 'GM Original Hair' in hair:
      hair_name, _ = separate_color(hair)
      hair_back_file = os.path.join(image_input_folder, displayed_trait, 'Head',
                                    hair_name.replace(' ', '_'),
                                    hair.replace(' ', '_') + '(back).png')
      if os.path.exists(hair_back_file):
        img = read_img(hair_back_file)
        imgs.append(img)
    else:  # GM only
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Head',
                       'GM_Original_Hair(back).png'))
      imgs.append(img)

    # clothes (back)
    if species != 'GM':
      clothes_name, _ = separate_color(clothes)
      clothes_back_file = os.path.join(image_input_folder,
                                       displayed_trait, 'Clothes',
                                       clothes_name.replace(' ', '_'),
                                       clothes.replace(' ', '_') + '(back).png')
      if os.path.exists(clothes_back_file):
        img = read_img(clothes_back_file)
        imgs.append(img)
    else:  # GM only
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Game_Master', 'GM_Clothes(Back).png'))
      imgs.append(img)
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Game_Master', 'GM_Lightning(Back).png'))
      imgs.append(img)

    # body
    if species == 'Vampires':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Vampires', 'Vampires(Body).png'))
      imgs.append(img)
    elif species == 'Android':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Android', 'Android(Body).png'))
      imgs.append(img)
    elif species == 'Void':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species', 'Void',
                       'Void_Skin_Color(Body).png'))
      imgs.append(img)
    else:
      img = read_img(
          os.path.join(image_input_folder, undisplayed_trait, 'Default',
                       'skin_color',
                       skin_color.replace(' ', '').lower() + '_body.png'))
      imgs.append(img)

    # body type
    if avatar_type == 'Corpse':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Type',
                       'Corpse(body).png'))
      imgs.append(img)

    # body contour
    img = read_img(
        os.path.join(image_input_folder, undisplayed_trait, 'Default',
                     'contour_(body).png'))
    imgs.append(img)

    # neck
    if species == 'Vampires':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Vampires', 'Vampires(Neck).png'))
      imgs.append(img)
    elif species == 'Android':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Android', 'Android(Neck).png'))
      imgs.append(img)
    elif species == 'Void':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species', 'Void',
                       'Void_Skin_Color(Neck).png'))
      imgs.append(img)
    else:
      img = read_img(
          os.path.join(image_input_folder, undisplayed_trait, 'Default',
                       'skin_color',
                       skin_color.replace(' ', '').lower() + '_neck.png'))
      imgs.append(img)

    # neck contour
    img = read_img(
        os.path.join(image_input_folder, undisplayed_trait, 'Default',
                     'contour_(neck).png'))
    imgs.append(img)

    # necklace
    if necklace != 'None' and necklace != 'Pirate Necklace':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Necklace',
                       necklace.replace(' ', '_') + '.png'))
      imgs.append(img)

    # eye accessories (behind face)
    if eye_accessories == 'Monocle':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Eye_Accessories',
                       eye_accessories.replace(' ', '_') + '(Back).png'))
      imgs.append(img)

    # special accessories (under clothes)
    if special_accessories == "Delinquent's Tattoo":
      img = read_img(
          os.path.join(image_input_folder, displayed_trait,
                       'Special_Accessories',
                       special_accessories.replace(' ', '_') + '.png'))
      imgs.append(img)

    # clothes (front)
    if species != 'GM':
      clothes_name, _ = separate_color(clothes)
      clothes_file = os.path.join(image_input_folder, displayed_trait,
                                  'Clothes', clothes_name.replace(' ', '_'),
                                  clothes.replace(' ', '_') + '.png')
      clothes_front_file = os.path.join(
          image_input_folder, displayed_trait, 'Clothes',
          clothes_name.replace(' ', '_'),
          clothes.replace(' ', '_') + '(front).png')
      if os.path.exists(clothes_front_file):
        img = read_img(clothes_front_file)
        imgs.append(img)
      else:
        img = read_img(clothes_file)
        imgs.append(img)
    else:  # GM only
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Game_Master', 'GM_Clothes(Front).png'))
      imgs.append(img)
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Game_Master', 'GM_Lightning(Front).png'))
      imgs.append(img)

    # pirate necklace should be in the front
    if necklace == 'Pirate Necklace':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Necklace',
                       necklace.replace(' ', '_') + '.png'))
      imgs.append(img)

    # demi-human ear back
    if 'Demi-Humans' in species:
      demi, name = species.split()
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Demi-Humans', name + '_Demi-Human_Ear(Back).png'))
      imgs.append(img)

    # hair (side)
    if not 'GM Original Hair' in hair:
      hair_name, _ = separate_color(hair)
      hair_side_file = os.path.join(image_input_folder, displayed_trait, 'Head',
                                    hair_name.replace(' ', '_'),
                                    hair.replace(' ', '_') + '(side).png')
      if os.path.exists(hair_side_file):
        img = read_img(hair_side_file)
        imgs.append(img)
    elif "Flower Vendor" not in hair:  # GM only
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Head',
                       'GM_Original_Hair(side).png'))
      imgs.append(img)

    # face
    if species == 'Vampires':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Vampires', 'Vampires(Face).png'))
      imgs.append(img)
    elif species == 'Android':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Android', 'Android(Face).png'))
      imgs.append(img)
    elif species == 'Void':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species', 'Void',
                       'Void_Skin_Color(Face).png'))
      imgs.append(img)
    elif species != 'Elves':
      img = read_img(
          os.path.join(image_input_folder, undisplayed_trait, 'Default',
                       'skin_color',
                       skin_color.replace(' ', '').lower() + '_face.png'))
      imgs.append(img)

    # face contour
    if species == 'Elves':
      img = read_img(
          os.path.join(
              image_input_folder, displayed_trait, 'Species', 'Elves',
              'Elves-specific_contours', 'Elves-specific_contours(' +
              skin_color.replace(' ', '').lower() + ').png'))
      imgs.append(img)
    elif species != 'Vampires':  # vampires already have contours
      img = read_img(
          os.path.join(image_input_folder, undisplayed_trait, 'Default',
                       'contour_(face).png'))
      imgs.append(img)

    # flower vendor hair (side)
    if species != 'GM' and "Flower Vendor" in hair:
      hair_name, _ = separate_color(hair)
      hair_side_file = os.path.join(image_input_folder, displayed_trait, 'Head',
                                    hair_name.replace(' ', '_'),
                                    hair.replace(' ', '_') + '(side).png')
      if os.path.exists(hair_side_file):
        img = read_img(hair_side_file)
        imgs.append(img)

    # nose
    img = read_img(
        os.path.join(image_input_folder, undisplayed_trait, 'Default',
                     'nose.png'))
    imgs.append(img)

    # mouth
    if species != 'Vampires':  # vampires already have mouths
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Mouth',
                       mouth + '.png'))
      imgs.append(img)

    # eye
    if species == 'Elves':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species', 'Elves',
                       'Elves-specific_Eyes.png'))
      imgs.append(img)

    elif species == 'Void':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species', 'Void',
                       'Void-specific_Eyes',
                       'Void-specific_Eyes(' + eyes.split()[-1] + ').png'))
      imgs.append(img)
    elif species != 'Vampires':  # vampires already have eyes
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Eye',
                       eyes.replace(' ', '_') + '.png'))
      imgs.append(img)

    # type
    if avatar_type == 'Corpse':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Type',
                       'Corpse(face).png'))
      imgs.append(img)
    elif avatar_type != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Type',
                       avatar_type.replace(' ', '_') + '.png'))
      imgs.append(img)

    # special accessories (under hair)
    if special_accessories == 'The Third Eye' or \
       special_accessories == "Clown's Paint":
      img = read_img(
          os.path.join(image_input_folder, displayed_trait,
                       'Special_Accessories',
                       special_accessories.replace(' ', '_') + '.png'))
      imgs.append(img)

    # eye accessories
    if eye_accessories == 'Monocle':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Eye_Accessories',
                       eye_accessories.replace(' ', '_') + '(Front).png'))
      imgs.append(img)
    elif eye_accessories != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Eye_Accessories',
                       eye_accessories.replace(' ', '_') + '.png'))
      imgs.append(img)

    # earring
    if earring != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Earring',
                       earring.replace(' ', '_') + '.png'))
      imgs.append(img)

    # hair (front)
    if not 'GM Original Hair' in hair:
      hair_name, _ = separate_color(hair)
      hair_file = os.path.join(image_input_folder, displayed_trait, 'Head',
                               hair_name.replace(' ', '_'),
                               hair.replace(' ', '_') + '.png')
      hair_front_file = os.path.join(image_input_folder, displayed_trait,
                                     'Head', hair_name.replace(' ', '_'),
                                     hair.replace(' ', '_') + '(front).png')
      if os.path.exists(hair_front_file):
        img = read_img(hair_front_file)
        imgs.append(img)
      else:
        img = read_img(hair_file)
        imgs.append(img)
    else:  # GM only
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Head',
                       'GM_Original_Hair(face).png'))
      imgs.append(img)
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Head',
                       'GM_Original_Hair(front).png'))
      imgs.append(img)

    # demi-human ear front
    if 'Demi-Humans' in species:
      demi, name = species.split()
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Species',
                       'Demi-Humans', name + '_Demi-Human_Ear(Front).png'))
      imgs.append(img)

    # special accessories (above hair)
    if special_accessories != 'None' and \
      special_accessories != "Delinquent's Tattoo" and \
      special_accessories != 'The Third Eye' and \
      special_accessories != "Clown's Paint":
      apply_special_accessories = True
      if "Cat Ears' Headphone" in special_accessories:
        if 'Mushroom Cut' in hair:
          apply_special_accessories = True
        else:
          apply_special_accessories = False
      elif 'Cyber Fox Face' in special_accessories:
        if 'Center Part' in hair:
          apply_special_accessories = True
        else:
          apply_special_accessories = False
      elif special_accessories == 'Steampunk Goggles':
        if "Love's Hair" in hair:
          apply_special_accessories = True
        else:
          apply_special_accessories = False

      if apply_special_accessories:
        img = read_img(
            os.path.join(image_input_folder, displayed_trait,
                         'Special_Accessories',
                         special_accessories.replace(' ', '_') + '.png'))
        imgs.append(img)

    # hand (back)
    if 'Demi-Humans' in hand:
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Hand',
                       'Demi-Humans_Hand',
                       hand.replace(' ', '_') + '(Back).png'))
      imgs.append(img)
    elif 'Color' in hand:  # human
      img = read_img(
          os.path.join(
              image_input_folder, displayed_trait, 'Hand', 'Default_Hand',
              'Default_Hand_' + skin_color.replace(' ', '').lower() +
              '(Back).png'))
      imgs.append(img)
    elif hand != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Hand',
                       hand.replace(' ', '_') + '(Back).png'))
      imgs.append(img)

    # hand accessories
    if hand_accessories != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait,
                       'Accessories_hold_in_the_hand',
                       hand_accessories.replace(' ', '_') + '.png'))
      imgs.append(img)

    # hand (front)
    if 'Demi-Humans' in hand:
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Hand',
                       'Demi-Humans_Hand',
                       hand.replace(' ', '_') + '(Front).png'))
      imgs.append(img)
    elif 'Color' in hand:  # human
      img = read_img(
          os.path.join(
              image_input_folder, displayed_trait, 'Hand', 'Default_Hand',
              'Default_Hand_' + skin_color.replace(' ', '').lower() +
              '(Front).png'))
      imgs.append(img)
    elif hand != 'None':
      img = read_img(
          os.path.join(image_input_folder, displayed_trait, 'Hand',
                       hand.replace(' ', '_') + '(Front).png'))
      imgs.append(img)

    # save image
    output_path = os.path.join(image_output_path, str(i) + '.png')
    merge_imgs(imgs, output_path)

    # update progress
    time_estimator.update_progress(step=i + 1)


if __name__ == '__main__':
  main()
