#include "../include/cpplib.h"
#include <MMDeviceAPI.h>
#include <Windows.h>
#include <endpointvolume.h>
#include <iostream>
#include <powrprof.h>
#include <psapi.h>
#include <vector>

#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "powrprof.lib")

#define TRUE 1
#define FALSE 0

BOOL EnablePrivileges(LPTSTR lpPrivilegeName, BOOL bEnable);

int get_exe_path(const unsigned long long window_handle, char* path, size_t path_length)
{
    setlocale(LC_ALL, "ja_JP.UTF-8");

    HWND hWnd = reinterpret_cast<HWND>(window_handle);

    DWORD id;
    GetWindowThreadProcessId(hWnd, &id);

    HANDLE hProc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, id);
    if (hProc == NULL)
    {
        std::cerr << "Failed to open process." << std::endl;
        return FALSE;
    }

    HMODULE hMods[1024];
    DWORD cbNeeded;
    if (!EnumProcessModules(hProc, hMods, sizeof(hMods), &cbNeeded))
    {
        std::cerr << "Failed to get modules." << std::endl;
        return FALSE;
    }

    auto modNum = cbNeeded / sizeof(HMODULE);

    auto foundFlag = false;
    int result = FALSE;
    for (int i = 0; i < modNum; i++)
    {
        wchar_t modName[MAX_PATH];
        if (!GetModuleFileNameExW(hProc, hMods[i], modName, sizeof(modName) / sizeof(wchar_t)))
        {
            std::wcerr << "Error: " << GetLastError() << std::endl;
            return FALSE;
        }

        if (wcsstr(modName, L".exe") == NULL) continue;
        foundFlag = true;

        result = WideCharToMultiByte(CP_UTF8, 0, modName, -1, path, path_length, NULL, NULL);

        break;
    }
    if (!foundFlag)
    {
        std::cerr << "Failed to find exe file." << std::endl;
        return FALSE;
    }

    CloseHandle(hProc);

    return result;
}

int set_volume(const float volume_level)
{
    CoInitialize(NULL);

    IMMDeviceEnumerator* deviceEnumerator = NULL;
    IMMDevice* defaultDevice = NULL;

    CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_INPROC_SERVER, __uuidof(IMMDeviceEnumerator), (LPVOID*)&deviceEnumerator);

    deviceEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &defaultDevice);

    IAudioEndpointVolume* endpointVolume = NULL;

    defaultDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_INPROC_SERVER, NULL, (LPVOID*)&endpointVolume);

    auto result = endpointVolume->SetMasterVolumeLevelScalar(volume_level, NULL);

    endpointVolume->Release();
    defaultDevice->Release();
    deviceEnumerator->Release();
    CoUninitialize();

    return result;
}

int system_shutdown()
{
    // SE_SHUTDOWN_NAME(シャットダウン特権) を有効にする
    if (!EnablePrivileges(SE_SHUTDOWN_NAME, TRUE))
    {
        puts("EnablePrivileges failed");
        return FALSE;
    }
    return ExitWindowsEx(EWX_POWEROFF, SHTDN_REASON_MAJOR_OTHER);
}

int system_restart()
{
    // SE_SHUTDOWN_NAME(シャットダウン特権) を有効にする
    if (!EnablePrivileges(SE_SHUTDOWN_NAME, TRUE))
    {
        puts("EnablePrivileges failed");
        return FALSE;
    }
    return ExitWindowsEx(EWX_REBOOT, SHTDN_REASON_MAJOR_OTHER);
}

int system_sleep() { return SetSuspendState(FALSE, FALSE, FALSE); }

int display_on() { return SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, -1); }

int display_off() { return SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, 2); }

int send_char_unicode(int utf32)
{
    // UTF-32からUTF-16への変換
    wchar_t unicodeString[2]; // UTF-16サロゲートペアを格納するための配列
    if (utf32 > 0xFFFF)
    { // サロゲートペアが必要な場合
        utf32 -= 0x10000;
        unicodeString[0] = 0xD800 | ((utf32 >> 10) & 0x3FF); // 上位サロゲート
        unicodeString[1] = 0xDC00 | (utf32 & 0x3FF);         // 下位サロゲート
    } else
    { // サロゲートペアが不要な場合
        unicodeString[0] = utf32;
        unicodeString[1] = 0; // 配列の終端
    }

    // INPUT構造体の配列を準備
    std::vector<INPUT> inputs;
    for (int i = 0; unicodeString[i] != 0 && i < 2; ++i)
    {
        INPUT input = {};
        input.type = INPUT_KEYBOARD;
        input.ki.wVk = 0;
        input.ki.wScan = unicodeString[i];
        input.ki.dwFlags = KEYEVENTF_UNICODE;
        inputs.push_back(input); // キー押下イベント

        input.ki.dwFlags |= KEYEVENTF_KEYUP;
        inputs.push_back(input); // キー解放イベント
    }

    // イベントの送信
    return SendInput(static_cast<UINT>(inputs.size()), &inputs[0], sizeof(INPUT));
}

BOOL EnablePrivileges(LPTSTR lpPrivilegeName, BOOL bEnable)
{
    HANDLE hToken;
    LUID luid;
    TOKEN_PRIVILEGES tokenPrivileges;
    BOOL bRet;

    // 1.OpenProcessToken関数で、プロセストークンを取得する
    bRet = OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken);
    if (!bRet) { return FALSE; }

    // 2.LookupPrivilegeValue関数で、特権に対応するLUID(ローカル一意識別子)を取得する
    bRet = LookupPrivilegeValue(NULL, lpPrivilegeName, &luid);
    if (bRet)
    {

        // 3.TOKEN_PRIVILEGES型のオブジェクトに、LUID(ローカル一意識別子)と特権の属性(有効にするか無効にするか)を指定する
        tokenPrivileges.PrivilegeCount = 1;
        tokenPrivileges.Privileges[0].Luid = luid;
        tokenPrivileges.Privileges[0].Attributes = bEnable ? SE_PRIVILEGE_ENABLED : 0;

        // 4.AdjustTokenPrivileges関数で、特権を有効にする
        AdjustTokenPrivileges(hToken, FALSE, &tokenPrivileges, 0, 0, 0);

        bRet = GetLastError() == ERROR_SUCCESS;
    }

    CloseHandle(hToken);

    return bRet;
}