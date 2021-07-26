#!/bin/sh
sed -e "s/\/ip4\/127.0.0.1\/tcp\/5001/\/ip4\/127.0.0.1\/tcp\/$1/g" \
-e "s/\/ip4\/127.0.0.1\/tcp\/8080/\/ip4\/127.0.0.1\/tcp\/$2/g" \
-e "s/\/ip4\/0.0.0.0\/tcp\/4001/\/ip4\/0.0.0.0\/tcp\/$3/g" \
-e "s/\/ip6\/::\/tcp\/4001/\/ip6\/::\/tcp\/$3/g" \
-e "s/\/ip4\/0.0.0.0\/udp\/4001\/quic/\/ip4\/0.0.0.0\/udp\/$3\/quic/g" \
-e "s/\/ip6\/::\/udp\/4001\/quic/\/ip6\/::\/udp\/$3\/quic/g" \
-e "s/\"Router\": \"\"/\"Router\": \"$5\"/g" \
-i .ipfs$4/config
cp .ipfs/swarm.key .ipfs$4/

