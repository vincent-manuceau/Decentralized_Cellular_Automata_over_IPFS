#!/bin/sh

sed -e "s/\"Router\": \"\"/\"Router\": \"$1\"/g" -i .ipfs/config
if [ $(uname) = 'Linux' ]; then
	echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > ./.ipfs/swarm.key
	cp ./ipfs_linux ./ipfs
elif [ $(uname) = 'Darwin' ]; then
	./generate_swarm_key_mac > ./.ipfs/swarm.key
	cp ./ipfs_mac ./ipfs
else
	echo "ERROR : Unsupported OS"
fi

