@echo off
REM ============================================================================
REM Publish Pipeline - Generate and deploy to GitHub Pages
REM ============================================================================

echo.
echo ============================================================
echo   Publicando Registros COLCA a GitHub Pages
echo ============================================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python no esta instalado o no esta en PATH
    echo.
    pause
    exit /b 1
)

REM Generate HTML page
echo [1/4] Generando pagina publica...
python generate_page.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo generar la pagina
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Verificando repositorio Git...
git status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Este directorio no es un repositorio Git
    echo.
    echo Para publicar en GitHub Pages, necesitas:
    echo   1. git init
    echo   2. git remote add origin https://github.com/tu-usuario/tu-repo.git
    echo   3. Configurar GitHub Pages en Settings del repo
    echo.
    echo Por ahora, solo se genero documentos_page.html
    echo Puedes subirlo manualmente a tu repositorio
    echo.
    pause
    exit /b 0
)

echo.
echo [3/4] Agregando cambios a Git...
git add documentos_page.html
git status --short

echo.
echo [4/4] Haciendo commit...
git commit -m "Update public page - %date% %time%"

echo.
echo ============================================================
echo   Listo para publicar!
echo ============================================================
echo.
echo Ejecuta: git push origin main
echo.
echo O puedes hacer push automaticamente ahora.
echo.
choice /C YN /M "Hacer push automaticamente"
if %ERRORLEVEL% EQU 1 (
    echo.
    echo Haciendo push...
    git push origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Publicado en GitHub Pages!
        echo.
        echo Tu pagina estara disponible en:
        echo https://colca-spa.github.io/colca-datos/documentos_page.html
        echo.
    ) else (
        echo.
        echo [ERROR] No se pudo hacer push
        echo Verifica tu conexion y credenciales
        echo.
    )
)

echo.
pause
