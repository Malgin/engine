#!/usr/bin/env bash

# if emmake command not found try running
# > source /Users/nsidorenko/Documents/projects/emsdk-portable/emsdk_env.sh
# Change path to correct path to the emsdk folder

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}
mkdir -p build_js
cd build_js
emcmake cmake .. && make
