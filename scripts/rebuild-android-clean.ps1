# scripts/rebuild-android-clean.ps1
# Clean rebuild script for ORBI Clima IA - 100% ASCII Safe

$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host "     ORBI CLIMA IA - REBUILD ANDROID CLEAN"
Write-Host "=========================================================="

# 1. Back up custom widgets and resources from existing android if they exist
$hasWidgets = Test-Path "android/app/src/main/java/com/orbi/clima/widget"
if ($hasWidgets) {
    Write-Host "Backing up custom widgets and resources..."
    if (Test-Path "android_backup_temp") {
        Remove-Item -Recurse -Force "android_backup_temp"
    }
    New-Item -ItemType Directory -Path "android_backup_temp/java" -Force
    New-Item -ItemType Directory -Path "android_backup_temp/res/drawable" -Force
    New-Item -ItemType Directory -Path "android_backup_temp/res/layout" -Force
    New-Item -ItemType Directory -Path "android_backup_temp/res/xml" -Force
    New-Item -ItemType Directory -Path "android_backup_temp/res/values" -Force

    Copy-Item -Recurse -Force "android/app/src/main/java/com/orbi/clima/widget" "android_backup_temp/java"
    Copy-Item -Force "android/app/src/main/res/drawable/orbi_widget_*.xml" "android_backup_temp/res/drawable"
    
    if (Test-Path "android/app/src/main/res/layout") {
        Copy-Item -Force "android/app/src/main/res/layout/orbi_*.xml" "android_backup_temp/res/layout"
    }
    
    Copy-Item -Force "android/app/src/main/res/xml/orbi_skyorb_widget_info.xml" "android_backup_temp/res/xml"
    Copy-Item -Force "android/app/src/main/res/values/*.xml" "android_backup_temp/res/values"
    Copy-Item -Force "android/app/build.gradle" "android_backup_temp"
}

# 2. Delete existing android directory
if (Test-Path "android") {
    Write-Host "Wiping existing android directory..."
    Remove-Item -Recurse -Force "android"
}

# 3. Build Web Assets
Write-Host "Compiling web assets..."
npm run build

# 4. Add Android Platform
Write-Host "Generating fresh Android Capacitor project..."
npx cap add android

# 5. Restore custom widgets and resources from backup
if ($hasWidgets -and (Test-Path "android_backup_temp")) {
    Write-Host "Restoring custom widgets and resources from backup..."
    
    # Ensure all target resource directories exist
    New-Item -ItemType Directory -Path "android/app/src/main/java/com/orbi/clima" -Force
    New-Item -ItemType Directory -Path "android/app/src/main/res/drawable" -Force
    New-Item -ItemType Directory -Path "android/app/src/main/res/layout" -Force
    New-Item -ItemType Directory -Path "android/app/src/main/res/xml" -Force
    New-Item -ItemType Directory -Path "android/app/src/main/res/values" -Force
    
    Copy-Item -Recurse -Force "android_backup_temp/java/widget" "android/app/src/main/java/com/orbi/clima"
    Copy-Item -Force "android_backup_temp/res/drawable/orbi_widget_*.xml" "android/app/src/main/res/drawable"
    
    if (Test-Path "android_backup_temp/res/layout") {
        Copy-Item -Force "android_backup_temp/res/layout/orbi_*.xml" "android/app/src/main/res/layout"
    }
    
    Copy-Item -Force "android_backup_temp/res/xml/orbi_skyorb_widget_info.xml" "android/app/src/main/res/xml"
    Copy-Item -Force "android_backup_temp/res/values/*.xml" "android/app/src/main/res/values"
    Copy-Item -Force "android_backup_temp/build.gradle" "android/app/build.gradle"
    Remove-Item -Recurse -Force "android_backup_temp"
}

# 6. Create local.properties
Write-Host "Configuring local.properties with Android SDK Path..."
$localPropertiesPath = "android/local.properties"
Set-Content -Path $localPropertiesPath -Value "sdk.dir=C:/Users/ingvm.SPEEDFORCE/AppData/Local/Android/Sdk" -Force
Write-Host "Created $localPropertiesPath"

# 7. Write clean AndroidManifest.xml
Write-Host "Writing clean AndroidManifest.xml..."
$manifestContent = @'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.orbi.clima">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:label="ORBI Clima IA"
        android:supportsRtl="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@android:style/Theme.NoTitleBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- ORBI SkyOrb AppWidget Registration -->
        <receiver
            android:name=".widget.OrbiSkyOrbWidgetReceiver"
            android:exported="true"
            android:label="@string/orbi_skyorb_widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>

            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/orbi_skyorb_widget_info" />
        </receiver>

    </application>
</manifest>
'@

Set-Content -Path "android/app/src/main/AndroidManifest.xml" -Value $manifestContent -Force
Write-Host "AndroidManifest.xml updated successfully."

# 8. Sync Capacitor
Write-Host "Syncing Capacitor project..."
npx cap sync android

# 9. Verify and Set versionCode / versionName
Write-Host "Assuring versionCode and versionName..."
$buildGradlePath = "android/app/build.gradle"
if (Test-Path $buildGradlePath) {
    $gradleContent = Get-Content -Path $buildGradlePath -Raw
    $gradleContent = $gradleContent -replace "versionCode \d+", "versionCode 10602"
    $gradleContent = $gradleContent -replace 'versionName "[^"]+"', 'versionName "1.0.6-final-clean"'
    Set-Content -Path $buildGradlePath -Value $gradleContent -Force
    Write-Host "build.gradle version set successfully."
}

# 10. Compile APK using gradlew.bat
Write-Host "Compiling Android Debug APK..."
if (Test-Path "android/gradlew.bat") {
    Push-Location "android"
    try {
        cmd.exe /c "gradlew.bat assembleDebug"
        Write-Host "=========================================================="
        Write-Host "BUILD SUCCESSFUL!"
        Write-Host "APK path: android\app\build\outputs\apk\debug\app-debug.apk"
        Write-Host "=========================================================="
    } catch {
        Write-Error "Failed to compile Android APK: $_"
    } finally {
        Pop-Location
    }
} else {
    Write-Error "gradlew.bat not found in android folder."
}
