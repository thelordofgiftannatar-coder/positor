# Diario — Android

Android version of Diario (notes, diary, video studio, AI images), wrapped with Capacitor. Builds an installable APK on GitHub.

## Get the APK
GitHub: **Actions → Build Diario (Android APK) → Run workflow**, wait ~6 min, download **Diario-Android-APK**, unzip, send `Diario-debug.apk`
to the phone and open it (allow "install unknown apps").

## AI features
Open the app → **Settings → AI connection** → paste your Gemini key (free: https://aistudio.google.com/apikey). It stays on the phone.
Cloud sync needs a server URL (optional field in the same card); without one, use Export / Import.

## Uploading to GitHub (hidden files fix)
`.github` is a hidden folder and drag & drop skips it. After uploading, on GitHub click **Add file → Create new file**, name it
`.github/workflows/build-android.yml` (typing `/` makes folders), paste the content of `WORKFLOW-build-android.yml`, commit.

## Local build (optional)
```bash
npm install && npm run build && npx cap add android && bash scripts/android-patch.sh && npx cap sync android
cd android && ./gradlew assembleDebug
```
