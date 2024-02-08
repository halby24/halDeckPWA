#pragma once

#define DLLEXPORT __declspec(dllexport)

extern "C" {
    DLLEXPORT int get_exe_path(const unsigned long long window_handle, char** path);
    DLLEXPORT void set_volume(const float volume_level);
    DLLEXPORT void system_shutdown();
    DLLEXPORT void system_sleep();
    DLLEXPORT void delete_ptr(void* ptr);
    DLLEXPORT void delete_array_ptr(void* ptr);
}