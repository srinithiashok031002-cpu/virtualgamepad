@echo off
echo === VGP TV Companion Builder ===
echo.

REM Check for gradle wrapper jar; if absent, generate it via system Gradle
if not exist "gradle\wrapper\gradle-wrapper.jar" (
    echo Generating Gradle wrapper...
    gradle wrapper --gradle-version=8.4
    if errorlevel 1 (
        echo ERROR: Could not generate Gradle wrapper.
        echo Please install Gradle from https://gradle.org/install/ or run:
        echo   gradle wrapper --gradle-version=8.4
        pause
        exit /b 1
    )
)

echo Building debug APK...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo BUILD FAILED.
    pause
    exit /b 1
)

echo.
echo === Build Successful! ===
echo APK is at: app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on your Android TV (USB debug enabled):
echo   adb connect YOUR_TV_IP
echo   adb install app\build\outputs\apk\debug\app-debug.apk
echo.
pause
