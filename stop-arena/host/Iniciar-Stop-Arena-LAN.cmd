@echo off
setlocal
title AnnA Stop Arena Host LAN
cd /d "%~dp0"
set "NODE=%~dp0runtime\node.exe"
if not exist "%NODE%" (
 where node.exe >nul 2>nul
 if errorlevel 1 (
  echo.
  echo [AnnA Stop Arena] Runtime portatil nao encontrado.
  echo Execute "Preparar-Runtime.cmd" uma vez com internet neste computador.
  echo Depois, o jogo funcionara sem internet.
  echo.
  pause
  exit /b 1
 )
 set "NODE=node.exe"
)
echo.
echo ==============================================
echo      AnnA Stop Arena Host - Rede Local
echo ==============================================
echo Mantenha esta janela aberta durante a partida.
echo Permita acesso a redes privadas no Firewall Windows.
echo.
"%NODE%" "%~dp0server.mjs"
if errorlevel 1 (
 echo.
 echo Falha ao iniciar o servidor. Verifique a porta 8788 e as mensagens acima.
 pause
)
