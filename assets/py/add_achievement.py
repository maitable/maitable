import pandas as pd
achievements = pd.read_csv('achievements')
name = input('What is the name of the achievement')
description = input('What is a description of it')
link = ''

achievement_slug = name.lower()
ach_dict  = {
    'name' : name,
    'description' : description,
    'link' : link
}
achievements[achievement_slug] = ach_dict

achievements.to_json('../json/achiev.json')