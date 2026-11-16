@echo off
title Dev Server

cd %~dp0
cd ..

if not exist C:\Users\%username%\.deno\bin\deno.exe (
   powershell -command "irm https://deno.land/install.ps1 | iex"
   deno install
)

deno task dev --port 2137 --open
