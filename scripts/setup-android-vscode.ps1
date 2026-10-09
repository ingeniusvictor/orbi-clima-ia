# ORBI Clima IA - VS Code Android Build Hardening Setup
# Script para automatizar la configuración y compilación de Android en entorno local

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ORBI CLIMA IA - CONFIGURACIÓN ANDROID PARA VS CODE     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Configurar ANDROID_HOME
$localAppData = [System.Environment]::GetFolderPath('LocalApplicationData')
$defaultSdkPath = Join-Path $localAppData "Android\Sdk"

if (Test-Path $defaultSdkPath) {
    $env:ANDROID_HOME = $defaultSdkPath
    Write-Host "[✓] ANDROID_HOME configurado en: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "[!] Advertencia: No se encontró el SDK en la ruta por defecto: $defaultSdkPath" -ForegroundColor Yellow
    $userInputSdk = Read-Host "Ingresa la ruta de tu Android SDK (deja en blanco para usar la de por defecto)"
    if ($userInputSdk) {
        $env:ANDROID_HOME = $userInputSdk
    } else {
        $env:ANDROID_HOME = $defaultSdkPath
    }
}

# 2. Configurar JAVA_HOME (Android Studio JBR o JDK preinstalado)
$programFiles = [System.Environment]::GetFolderPath('ProgramFiles')
$studioJbrPath = Join-Path $programFiles "Android\Android Studio\jbr"
$legacyStudioJrePath = Join-Path $programFiles "Android\Android Studio\jre"

if (Test-Path $studioJbrPath) {
    $env:JAVA_HOME = $studioJbrPath
    Write-Host "[✓] JAVA_HOME configurado desde Android Studio: $env:JAVA_HOME" -ForegroundColor Green
} elseif (Test-Path $legacyStudioJrePath) {
    $env:JAVA_HOME = $legacyStudioJrePath
    Write-Host "[✓] JAVA_HOME configurado desde Android Studio (JRE): $env:JAVA_HOME" -ForegroundColor Green
} else {
    # Buscar variable del sistema actual
    if ($env:JAVA_HOME) {
        Write-Host "[✓] Usando JAVA_HOME definido en el sistema: $env:JAVA_HOME" -ForegroundColor Green
    } else {
        Write-Host "[!] No se detectó JAVA_HOME. Se asume que JDK está en el PATH de Windows o configurado globalmente." -ForegroundColor Yellow
    }
}

# 3. Generar android/local.properties
$androidDir = Join-Path $PSScriptRoot "..\android"
$localPropertiesPath = Join-Path $androidDir "local.properties"

if (!(Test-Path $androidDir)) {
    Write-Host "[-] El directorio 'android' no existe en la raíz del proyecto. ¿Ejecutaste 'npx cap add android'?" -ForegroundColor Red
    exit 1
}

# Escapar barra invertida para el archivo de propiedades de Java
$escapedSdkPath = $env:ANDROID_HOME -replace '\\', '/'
$localPropsContent = "sdk.dir=$escapedSdkPath"

try {
    Set-Content -Path $localPropertiesPath -Value $localPropsContent -Encoding Utf8
    Write-Host "[✓] Archivo 'android/local.properties' generado correctamente." -ForegroundColor Green
} catch {
    Write-Host "[x] Error al escribir 'local.properties': $_" -ForegroundColor Red
}

# 4. Instalación de dependencias de npm
Write-Host "`n[+] Instalando dependencias de Node..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Error al instalar dependencias de Node." -ForegroundColor Red
    exit 1
}

# 5. Typecheck (Verificación TypeScript)
Write-Host "`n[+] Ejecutando verificación de tipos TypeScript (tsc --noEmit)..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Falló la verificación de tipos. Resuelve los errores de compilación antes de continuar." -ForegroundColor Red
    exit 1
}

# 6. Compilación de la aplicación web (Vite)
Write-Host "`n[+] Compilando aplicación con Vite..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Error al compilar la aplicación con Vite." -ForegroundColor Red
    exit 1
}

# 7. Sincronización de Capacitor
Write-Host "`n[+] Sincronizando con Capacitor (cap sync android)..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Error al sincronizar con Capacitor." -ForegroundColor Red
    exit 1
}

# 8. Compilación Gradle (APK Debug)
Write-Host "`n[+] Compilando APK con Gradle..." -ForegroundColor Cyan
Push-Location $androidDir
try {
    if (Test-Path ".\gradlew.bat") {
        .\gradlew.bat assembleDebug
    } else {
        Write-Host "[x] No se encontró gradlew.bat en el directorio 'android'." -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Error al compilar con Gradle." -ForegroundColor Red
    exit 1
}

# 9. Mostrar ruta final de APK
$apkPath = Resolve-Path (Join-Path $androidDir "app/build/outputs/apk/debug/app-debug.apk") -ErrorAction SilentlyContinue
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   COMPILACIÓN COMPLETADA EXITOSAMENTE!                   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
if ($apkPath) {
    Write-Host "APK generado en: $apkPath" -ForegroundColor Green
    Write-Host "`nPara instalar en un dispositivo conectado por ADB ejecute:" -ForegroundColor Cyan
    Write-Host "   adb install -r `"$apkPath`"" -ForegroundColor Yellow
} else {
    Write-Host "No se encontró el archivo APK final en la ruta esperada." -ForegroundColor Yellow
}
Write-Host "==========================================================" -ForegroundColor Green
