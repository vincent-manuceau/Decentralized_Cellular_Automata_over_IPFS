#!/bin/sh

sed -e "s/\"Router\": \"\"/\"Router\": \"$1\"/g" -i .ipfs/config
if [ $(uname) = 'Linux' ]; then
 echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > ./.ipfs/swarm.key
 if ! [ -f "ipfs" ]; then
#  tar -xvf ipfs_linux.tar.gz
  cp ./ipfs_linux ./ipfs
 fi 
elif [ $(uname) = 'Darwin' ]; then
 ./generate_swarm_key_mac > ./.ipfs/swarm.key
 if ! [ -f "ipfs" ]; then
#  tar -xvf ipfs_mac.tar.gz
  cp ./ipfs_mac ./ipfs
 fi
else
 echo "ERROR : Unsupported OS"
fi
