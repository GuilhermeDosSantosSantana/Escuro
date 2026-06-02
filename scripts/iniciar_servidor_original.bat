from pathlib import Path

bat = r"""@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  Escuro Local Server
REM  Domínio local: www.stigmaescuro.online
REM  API:      http://www.stigmaescuro.online:3333
REM  Swagger:  http://www.stigmaescuro.online:3333/docs
REM  Frontend: http://www.stigmaescuro.online:3000
REM ============================================================

set "LOCAL_DOMAIN=www.stigmaescuro.online"
set "LOCAL_IP=127.0.0.1"
set "BACKEND_PORT=3333"
set "FRONTEND_PORT=3000"
set "HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts"

echo.
echo ============================================
echo   SUBINDO PROJETO ESCURO LOCALMENTE
echo ============================================
echo.
echo Dominio local: %LOCAL_DOMAIN%
echo API:           http://%LOCAL_DOMAIN%:%BACKEND_PORT%
echo Swagger:       http://%LOCAL_DOMAIN%:%BACKEND_PORT%/docs
echo Frontend:      http://%LOCAL_DOMAIN%:%FRONTEND_PORT%
echo.

REM ------------------------------------------------------------
REM Verifica Node.js
REM ------------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale o Node.js antes de rodar este arquivo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERRO] npm nao encontrado.
    echo Instale o Node.js com npm antes de rodar este arquivo.
    pause
    exit /b 1
)

REM ------------------------------------------------------------
REM Adiciona dominio no arquivo hosts
REM Precisa rodar como Administrador na primeira vez.
REM ------------------------------------------------------------
findstr /C:"%LOCAL_DOMAIN%" "%HOSTS_FILE%" >nul 2>nul
if errorlevel 1 (
    echo [INFO] Dominio %LOCAL_DOMAIN% nao encontrado no hosts.
    echo [INFO] Tentando adicionar: %LOCAL_IP% %LOCAL_DOMAIN%
    echo.

    net session >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] Para adicionar o dominio automaticamente, rode este .bat como Administrador.
        echo.
        echo Adicione manualmente esta linha no arquivo:
        echo %HOSTS_FILE%
        echo.
        echo %LOCAL_IP% %LOCAL_DOMAIN%
        echo.
        pause
    ) else (
        echo %LOCAL_IP% %LOCAL_DOMAIN%>> "%HOSTS_FILE%"
        echo [OK] Dominio local adicionado no hosts.
    )
) else (
    echo [OK] Dominio local ja existe no hosts.
)

REM ------------------------------------------------------------
REM Sobe Backend
REM Espera que exista a pasta backend/ na mesma pasta deste .bat
REM ------------------------------------------------------------
if exist "%~dp0backend\package.json" (
    echo.
    echo [INFO] Iniciando BACKEND na porta %BACKEND_PORT%...
    start "Escuro Backend API" cmd /k "cd /d "%~dp0backend" && npm install && npx prisma migrate dev && npm run seed --if-present && set PORT=%BACKEND_PORT%&& npm run dev"
) else (
    echo.
    echo [AVISO] Pasta backend/ nao encontrada.
    echo Esperado: %~dp0backend\package.json
)

REM ------------------------------------------------------------
REM Sobe Frontend
REM Espera que exista a pasta frontend/ na mesma pasta deste .bat
REM ------------------------------------------------------------
if exist "%~dp0frontend\package.json" (
    echo.
    echo [INFO] Iniciando FRONTEND na porta %FRONTEND_PORT%...
    start "Escuro Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && set PORT=%FRONTEND_PORT%&& npm run dev"
) else (
    echo.
    echo [AVISO] Pasta frontend/ nao encontrada.
    echo Esperado: %~dp0frontend\package.json
)

REM ------------------------------------------------------------
REM Abre navegador
REM ------------------------------------------------------------
echo.
echo [INFO] Aguardando alguns segundos para os servidores iniciarem...
timeout /t 5 /nobreak >nul

echo [INFO] Abrindo navegador...
start http://%LOCAL_DOMAIN%:%FRONTEND_PORT%
start http://%LOCAL_DOMAIN%:%BACKEND_PORT%/docs

echo.
echo ============================================
echo   SERVIDORES INICIADOS
echo ============================================
echo.
echo Frontend: http://%LOCAL_DOMAIN%:%FRONTEND_PORT%
echo API:      http://%LOCAL_DOMAIN%:%BACKEND_PORT%
echo Swagger:  http://%LOCAL_DOMAIN%:%BACKEND_PORT%/docs
echo.
echo Para encerrar, feche as janelas do Backend e Frontend.
echo.
pause
"""

readme = """# Como usar o arquivo BAT — Escuro Local

## Objetivo

Este arquivo `.bat` sobe o projeto localmente usando o domínio:

```txt
www.stigmaescuro.online