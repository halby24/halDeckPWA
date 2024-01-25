import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

export async function getActiveWindowPid(): Promise<{stdout: string, stderr: string}>
{
    // PowerShellコマンドを使用してアクティブなウィンドウのプロセスIDを取得
    const command = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class User32 {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);
}
"@
$hwnd = [User32]::GetForegroundWindow()
$pid = 0
[User32]::GetWindowThreadProcessId($hwnd, [ref] $pid)
$pid
`;

    return exec(`powershell -command "${command}"`);
}