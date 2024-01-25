#pragma once

#define DLLEXPORT __declspec(dllexport)

extern "C"
{
    DLLEXPORT int get_exe_path(const unsigned long long window_handle, char** path);
    DLLEXPORT void free_path(char* path);
}