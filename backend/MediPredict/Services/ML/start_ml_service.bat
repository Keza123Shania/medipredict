@echo off
echo Starting MediPredict ML Prediction Service...
echo.
cd /d "%~dp0"
python prediction_service.py
pause
