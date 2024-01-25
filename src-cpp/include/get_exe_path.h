#pragma once

#define DLLEXPORT __declspec(dllexport)

extern "C"
{
    DLLEXPORT int get_exe_path(wchar_t** path);
}