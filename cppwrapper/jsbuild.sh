#!/usr/bin/env bash

# if emmake command not found try running
# > source ~/Documents/projects/emsdk-portable/emsdk_env.sh
# Change path to correct path to the emsdk folder

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}
 rm -rf build_js
 mkdir -p build_js
cd build_js

if ! type "emcmake" > /dev/null; then
  echo "emcmake command not found"
  echo "It can be fixed by executing command:"
  echo "> source <path_to_emsk_folder>/emsdk_env.sh"
else
  emcmake cmake .. && make
fi
