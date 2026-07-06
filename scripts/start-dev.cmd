@echo off
cd /d "%~dp0.."
C:\Progra~1\nodejs\npm.cmd run dev -- --hostname 127.0.0.1 --port 3000 > .next\dev-server.log 2> .next\dev-server.err.log
