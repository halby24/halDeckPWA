#include <iostream>
#include "get_exe_path.h"

#define TRUE 1
#define FALSE 0

int main(int argc, char** argv)
{
    if (argc != 2)
    {
        std::cerr << "Usage: " << argv[0] << " <window_handle>" << std::endl;
        return 1;
    }

    uintptr_t window_handle = 0;
    window_handle = atoi(argv[1]);

    char* path = nullptr;
    if (!get_exe_path(window_handle, &path))
    {
        std::cerr << "Error" << std::endl;
        return 1;
    }
    std::wcout << "Path: " << path << std::endl;

    delete[] path;
    return 0;
}