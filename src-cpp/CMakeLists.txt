cmake_minimum_required(VERSION 3.15)

set(proj_name halDeck)
project($proj_name CXX)

set(gep ${proj_name}_GetExePath)
add_executable(${gep} src/get_exe_path.cpp)

add_custom_command(TARGET ${gep} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${CMAKE_CURRENT_BINARY_DIR}/${gep}.exe"
    "${CMAKE_CURRENT_LIST_DIR}/../bin/"
)
