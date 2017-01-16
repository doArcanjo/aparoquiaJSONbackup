@echo off


start cmd /k  "cd ..\.. & title=%cd% | node index.js %1%"
