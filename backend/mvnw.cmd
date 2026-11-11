@echo off
setlocal

REM Find Maven binary
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "MVN_CMD=mvn"
) else (
    REM Try maven from user's .m2 wrapper dists
    for /d %%D in ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9*") do (
        for /d %%S in ("%%D\*") do (
            for /d %%M in ("%%S\apache-maven-*") do (
                if exist "%%M\bin\mvn.cmd" (
                    set "MVN_CMD=%%M\bin\mvn.cmd"
                )
            )
        )
    )
)

if "%MVN_CMD%"=="" (
    echo [ERROR] Maven not found in PATH or in %USERPROFILE%\.m2\wrapper\dists.
    exit /b 1
)

REM Set JAVA_HOME if not already set
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Java\jdk-24" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-24"
    ) else if exist "C:\Program Files\Java\jdk-21" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-21"
    ) else if exist "C:\Program Files\Java\jdk-17" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-17"
    )
)

"%MVN_CMD%" %*
exit /b %ERRORLEVEL%
