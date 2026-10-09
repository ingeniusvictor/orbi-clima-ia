# scripts/rebuild-android-clean.ps1
# Clean rebuild script for ORBI Clima IA - 100% ASCII Safe

$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host "     ORBI CLIMA IA - REBUILD ANDROID CLEAN"
Write-Host "=========================================================="

$backupRoot = "android_backup_temp"
$nativePackagePath = "android/app/src/main/java/com/orbi/clima"
$resRoot = "android/app/src/main/res"
$hasNativeCustomizations = Test-Path $nativePackagePath

function Copy-MatchingFiles {
    param(
        [string]$SourcePattern,
        [string]$Destination
    )

    $files = Get-ChildItem -Path $SourcePattern -File -ErrorAction SilentlyContinue
    if ($files) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
        foreach ($file in $files) {
            Copy-Item -Force $file.FullName $Destination
        }
    }
}

# 1. Back up every tracked ORBI native customization before Capacitor regenerates Android.
if ($hasNativeCustomizations) {
    Write-Host "Backing up ORBI native bridges, widgets, background watch and resources..."
    if (Test-Path $backupRoot) {
        Remove-Item -Recurse -Force $backupRoot
    }

    New-Item -ItemType Directory -Path "$backupRoot/java" -Force | Out-Null
    Copy-Item -Recurse -Force $nativePackagePath "$backupRoot/java/clima"

    Copy-MatchingFiles "$resRoot/drawable/orbi_widget_*.xml" "$backupRoot/res/drawable"
    Copy-MatchingFiles "$resRoot/drawable/ic_stat_orbi_alert.xml" "$backupRoot/res/drawable"
    Copy-MatchingFiles "$resRoot/layout/orbi_*.xml" "$backupRoot/res/layout"
    Copy-MatchingFiles "$resRoot/xml/orbi_*_widget_info.xml" "$backupRoot/res/xml"
    Copy-MatchingFiles "$resRoot/values/*.xml" "$backupRoot/res/values"

    if (Test-Path "android/app/build.gradle") {
        Copy-Item -Force "android/app/build.gradle" "$backupRoot/build.gradle"
    }
}

# 2. Delete existing Android directory.
if (Test-Path "android") {
    Write-Host "Wiping existing android directory..."
    Remove-Item -Recurse -Force "android"
}

# 3. Build web assets.
Write-Host "Compiling web assets..."
npm run build

# 4. Generate a fresh Capacitor Android project.
Write-Host "Generating fresh Android Capacitor project..."
npx cap add android

# 5. Restore all ORBI native customizations.
if ($hasNativeCustomizations -and (Test-Path $backupRoot)) {
    Write-Host "Restoring ORBI native bridges, widgets, background watch and resources..."

    New-Item -ItemType Directory -Path "android/app/src/main/java/com/orbi" -Force | Out-Null
    if (Test-Path "android/app/src/main/java/com/orbi/clima") {
        Remove-Item -Recurse -Force "android/app/src/main/java/com/orbi/clima"
    }
    Copy-Item -Recurse -Force "$backupRoot/java/clima" "android/app/src/main/java/com/orbi/clima"

    foreach ($folder in @("drawable", "layout", "xml", "values")) {
        $sourceFolder = "$backupRoot/res/$folder"
        if (Test-Path $sourceFolder) {
            New-Item -ItemType Directory -Path "android/app/src/main/res/$folder" -Force | Out-Null
            Copy-Item -Force "$sourceFolder/*" "android/app/src/main/res/$folder"
        }
    }

    if (Test-Path "$backupRoot/build.gradle") {
        Copy-Item -Force "$backupRoot/build.gradle" "android/app/build.gradle"
    }
}

# 6. Configure local.properties.
Write-Host "Configuring local.properties with Android SDK Path..."
$localPropertiesPath = "android/local.properties"
Set-Content -Path $localPropertiesPath -Value "sdk.dir=C:/Users/ingvm.SPEEDFORCE/AppData/Local/Android/Sdk" -Force
Write-Host "Created $localPropertiesPath"

# 7. Write the canonical manifest. WorkManager needs no custom service declaration.
# Privacy invariant: foreground location only; never add ACCESS_BACKGROUND_LOCATION
# or permanent foreground-service permissions here.
Write-Host "Writing canonical AndroidManifest.xml..."
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

        <receiver
            android:name=".widget.OrbiSkyOrbMiniWidgetReceiver"
            android:exported="true"
            android:label="@string/orbi_skyorb_mini_widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/orbi_skyorb_mini_widget_info" />
        </receiver>

        <receiver
            android:name=".widget.OrbiSkyOrbPanelWidgetReceiver"
            android:exported="true"
            android:label="@string/orbi_skyorb_panel_widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/orbi_skyorb_panel_widget_info" />
        </receiver>

        <receiver
            android:name=".widget.OrbiSkyOrbCommandWidgetReceiver"
            android:exported="true"
            android:label="@string/orbi_skyorb_command_widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/orbi_skyorb_command_widget_info" />
        </receiver>

        <receiver
            android:name=".widget.OrbiSkyOrbCommandPremiumWidgetReceiver"
            android:exported="true"
            android:label="@string/orbi_skyorb_command_premium_widget_name">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/orbi_skyorb_command_premium_widget_info" />
        </receiver>

    </application>
</manifest>
'@

Set-Content -Path "android/app/src/main/AndroidManifest.xml" -Value $manifestContent -Force
Write-Host "AndroidManifest.xml updated successfully."

# 8. Sync Capacitor. This regenerates capacitor.build.gradle with official plugin dependencies.
Write-Host "Syncing Capacitor project..."
npx cap sync android

# Re-assert the tracked custom MainActivity after Capacitor sync if needed.
if (Test-Path "$backupRoot/java/clima/MainActivity.java") {
    Copy-Item -Force "$backupRoot/java/clima/MainActivity.java" "android/app/src/main/java/com/orbi/clima/MainActivity.java"
}

# 9. Verify and set versionCode / versionName.
Write-Host "Assuring versionCode and versionName..."
$buildGradlePath = "android/app/build.gradle"
if (Test-Path $buildGradlePath) {
    $gradleContent = Get-Content -Path $buildGradlePath -Raw
    $gradleContent = $gradleContent -replace "versionCode \d+", "versionCode 10602"
    $gradleContent = $gradleContent -replace 'versionName "[^"]+"', 'versionName "1.0.6-final-clean"'
    Set-Content -Path $buildGradlePath -Value $gradleContent -Force
    Write-Host "build.gradle version set successfully."
}

# 10. Run source invariants before Gradle.
Write-Host "Running ORBI Android source verification..."
node scripts/verify-android-background-watch.mjs

# Backup is no longer needed once source verification passes.
if (Test-Path $backupRoot) {
    Remove-Item -Recurse -Force $backupRoot
}

# 11. Compile Android Debug APK using the freshly generated Gradle wrapper.
Write-Host "Compiling Android Debug APK..."
if (Test-Path "android/gradlew.bat") {
    Push-Location "android"
    try {
        cmd.exe /c "gradlew.bat assembleDebug"
        if ($LASTEXITCODE -ne 0) {
            throw "Gradle assembleDebug failed with exit code $LASTEXITCODE"
        }
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
