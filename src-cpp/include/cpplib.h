#pragma once

#define DLLEXPORT __declspec(dllexport)

extern "C"
{
    DLLEXPORT int get_exe_path(const unsigned long long window_handle, char* path, size_t path_length);
    DLLEXPORT int set_volume(const float volume_level);
    DLLEXPORT int system_shutdown();
    DLLEXPORT int system_restart();
    DLLEXPORT int system_sleep();
    DLLEXPORT int display_on();
    DLLEXPORT int display_off();
}