#include "../include/com.h"
#include <iostream>
#include <ntdef.h>
#include <ntstatus.h>
#include <objbase.h>
#include <string>
#include <windows.h>

constexpr LPCOLESTR IVDMI_GUID_Win11_23H2_3085 =
    L"{53F5CA0B-158F-4124-900C-057158060B27}";
constexpr LPCOLESTR IVDMI_GUID_Win11_22H2_2215 =
    L"{B2F925B9-5A0F-4D2E-9F4D-2B1507593C10}";
constexpr LPCOLESTR IVDMI_GUID_Win10_1809 =
    L"{F31574D6-B682-4CDC-BD56-1827860ABEC6}";



bool init_virtual_desktop_manager_internal()
{
    LPCOLESTR ivdmi_guid;
    if (IsWindowsVersionOrGreater(10, 0, 0, 0) &&
        !IsWindowsVersionOrGreater(10, 0, 0, 22000))
    {
        ivdmi_guid = IVDMI_GUID_Win10_1809;
    } else if (IsWindowsVersionOrGreater(10, 0, 0, 22000) &&
               !IsWindowsVersionOrGreater(10, 0, 0, 22621))
    {
        ivdmi_guid = IVDMI_GUID_Win11_22H2_2215;
    } else if (IsWindowsVersionOrGreater(10, 0, 0, 22621))
    {
        ivdmi_guid = IVDMI_GUID_Win11_23H2_3085;
    } else
    {
        std::cerr << "Unsupported Windows version." << std::endl;
        return false;
    }

    if (!CoInitialize(NULL))
    {
        std::cerr << "Failed to initialize COM." << std::endl;
        return false;
    }

    CLSID clsid;
    if (!CLSIDFromString(ivdmi_guid, &clsid))
    {
        std::cerr << "Failed to convert string to CLSID." << std::endl;
        CoUninitialize();
        return false;
    }

    IVirtualDesktopManagerInternal* manager = nullptr;
    if (!CoCreateInstance(clsid, NULL, CLSCTX_ALL, IID_IUnknown,
                          reinterpret_cast<void**>(&manager)))
    {
        std::cerr << "Failed to create instance." << std::endl;
        CoUninitialize();
        return false;
    }



    manager->Release();
    CoUninitialize();

    return true;
}

bool IsWindowsVersionOrGreater(WORD wMajorVersion, WORD wMinorVersion,
                               WORD wServicePackMajor, DWORD dwBuildNumber)
{
    OSVERSIONINFOEXW osvi = {
        sizeof(osvi), wMajorVersion,    wMinorVersion, dwBuildNumber, 0,
        {0},          wServicePackMajor};
    DWORDLONG const dwlConditionMask = VerSetConditionMask(
        VerSetConditionMask(
            VerSetConditionMask(
                VerSetConditionMask(0, VER_MAJORVERSION, VER_GREATER_EQUAL),
                VER_MINORVERSION, VER_GREATER_EQUAL),
            VER_SERVICEPACKMAJOR, VER_GREATER_EQUAL),
        VER_BUILDNUMBER, VER_GREATER_EQUAL);

    return VerifyVersionInfoW(&osvi,
                              VER_MAJORVERSION | VER_MINORVERSION |
                                  VER_SERVICEPACKMAJOR | VER_BUILDNUMBER,
                              dwlConditionMask) != FALSE;
}