@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  Escuro Local Server
REM  API:      http://localhost:3333
REM  Swagger:  http://localhost:3333/docs
REM  Frontend: http://localhost:3000
REM ============================================================

set "BACKEND_PORT=3333"
set "FRONTEND_PORT=3000"
set "PROJECT_ROOT=%~dp0.."
set "API_URL=http://localhost:%BACKEND_PORT%"
set "FRONTEND_URL=http://localhost:%FRONTEND_PORT%"

echo.
echo ============================================
echo   SUBINDO PROJETO ESCURO LOCALMENTE
echo ============================================
echo.
echo API:      %API_URL%
echo Swagger:  %API_URL%/docs
echo Frontend: %FRONTEND_URL%
echo.

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
REM Verifica portas padrao antes de iniciar
REM ------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=@(%BACKEND_PORT%,%FRONTEND_PORT%); foreach($port in $ports){ $conn=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if($conn){ $p=Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue; if($p.ProcessName -match 'node|npm|vite'){ Stop-Process -Id $p.Id -Force; Write-Host \"[OK] Porta $port liberada encerrando $($p.ProcessName).\" } else { Write-Host \"[ERRO] Porta $port ocupada por $($p.ProcessName) PID $($p.Id).\"; exit 10 } } }"
if errorlevel 10 (
    echo.
    echo [ERRO] Uma porta padrao esta ocupada por outro programa.
    echo Feche o programa mostrado acima ou altere a porta dele.
    echo.
    echo Para este projeto, as portas padrao sao:
    echo API:      localhost:%BACKEND_PORT%
    echo Frontend: localhost:%FRONTEND_PORT%
    echo.
    pause
    exit /b 1
)

if exist "%PROJECT_ROOT%\backend\package.json" (
    echo.
    echo [INFO] Iniciando BACKEND na porta %BACKEND_PORT%...
    start "Escuro Backend API" cmd /k "cd /d ""%PROJECT_ROOT%\backend"" && npm install && npm run db:init && npm run seed --if-present && set PORT=%BACKEND_PORT%&& npm run dev"
) else (
    echo.
    echo [AVISO] backend\package.json ainda nao existe.
)

if exist "%PROJECT_ROOT%\frontend\package.json" (
    echo.
    echo [INFO] Iniciando FRONTEND na porta %FRONTEND_PORT%...
    start "Escuro Frontend" cmd /k "cd /d ""%PROJECT_ROOT%\frontend"" && npm install && set VITE_API_BASE_URL=%API_URL%&& npm run dev -- --host 127.0.0.1 --port %FRONTEND_PORT%"
) else (
    echo.
    echo [AVISO] frontend\package.json ainda nao existe.
)

echo.
echo [INFO] Aguardando os servidores iniciarem...
timeout /t 6 /nobreak >nul

echo [INFO] Abrindo navegador...
start "" "%FRONTEND_URL%"
start "" "%API_URL%/docs"

echo.
echo [OK] Servidores solicitados nas portas padrao:
echo Frontend: %FRONTEND_URL%
echo API:      %API_URL%
echo Swagger:  %API_URL%/docs
echo.
pause
