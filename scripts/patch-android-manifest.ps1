# scripts/patch-android-manifest.ps1
# Script to patch AndroidManifest.xml for ORBI Clima IA v1.0.6A-FIX2

$manifestPath = "android/app/src/main/AndroidManifest.xml"

if (-not (Test-Path $manifestPath)) {
    Write-Error "AndroidManifest.xml not found at $manifestPath"
    exit 1
}

Write-Host "Patching AndroidManifest.xml at $manifestPath..." -ForegroundColor Cyan

# Read manifest content as XML
[xml]$xml = Get-Content $manifestPath

# 1. Ensure required permissions exist
$requiredPermissions = @(
    "android.permission.INTERNET",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.POST_NOTIFICATIONS"
)

# Find manifest node
$manifestNode = $xml.manifest

foreach ($permName in $requiredPermissions) {
    # Check if permission already exists
    $exists = $manifestNode.ChildNodes | Where-Object { 
        $_.Name -eq "uses-permission" -and $_.Attributes["android:name"].Value -eq $permName 
    }

    if (-not $exists) {
        Write-Host "Adding permission: $permName" -ForegroundColor Yellow
        $newPerm = $xml.CreateElement("uses-permission")
        $newPerm.SetAttribute("android:name", $permName)
        $manifestNode.AppendChild($newPerm) > $null
    } else {
        Write-Host "Permission already exists: $permName" -ForegroundColor Gray
    }
}

# 2. Ensure MainActivity has screenOrientation="portrait"
$activityNode = $xml.manifest.application.activity | Where-Object {
    $_.Attributes["android:name"].Value -eq ".MainActivity"
}

if ($activityNode) {
    Write-Host "Setting screenOrientation='portrait' on MainActivity" -ForegroundColor Yellow
    $activityNode.SetAttribute("android:screenOrientation", "portrait")
} else {
    Write-Warning "MainActivity node not found in AndroidManifest.xml"
}

# Save modified manifest XML back safely
$resolvedPath = (Resolve-Path $manifestPath).Path
$xml.Save($resolvedPath)
Write-Host "AndroidManifest.xml patched successfully!" -ForegroundColor Green
