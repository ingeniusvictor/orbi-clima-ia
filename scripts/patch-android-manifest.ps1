# scripts/patch-android-manifest.ps1
# Security hardening for ORBI Clima IA Android manifest.

$ErrorActionPreference = "Stop"
$manifestPath = "android/app/src/main/AndroidManifest.xml"
$androidNs = "http://schemas.android.com/apk/res/android"

if (-not (Test-Path $manifestPath)) {
    Write-Error "AndroidManifest.xml not found at $manifestPath"
    exit 1
}

Write-Host "Patching AndroidManifest.xml at $manifestPath..." -ForegroundColor Cyan

[xml]$xml = Get-Content $manifestPath
$manifestNode = $xml.manifest

# 1. Remove permissions that violate the ORBI Clima privacy/background policy.
# OC-11 uses a foreground-confirmed location snapshot + WorkManager. It must
# never request hidden/background GPS or run a permanent foreground service.
$forbiddenPermissions = @(
    "android.permission.ACCESS_BACKGROUND_LOCATION",
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.FOREGROUND_SERVICE_LOCATION"
)

$permissionNodes = @($manifestNode.ChildNodes | Where-Object { $_.Name -eq "uses-permission" })
foreach ($node in $permissionNodes) {
    $name = $node.GetAttribute("name", $androidNs)
    if ($forbiddenPermissions -contains $name) {
        Write-Host "Removing forbidden permission: $name" -ForegroundColor Yellow
        $manifestNode.RemoveChild($node) | Out-Null
    }
}

# 2. Ensure only the required foreground/network/notification permissions exist.
$requiredPermissions = @(
    "android.permission.INTERNET",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.POST_NOTIFICATIONS"
)

foreach ($permName in $requiredPermissions) {
    $exists = @($manifestNode.ChildNodes | Where-Object {
        $_.Name -eq "uses-permission" -and $_.GetAttribute("name", $androidNs) -eq $permName
    }).Count -gt 0

    if (-not $exists) {
        Write-Host "Adding permission: $permName" -ForegroundColor Yellow
        $newPerm = $xml.CreateElement("uses-permission")
        $newPerm.SetAttribute("name", $androidNs, $permName)
        $manifestNode.AppendChild($newPerm) | Out-Null
    } else {
        Write-Host "Permission already exists: $permName" -ForegroundColor Gray
    }
}

# 3. Ensure MainActivity remains portrait-only.
$activityNode = @($xml.manifest.application.activity | Where-Object {
    $_.GetAttribute("name", $androidNs) -eq ".MainActivity"
}) | Select-Object -First 1

if ($activityNode) {
    Write-Host "Setting screenOrientation='portrait' on MainActivity" -ForegroundColor Yellow
    $activityNode.SetAttribute("screenOrientation", $androidNs, "portrait")
} else {
    Write-Warning "MainActivity node not found in AndroidManifest.xml"
}

$resolvedPath = (Resolve-Path $manifestPath).Path
$xml.Save($resolvedPath)
Write-Host "AndroidManifest.xml hardened successfully." -ForegroundColor Green
