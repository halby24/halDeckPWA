#include <iostream>
#include "get_exe_path.h"

#define TRUE 1
#define FALSE 0

int main()
{
    wchar_t* path = nullptr;
    if (!get_exe_path(&path))
    {
        std::cerr << "Error" << std::endl;
        return 1;
    }
    std::wcout << "Path: " << path << std::endl;

    delete[] path;
    return 0;
}