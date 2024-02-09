#include "../include/cpplib.h"
#include <MMDeviceAPI.h>
#include <Windows.h>
#include <endpointvolume.h>
#include <iostream>
#include <powrprof.h>
#include <psapi.h>

#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "powrprof.lib")

#define TRUE 1
#define FALSE 0

char* wcharToChar(const wchar_t* wstr);

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

int system_shutdown() { return ExitWindowsEx(EWX_POWEROFF, SHTDN_REASON_MAJOR_OTHER); }

int system_restart() { return ExitWindowsEx(EWX_REBOOT, SHTDN_REASON_MAJOR_OTHER); }

int system_sleep() { return SetSuspendState(FALSE, FALSE, FALSE); }

int display_on() { return SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, -1); }

int display_off() { return SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, 2); }
