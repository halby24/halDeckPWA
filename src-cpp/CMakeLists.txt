cmake_minimum_required(VERSION 3.15)

set(PROJECT_NAME get_exe_path)
project(${PROJECT_NAME} CXX)

add_library(${PROJECT_NAME} SHARED include/get_exe_path.h src/get_exe_path.cpp)

add_executable(check_exe_path src/main.cpp)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_link_libraries(check_exe_path ${PROJECT_NAME})

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}.dll"
    "${CMAKE_CURRENT_LIST_DIR}/../lib/")