@echo off
echo Generando certificado SSL para el agente de impresion...
echo.

where openssl >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: OpenSSL no encontrado. Instale Git for Windows (incluye openssl) o agregue openssl al PATH.
    pause
    exit /b 1
)

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/CN=localhost"

echo.
echo Certificado generado: cert.pem y key.pem
echo.
echo IMPORTANTE: Abra https://localhost:9876/status en su navegador
echo y acepte el certificado para que el sitio pueda conectarse.
echo.
pause
