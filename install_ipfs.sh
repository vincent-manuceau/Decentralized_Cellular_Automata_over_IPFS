#!/bin/sh

if [ $(uname) = 'Linux' ]; then
 if ! [ -f "ipfs" ]; then
#  tar -xvf ipfs_linux.tar.gz
  cp ./ipfs_linux ./ipfs
 fi 
elif [ $(uname) = 'Darwin' ]; then
 if ! [ -f "ipfs" ]; then
#  tar -xvf ipfs_mac.tar.gz
  cp ./ipfs_mac ./ipfs
 fi
else
 echo "ERROR : Unsupported OS"
fi
