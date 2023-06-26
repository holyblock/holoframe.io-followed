import json
import math
import numpy as np

# ---- constants ----
seed = 42
num_models = 10000
trait_list_path = '/Users/hongzi/Desktop/Sekaiverse/sekaiverse_trait_list.json'

# ---- set global random seed ----
np.random.seed(seed)


# ---- utiles ----
def sample_trait(probs, traits):
  assert len(probs) == len(traits)
  assert math.isclose(sum(probs), 1)
  i = (np.cumsum(probs) > np.random.rand()).argmax()
  return traits[i]


# ---- species ----
def get_species():
  probs = [0.46, 0.2 / 3, 0.2 / 3, 0.2 / 3, 0.15, 0.1, 0.05, 0.03, 0.01]
  traits = [
      'Humans', 'Demi-Humans Drooping', 'Demi-Humans Rabbit',
      'Demi-Humans Triangular', 'Elves', 'Vampires', 'Android', 'Void', 'GM'
  ]
  return sample_trait(probs, traits)


# ---- species trait on/ff distribution ----
def get_on_off_list(num_on, total_num):
  lst = np.array([0] * total_num)
  lst[0:num_on] = 1
  np.random.shuffle(lst)
  return lst


def get_force_trait_lilst(species):
  if species == 'Humans':
    num_on = np.random.randint(1, 4)
    return get_on_off_list(num_on, 7)

  elif 'Demi-Humans' in species:
    num_on = np.random.randint(2, 5)
    return get_on_off_list(num_on, 7)

  elif species == 'Elves':
    num_on = np.random.randint(2, 6)
    return get_on_off_list(num_on, 7)

  elif species == 'Android':
    num_on = np.random.randint(3, 7)
    return get_on_off_list(num_on, 7)

  elif species == 'Void':
    num_on = np.random.randint(4, 7)
    return get_on_off_list(num_on, 7)

  elif species == 'Vampires':
    num_on = np.random.randint(5, 7)
    return get_on_off_list(num_on, 7)

  elif species == 'GM':
    num_on = np.random.randint(7, 8)
    return get_on_off_list(num_on, 7)


# ---- undisplayed default trait ----
def get_skin_color(species):
  if species == 'Vampires':
    return 'Vampires'
  elif species == 'Android':
    return 'Android'
  elif species == 'Void':
    return 'Void'
  else:
    probs = [0.25, 0.25, 0.25, 0.25]
    traits = ['Color 1', 'Color 2', 'Color 3', 'Color 4']
    return sample_trait(probs, traits)


def get_contour(species, skin_color):
  if species == 'Elves':
    return 'Elves Countour ' + skin_color
  else:
    return 'Contour'


# ---- background ----
def get_background(species):
  rarity = sample_trait([0.9, 0.1], ['Normal', 'Rare'])
  return species + ' ' + rarity + ' Background'


# ---- back accessories ----
def get_back_accessories(force_on):
  probs = [
      0.90001, 0.004545, 0.004545, 0.004545, 0.004545, 0.00909, 0.00909,
      0.00909, 0.00909, 0.00909, 0.00909, 0.00909, 0.00909, 0.00909
  ]
  traits = [
      'None', 'The Thousand-Armed Kannon (Black)',
      'The Thousand-Armed Kannon (Gold)', 'Wing (Black)', 'Wing (White)',
      'Cross', 'Floating Hands', 'Laser', 'Nine Tails', 'Ring', 'Robot Crow',
      'Robot Wing', 'Sickle', 'Surveillance Camera'
  ]
  trait = 'None'
  if not force_on:
    return trait
  else:
    while trait == 'None':
      trait = sample_trait(probs, traits)
    return trait


# ---- clothes ----
def get_clothes():
  probs = [
      0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3,
      0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3,
      0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3, 0.1 / 3,
      0.1 / 3, 0.1 / 3, 0.1 / 3, 0.025 / 3, 0.025 / 3, 0.025 / 3, 0.025 / 3,
      0.025 / 3, 0.025 / 3, 0.025 / 2, 0.025 / 2, 0.025 / 3, 0.025 / 3,
      0.025 / 3
  ]
  traits = [
      'Hoody Pink', 'Hoody Purple', 'Hoody Yellow', 'Sailor Suit Blue',
      'Sailor Suit Green', 'Sailor Suit Pink', 'Maid Uniform Blue',
      'Maid Uniform Red', 'Maid Uniform Yellow', 'Suit Blue', 'Suit Red',
      'Suit Yellow', 'Pirate Clothes Blue', 'Pirate Clothes Red',
      'Pirate Clothes Yellow', 'Kimono Red', 'Kimono Purple', 'Kimono Red',
      'Jirai Kei Light Blue', 'Jirai Kei Pink', 'Jirai Kei White',
      'Hakama Green', 'Hakama Purple', 'Hakama Yellow',
      'Japanese Armor Light Blue', 'Japanese Armor Pink',
      'Japanese Armor Yellowish Green', 'Folk Costume Light Blue',
      'Folk Costume Orange', 'Folk Costume Red', 'Skeleton Jacket Blue',
      'Skeleton Jacket Pink', 'Skeleton Jacket Red', 'Steampunk Clothes Pink',
      'Steampunk Clothes Yellow', 'Robot Combat Uniform Blue',
      'Robot Combat Uniform Purple', 'Robot Combat Uniform Red'
  ]
  return sample_trait(probs, traits)


# ---- necklace ----
def get_necklace(species, clothes, force_on):
  probs = [0.9, 0.1 / 7, 0.1 / 7, 0.1 / 7, 0.1 / 7, 0.1 / 7, 0.1 / 7, 0.1 / 7]
  traits = [
      'None', 'Board Necklace', 'Magic Stone Necklace', 'Choker',
      'Steampunk Necklace', 'SEKAI Necklace', 'Pirate Necklace', 'Moon Choker'
  ]
  trait = 'None'
  if not force_on:
    return trait
  else:
    while trait == 'None':
      trait = sample_trait(probs, traits)
      if (species == 'GM' or 'Hoody' in clothes or 'Suit' in clothes or
          'Jirai' in clothes or 'Japanese Armor' in clothes or
          'Folk Costume' in clothes or 'Skeleton' in clothes or
          'Robot Combat' in clothes) and trait == 'Pirate Necklace':
        trait = 'None'
    return trait


# ---- mouth ----
def get_mouth():
  probs = [0.25, 0.25, 0.25, 0.25]
  traits = ['Smile', 'Cool', 'Grined', 'Jagged']
  return sample_trait(probs, traits)


# ---- eyes ----
def get_eyes(species):
  if species == 'Elves':
    return 'Elves Eyes'
  elif species == 'Vampire':
    return 'Vampire Eyes'
  elif species == 'Void':
    return sample_trait([1 / 3, 1 / 3, 1 / 3],
                        ['Void Eyes 1', 'Void Eyes 2', 'Void Eyes 3'])
  else:
    t = 0.6 + 0.12
    n_p = 0.6 / 14 / t
    c_n_p = 0.12 / 5 / t
    h_p = 0.12 / 5 / 2 / t
    probs = [
        n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p, n_p,
        c_n_p, c_n_p, c_n_p, c_n_p, h_p, h_p
    ]
    traits = [
        'Surprised Eyes Black', 'Surprised Eyes Yellowish Green',
        'Scornful Eyes Gray', 'Scornful Eyes Purple', 'Basic Eyes X Blue',
        'Basic Eyes X Emerald Green', 'Gallant Eyes Green', 'Gallant Eyes Red',
        'Precocious Eyes Blue', 'Precocious Eyes Gray', 'Basic Eyes Y Brown',
        'Basic Eyes Y Red', 'Sexy Eyes Light Blue', 'Sexy Eyes Pink',
        'Bitcoin Eyes', 'Ethereum Eyes', 'ASTAR Eyes', 'Freedom Eyes',
        'Heart Eyes Black', 'Heart Eyes Pink'
    ]
    return sample_trait(probs, traits)


# ---- type ----
def get_type(force_on):
  probs = [0.9, 0.025, 0.025, 0.025, 0.025]
  traits = [
      'None', 'Bruises', 'Corpse', "Death's Aura", 'Emotional Instability'
  ]
  trait = 'None'
  if not force_on:
    return trait
  else:
    while trait == 'None':
      trait = sample_trait(probs, traits)
    return trait


# ---- eye accessories ----
def get_eye_accessories(force_on):
  a = 0.2 / 14
  probs = [0.8, a, a, a, a, a, a, a, a, a * 2, a, a, a * 2]
  traits = [
      'None', 'One-Eyed Headset Blue', 'One-Eyed Headset Red',
      'Pirate Sunglasses Light Blue', 'Pirate Sunglasses Red',
      "Ghost's Eye Bandage Purple", "Ghost's Eye Bandage Red",
      'Cyber Eye Bandage Gold', 'Cyber Eye Bandage Silver', 'Monocle',
      'Cursed Blindfold Black', 'Cursed Blindfold White', 'Sunglasses'
  ]
  trait = 'None'
  if not force_on:
    return trait
  else:
    while trait == 'None':
      trait = sample_trait(probs, traits)
    return trait


# ---- earring ----
def get_earring(force_on):
  probs = [0.9, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
  traits = [
      'None', 'SEKAI Logo Earring', 'Glowing Earring', 'Kanji Earring',
      'Lightning Earring', 'Board Earring', 'Receiver', 'Feather Earring',
      'Pirate Earring 1', 'Pirate Earring 2', 'Moon Earring'
  ]
  trait = 'None'
  if not force_on:
    return trait
  else:
    while trait == 'None':
      trait = sample_trait(probs, traits)
    return trait


# ---- hair ----
def get_hair(species):
  probs = [
      0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
      0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.003, 0.01, 0.01, 0.014333333333,
      0.014333333333, 0.014333333333, 0.014333333333, 0.014333333333,
      0.014333333333, 0.014333333333, 0.014333333333, 0.014333333333,
      0.014333333333, 0.014333333333, 0.014333333333, 0.014333333333,
      0.014333333333, 0.014333333333, 0.01075, 0.01075, 0.01075, 0.01075,
      0.01075, 0.01075, 0.01075, 0.01075, 0.014333333333, 0.014333333333,
      0.014333333333, 0.0066, 0.0066, 0.0066, 0.0066, 0.0066
  ]
  traits = [
      'Mushroom Cut Ash', 'Mushroom Cut Black', 'Mushroom Cut Brown',
      'Mushroom Cut Gold', 'Mushroom Cut Red', 'Mushroom Cut White',
      'Bang Up Blue', 'Bang Up Red', 'Bang Up White', 'Center Part Blue',
      'Center Part Pink', 'Center Part Yellow', 'Short Bob Cut Black',
      'Short Bob Cut Green', 'Short Bob Cut Pink', 'Ponytail Black',
      'Ponytail Brown', 'Ponytail White', 'GM Original Hair',
      'Full Face Mask A', 'Full Face Mask B', 'Cursed Hair Reddish Brown',
      'Cursed Hair Turquoise Blue', 'Cursed Hair Yellow', "Pilot's Hair Ash",
      "Pilot's Hair Green", "Pilot's Hair Red", "Wife's Hair Blue",
      "Wife's Hair Red", "Wife's Hair White", "Death's Hair Blue",
      "Death's Hair Green", "Death's Hair White", "Cyborg's Hair Gold",
      "Cyborg's Hair Green", "Cyborg's Hair Orange",
      "Flower Vendor's Hair Black", "Flower Vendor's Hair Blue",
      "Flower Vendor's Hair Gold", "Flower Vendor's Hair Pink",
      "Hero's Hair Black", "Hero's Hair Blue", "Hero's Hair Purple",
      "Hero's Hair Yellow", "Love's Hair Light Blue", "Love's Hair Pink",
      "Love's Hair Yellow", "Pumpkin's Hair Blue", "Pumpkin's Hair Green",
      "Pumpkin's Hair Purple", "Pumpkin's Hair Red", "Pumpkin's Hair Yellow"
  ]
  hair = sample_trait(probs, traits)
  # demi rabbit, triangular dont' vibe well with pilot's hair
  while ('Rabbit' in species or 'Triangular' in species) and 'Pilot' in hair:
    hair = sample_trait(probs, traits)
  # non GM shouldn't use GM hair
  while species != 'GM' and hair == 'GM Original Hair':
    hair = sample_trait(probs, traits)
  return hair


# ---- special accessories ----
def get_special_accessories(mouth, hair, force_on):
  a = 0.1 / 9
  probs = [0.9, a, a, a / 2, a / 2, a, a, a, a, a / 2, a / 2, a]
  traits = [
      'None', 'Pirate Hat', "Sniper's Beard", "Cat Ears' Headphone Green",
      "Cat Ears' Headphone Pink", "Delinquent's Tattoo", 'The Third Eye',
      "Clown's Paint", "Hit Man's Knife", 'Cyber Fox Face Black',
      'Cyber Fox Face White', 'Steampunk Goggles'
  ]
  output = 'None'
  if force_on:
    while output == 'None':
      output = sample_trait(probs, traits)

  # hitman's knife should always go with jagged teeth
  if output == "Hit Man's Knife" and mouth != 'Jagged':
    output = 'None'

  # cat ear headphone only goes with mushroom cut
  if "Cat Ears' Headphone" in output and not 'Mushroom Cut' in hair:
    output = 'None'

  # cyber fox face ony goes with center part
  if 'Cyber Fox Face' in output and not 'Center Part' in hair:
    output = 'None'

  # steampunk goggles only goes with love's hair
  if output == 'Steampunk Goggles' and not "Love's Hair" in hair:
    output = 'None'

  return output


# ---- hand accessories ----
def get_hand_accessories(force_on):
  probs = [0.7, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03]
  traits = [
      'None', 'Apple', 'Dollar Bill', 'Green Heart', 'Vaccum Flask', 'Mask',
      'Yin Yang Diagram', 'Iron ball', "Rubik's Cube", 'Flame', 'Globe'
  ]
  trait = 'None'
  if not force_on:
    return trait
  else:
    while trait == 'None':
      trait = sample_trait(probs, traits)
    return trait


# ---- hand ----
def get_hand(hand_accessories, species, skin_color):
  if hand_accessories == 'None':
    return 'None'
  elif species == 'Demi-Humans Drooping':
    return 'Demi-Humans Hand Drooping'
  elif species == 'Demi-Humans Rabbit':
    return 'Demi-Humans Hand Rabbit'
  elif species == 'Demi-Humans Triangular':
    return 'Demi-Humans Hand Triangular'
  elif species == 'Vampires':
    return 'Vampires Hand'
  elif species == 'Android':
    return 'Android Hand'
  elif species == 'Void':
    return 'Void Hand'
  elif species == 'GM':
    return 'GM Hand'
  else:  # humans and elves
    return skin_color + ' Hand'


# ---- assemble trait list ----
def main():
  trait_list = {}
  for i in range(1, num_models + 1):
    species = get_species()
    force_on_list = get_force_trait_lilst(species)
    skin_color = get_skin_color(species)
    contour = get_contour(species, skin_color)
    background = get_background(species)
    back_accessories = get_back_accessories(force_on_list[0])
    clothes = get_clothes()
    necklace = get_necklace(species, clothes, force_on_list[1])
    mouth = get_mouth()
    eyes = get_eyes(species)
    avatar_type = get_type(force_on_list[2])
    eye_accessories = get_eye_accessories(force_on_list[3])
    earring = get_earring(force_on_list[4])
    hair = get_hair(species)
    special_accessories = get_special_accessories(mouth, hair, force_on_list[5])
    hand_accessories = get_hand_accessories(force_on_list[6])
    hand = get_hand(hand_accessories, species, skin_color)

    traits = [
        species, skin_color, contour, background, back_accessories, clothes,
        necklace, mouth, eyes, avatar_type, eye_accessories, earring, hair,
        special_accessories, hand_accessories, hand
    ]
    trait_list[i] = traits

  with open(trait_list_path, 'w') as f:
    json.dump(trait_list, f, indent=2, sort_keys=True)


# ---- main entry ----
if __name__ == '__main__':
  main()
