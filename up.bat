@echo off
chcp 65001 >nul
echo ==========================================
echo       Digital Garden 自动同步脚本
echo ==========================================
echo.

:: 1. 添加所有文件
echo [1/3] 正在添加文件 (git add)...
git add .

:: 2. 获取提交信息
set /p msg="请输入提交备注 (直接回车 = 使用当前时间): "

if "%msg%"=="" (
    set msg=Update: %date% %time%
)

:: 3. 提交
echo.
echo [2/3] 正在提交 (git commit)...
git commit -m "%msg%"

:: 4. 推送
echo.
echo [3/3] 正在推送到 GitHub (git push)...
git push

echo.
echo ==========================================
echo ✅ 成功！Vercel 将会自动开始部署更新。
echo ==========================================
pause