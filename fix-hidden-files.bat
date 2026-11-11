@echo off
REM Recreates the hidden items (.github\workflows and .gitignore) from the visible copies.
mkdir ".github\workflows" 2>nul
copy /Y "WORKFLOW-build-android.yml" ".github\workflows\build-android.yml" >nul
copy /Y "gitignore-copy.txt" ".gitignore" >nul
echo Done. Hidden files restored.
pause
