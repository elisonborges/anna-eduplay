@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Preparar-Runtime.ps1"
if errorlevel 1 (
 echo.
 echo Nao foi possivel preparar o runtime. Verifique a conexao e a mensagem acima.
 pause
)
