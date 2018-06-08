REM Windows Batch file to run index.html in Chrome (32bit) with --allow-file-access-from-files command line argument

@echo off
start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "file:///%CD%/index.html" --allow-file-access-from-files