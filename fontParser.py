import re
import json

with open('04B_03__.bdf') as f:
    text = " ".join(line for line in f)  

try:
    found = re.findall('STARTCHAR(.*?)ENDCHAR', text, flags=re.S)
except AttributeError:
    found = '' 

characters = {}

for character in found:
    try:
        print("--------")
        charData = {}
        characterSplit = character.split("BITMAP")
        character = characterSplit[0].strip()
        character = [x.strip() for x in character.split('\n')]
        unicodeDecInt = int(character.pop(0), 16)
        charData['unicode'] = chr(unicodeDecInt)
        dwidth = int(character.pop(2).split(" ")[1])
        charData['dwidth'] = dwidth
        yOffset = int(character.pop(2).split(" ")[4])
        charData['yOffset'] = yOffset

        print(charData['unicode'])
        print(unicodeDecInt)

        bitmapData = characterSplit[1].strip()
        bitmapData = [x.strip() for x in bitmapData.split('\n')]
        charData['bitmap'] = []
        if yOffset < 0:
            for x in range(abs(yOffset)):
                binaryLineString = "".rjust(dwidth, '0')
                charData['bitmap'].append(binaryLineString)

        for line in bitmapData:
            if line != '':
                # some of these are too wide... those ones need to be divided by 16
                decNumber = int(line, 16)
                if dwidth < 6:
                    decNumber = int(decNumber / 16)
                
                binaryLineString = format(decNumber, "b").rjust(dwidth, '0')
                charData['bitmap'].append(binaryLineString)

        if yOffset > 0:
            for x in range(abs(yOffset)):
                binaryLineString = "".rjust(dwidth, '0')
                charData['bitmap'].append(binaryLineString)

        for pair in character:
            pair = pair.split(' ', 1)
            charData[pair[0]] = pair[1]

        print(charData)

        # characters.append(charData)
        characters[charData['unicode']] = charData
    except AttributeError:
        print("uh oh, problem with character")
        print(charData['unicode'])
        print(unicodeDecInt)

# print(characters)

with open('characterOutput.js', 'w') as fout:
    json.dump(characters, fout)

