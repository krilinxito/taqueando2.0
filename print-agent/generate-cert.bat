@echo off
setlocal EnableDelayedExpansion
echo Generando certificado SSL para el agente de impresion...
echo.

:: Buscar openssl
set "OPENSSL_CMD="
where openssl >nul 2>nul
if !errorlevel! equ 0 (
    set "OPENSSL_CMD=openssl"
    goto :found
)
:: Buscar en Git for Windows
for %%G in (
    "%ProgramFiles%\Git\usr\bin\openssl.exe"
    "%ProgramFiles(x86)%\Git\usr\bin\openssl.exe"
    "%LOCALAPPDATA%\Programs\Git\usr\bin\openssl.exe"
) do (
    if exist %%G (
        set "OPENSSL_CMD=%%~G"
        goto :found
    )
)

echo ERROR: OpenSSL no encontrado.
echo Instale Git for Windows (https://git-scm.com) que incluye OpenSSL,
echo o agregue openssl al PATH del sistema.
echo.
pause
exit /b 1

:found
echo Usando: !OPENSSL_CMD!
echo.
"!OPENSSL_CMD!" req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
if !errorlevel! neq 0 (
    echo.
    echo ERROR: No se pudo generar el certificado.
    pause
    exit /b 1
)

echo.
echo Certificado generado: cert.pem y key.pem
echo.
echo SIGUIENTE PASO: Instalar cert.pem en Edge/Chrome como CA de confianza:
echo   1. Abra Edge y vaya a edge://settings/privacy
echo   2. Baje hasta "Administrar certificados" y abra
echo   3. Vaya a "Entidades de certificacion raiz de confianza" -^> Importar
echo   4. Seleccione el archivo cert.pem de esta carpeta
echo   5. Reinicie Edge y el agente (iniciar.bat)
echo.
pause
