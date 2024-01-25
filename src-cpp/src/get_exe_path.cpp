#include "../include/get_exe_path.h"
#include "Windows.h"
#include <iostream>
#include <psapi.h>
#include <stdlib.h>

#define TRUE 1
#define FALSE 0

#undef MAX_PATH
#define MAX_PATH 1024

char* wcharToChar(const wchar_t* wstr);

int get_exe_path(const unsigned long long window_handle, char** path)
{
    setlocale(LC_ALL, "ja_JP.UTF-8");

    HWND hWnd = reinterpret_cast<HWND>(window_handle);
    std::cerr << "hWnd: " << hWnd << std::endl;

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

void free_path(char* path)
{
    delete[] path;
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