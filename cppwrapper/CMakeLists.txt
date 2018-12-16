cmake_minimum_required(VERSION 3.9)
project(cppwrapper)

set(CMAKE_CXX_STANDARD 14)

IF(EMSCRIPTEN)
#    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ASSERTIONS=2 --bind -s USE_WEBGL2=1 -s DEMANGLE_SUPPORT=2 -O2 --preload-file ../../resources@resources")
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --bind -s DISABLE_EXCEPTION_CATCHING=0 -s TOTAL_MEMORY=503316480 -s USE_GLFW=3 -s USE_WEBGL2=1 -O2 --preload-file ../../resources@resources")
ENDIF(EMSCRIPTEN)

#SET(CMAKE_CXX_FLAGS ${CMAKE_CXX_FLAGS} -M)

include_directories(./engine/include)
add_executable(cppwrapper main.cpp game/Game.cpp game/Game.h game/objects/Sprite.cpp game/objects/Sprite.h)

target_link_libraries(cppwrapper cppeng)

add_subdirectory(cppeng)