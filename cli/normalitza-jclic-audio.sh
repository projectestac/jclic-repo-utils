#!/bin/bash

# Count files in directory
numfiles=`ls -1q * | wc -l`
if [ ! $numfiles -eq 1 ]; then
  echo "Current directory should contain only one \".jclic.zip\" file."
  exit -1
fi

# Find jclic.zip file
pattern="*.jclic.zip"
zipfile=( $pattern )

if [ ! -f "$zipfile" ]; then
  echo "\"$zipfile\" does not exist"
  exit -1
fi

# Extract zip file contents
unzip -O UTF8 $zipfile

# Normalize MP3 files
mkdir -p ~/JClic/backup-audio/$zipfile
cp -a *.mp3 ~/JClic/backup-audio/$zipfile
mkdir norm
for file in *.mp3; do ffmpeg -i "$file" -af loudnorm=i=-12.0 -b:a 64K "norm/$file"; done
mv norm/*.mp3 .
rm -r norm

# Replace "Dialog" by "Arial"
sed -i "s/family=\"Dialog\"/family=\"Arial\"/g" *.jclic

# Rebuild zip file
rm $zipfile
zip $zipfile *

# delete all files but .jclic.zip
find . -type f ! -name '*.jclic.zip' -delete

