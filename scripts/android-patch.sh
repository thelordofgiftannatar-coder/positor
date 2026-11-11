#!/usr/bin/env bash
# Run after `npx cap add android`: adds mic permission + the Diario icon.
set -e
M=android/app/src/main/AndroidManifest.xml
for p in RECORD_AUDIO MODIFY_AUDIO_SETTINGS; do
  grep -q "$p" "$M" || sed -i "s#</manifest>#    <uses-permission android:name=\"android.permission.$p\" />\n</manifest>#" "$M"
done
RES=android/app/src/main/res
rm -rf "$RES"/mipmap-anydpi-v26
for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  mkdir -p "$RES/mipmap-$d"
  cp android-icons/mipmap-$d/*.png "$RES/mipmap-$d/"
done
echo "Android project patched."
