cmake_minimum_required(VERSION 3.15)

set(PROJECT_NAME get_exe_path)
set(LIB_NAME ${PROJECT_NAME}_lib)
project(${PROJECT_NAME} CXX)

add_library(${LIB_NAME} SHARED include/get_exe_path.h src/get_exe_path.cpp)

add_executable(${PROJECT_NAME} src/main.cpp)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_link_libraries(${PROJECT_NAME} ${LIB_NAME})

add_custom_command(TARGET ${LIB_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${CMAKE_CURRENT_BINARY_DIR}/${LIB_NAME}.dll"
    "${CMAKE_CURRENT_LIST_DIR}/../bin/"
)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${CMAKE_CURRENT_BINARY_DIR}/${LIB_NAME}.dll"
    "${CMAKE_CURRENT_LIST_DIR}/../bin/"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}.exe"
    "${CMAKE_CURRENT_LIST_DIR}/../bin/"
)