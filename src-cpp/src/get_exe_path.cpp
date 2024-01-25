#include "../include/get_exe_path.h"
#include "Windows.h"
#include <iostream>
#include <psapi.h>

#define TRUE 1
#define FALSE 0

#undef MAX_PATH
#define MAX_PATH 1024

int get_exe_path(uintptr_t windowHandle, wchar_t** path)
{
    setlocale(LC_ALL, "ja_JP.UTF-8");

    HWND hWnd = reinterpret_cast<HWND>(windowHandle);

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

        *path = new wchar_t[MAX_PATH];
        switch (wcsncpy_s(*path, MAX_PATH, modName, _TRUNCATE))
        {
        case 0:
            break;
        case STRUNCATE: std::cerr << "Truncated." << std::endl;
        default:
            std::cerr << "Failed to copy." << std::endl;
            delete *path;
            return FALSE;
        }

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