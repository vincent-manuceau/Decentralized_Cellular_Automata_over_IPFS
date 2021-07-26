#!/bin/sh


if [ $(uname) = 'Linux' ]; then
 echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > ./.ipfs/swarm.key
 sed -e "s/\"Router\": \"\"/\"Router\": \"$1\"/g" -i .ipfs/config
elif [ $(uname) = 'Darwin' ]; then
 ./generate_swarm_key_mac > ./.ipfs/swarm.key
 sed -e "s/\"Router\": \"\"/\"Router\": \"$1\"/g" .ipfs/config > .ipfs/config
else
 echo "ERROR : Unsupported OS"
fi
