cmake_minimum_required(VERSION 3.15)

project(halDeck CXX)

add_library(cpplib SHARED
    include/cpplib.h
    src/cpplib.cpp
)

add_custom_command(TARGET cpplib POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "$<TARGET_FILE:cpplib>"
    "${CMAKE_CURRENT_LIST_DIR}/../bin/"
)