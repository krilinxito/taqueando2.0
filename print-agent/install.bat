@echo off
setlocal EnableDelayedExpansion
echo ============================================
echo   Instalador - Agente de Impresion
echo ============================================
echo.

:: 1. Instalar dependencias
echo [1/2] Instalando dependencias...
npm install
if !errorlevel! neq 0 (
    echo ERROR: Fallo la instalacion de dependencias.
    echo Asegurese de tener Node.js instalado (https://nodejs.org)
    pause
    exit /b 1
)
echo.

:: 2. Generar certificado SSL si no existe
if exist cert.pem (
    echo [2/2] Certificado SSL ya existe, omitiendo...
) else (
    echo [2/2] Generando certificado SSL...
    call :find_openssl
    if "!OPENSSL_CMD!"=="" (
        echo AVISO: OpenSSL no encontrado.
        echo Instale Git for Windows (https://git-scm.com) que incluye OpenSSL.
        echo Luego ejecute generate-cert.bat para generar el certificado.
        echo Sin certificado, el agente no funcionara desde sitios HTTPS.
        echo.
        pause
        exit /b 0
    )
    "!OPENSSL_CMD!" req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "//CN=localhost"
    if !errorlevel! neq 0 (
        echo ERROR: No se pudo generar el certificado.
        pause
        exit /b 1
    )
    echo Certificado generado correctamente.
)

echo.
echo ============================================
echo   Instalacion completa!
echo ============================================
echo.
echo 1. Edite config.json para configurar el puerto COM de su impresora
echo 2. Ejecute iniciar.bat para arrancar el agente
echo 3. Abra https://localhost:9876/status en el navegador y acepte el certificado (solo la primera vez)
echo.
pause
exit /b 0

:find_openssl
set "OPENSSL_CMD="
:: Intentar openssl del PATH
where openssl >nul 2>nul
if !errorlevel! equ 0 (
    set "OPENSSL_CMD=openssl"
    exit /b 0
)
:: Buscar en Git for Windows
for %%G in (
    "%ProgramFiles%\Git\usr\bin\openssl.exe"
    "%ProgramFiles(x86)%\Git\usr\bin\openssl.exe"
    "%LOCALAPPDATA%\Programs\Git\usr\bin\openssl.exe"
) do (
    if exist %%G (
        set "OPENSSL_CMD=%%~G"
        exit /b 0
    )
)
exit /b 1
