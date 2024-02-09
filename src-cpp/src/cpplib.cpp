#include "../include/cpplib.h"
#include <Windows.h>
#include <MMDeviceAPI.h>
#include <endpointvolume.h>
#include <psapi.h>
#include <iostream>
#include <powrprof.h>

#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "powrprof.lib")

#define TRUE 1
#define FALSE 0

char* wcharToChar(const wchar_t* wstr);

int get_exe_path(const unsigned long long window_handle, char** path)
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

        *path = wcharToChar(modName);

        break;
    }
    if (!foundFlag)
    {
        std::cerr << "Failed to find exe file." << std::endl;
        return FALSE;
    }

    CloseHandle(hProc);

    return TRUE;
}

char* wcharToChar(const wchar_t* wstr) {
    if (wstr == nullptr) {
        return nullptr; // 引数がnullptrの場合はnullptrを返す
    }

    // 変換後の文字列のサイズを取得するためにwcstombs_sを最初に呼び出す
    size_t convertedSize = 0;
    errno_t err = wcstombs_s(&convertedSize, nullptr, 0, wstr, _TRUNCATE);
    if (err != 0 || convertedSize == 0) {
        // サイズの取得に失敗
        return nullptr;
    }

    // char配列に変換するためのメモリを動的に確保
    char* converted = new char[convertedSize];
    err = wcstombs_s(&convertedSize, converted, convertedSize, wstr, _TRUNCATE);
    if (err != 0) {
        // 変換に失敗した場合
        delete[] converted; // 確保したメモリを解放
        return nullptr;
    }

    return converted; // 変換された文字列へのポインタを返す
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
    return ExitWindowsEx(EWX_POWEROFF, SHTDN_REASON_MAJOR_OTHER);
}

int system_restart()
{
    return ExitWindowsEx(EWX_REBOOT, SHTDN_REASON_MAJOR_OTHER);
}

int system_sleep()
{
    return SetSuspendState(FALSE, FALSE, FALSE);
}

int display_on()
{
    return SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, -1);
}

int display_off()
{
    return SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, 2);
}

void delete_ptr(void* ptr)
{
    if (ptr) delete ptr;
}

void delete_array_ptr(void* ptr)
{
    if (ptr) delete[] ptr;
}