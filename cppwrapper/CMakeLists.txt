cmake_minimum_required(VERSION 3.9)
project(cppwrapper)

set(CMAKE_CXX_STANDARD 11)

IF(EMSCRIPTEN)
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --bind -s USE_SDL=2")
ENDIF(EMSCRIPTEN)

include_directories(./engine/include)
include_directories(./engine/include)
add_executable(cppwrapper main.cpp)

target_link_libraries(cppwrapper cppeng)

add_subdirectory(cppeng)