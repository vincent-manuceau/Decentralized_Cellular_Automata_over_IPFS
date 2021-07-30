# About Decentralized Swarms of Asynchronous Distributed Cellular Automata using IPFS

Node.js Implementation for Research Paper : "About Decentralized Swarms of Asynchronous Distributed Cellular Automata Using Inter-Planetary File System's Publish-Subscribe Experimental Implementation" (Work in progress)

This article describes the simple implementation of an asynchronous distributed cellular automata and a decentralized swarm of asynchronous distributed cellular automata built on top of Inter-Planetary File System's Publish-Subscribe (IPFS pubsub) experimentation. Various Publish-Subscribe models such as IPFS FloodSub, Libp2p GossipSub and Libp2p EpiSub are described. As an illustrating example, two distributed versions and a decentralized swarm version of a 2D elementary cellular automaton are detailed in order to highlight the simplicity of implementation with IPFS and the inner workings of these kinds of cellular automata. This work is prior to the implementation of a large scale decentralized epidemic propagation modeling and prediction system based upon asynchronous distributed cellular automata with application to the current SARS-CoV-2 (COVID-19) epidemic.


# Usage Neighbour Publishing Version
- Launch in your browser : [http://localhost:8079](http://localhost:8079)

- First terminal :
```
$  npm run np

> Decentralized_Cellular_Automata_over_IPFS@0.0.1 np
> node neighbour_publishing_version

Initializing bootstrap node ... OK !
{
  PeerID: '12D3KooWRmLD5j3hTqJdgiao5RDwXGthcFWebjbzS4PqH5FRC6wa',
  IPv4: '192.168.0.3'
}
Initializing ipfs client node 5 x:0 y:1 ... OK !
Initializing ipfs client node 1 x:1 y:0 ... OK !
Initializing ipfs client node 0 x:0 y:0 ... OK !
Initializing ipfs client node 20 x:0 y:4 ... OK !
Initializing ipfs client node 10 x:0 y:2 ... OK !
Initializing ipfs client node 21 x:1 y:4 ... OK !
Initializing ipfs client node 2 x:2 y:0 ... OK !
Initializing ipfs client node 6 x:1 y:1 ... OK !
Initializing ipfs client node 13 x:3 y:2 ... OK !
Initializing ipfs client node 17 x:2 y:3 ... OK !
Initializing ipfs client node 4 x:4 y:0 ... OK !
Initializing ipfs client node 18 x:3 y:3 ... OK !
Initializing ipfs client node 14 x:4 y:2 ... OK !
Initializing ipfs client node 23 x:3 y:4 ... OK !
Initializing ipfs client node 22 x:2 y:4 ... OK !
Initializing ipfs client node 24 x:4 y:4 ... OK !
Initializing ipfs client node 19 x:4 y:3 ... OK !
Initializing ipfs client node 9 x:4 y:1 ... OK !
Initializing ipfs client node 16 x:1 y:3 ... OK !
Initializing ipfs client node 3 x:3 y:0 ... OK !
Initializing ipfs client node 12 x:2 y:2 ... OK !
Initializing ipfs client node 15 x:0 y:3 ... OK !
Initializing ipfs client node 8 x:3 y:1 ... OK !
Initializing ipfs client node 7 x:2 y:1 ... OK !
Initializing ipfs client node 11 x:1 y:2 ... OK !
```

- Second terminal :
```
$ npm start
> Decentralized_Cellular_Automata_over_IPFS@0.0.1 start
> IPFS_PATH=./.ipfs ./ipfs pubsub pub cell-0-0 2
```

# Usage Neighbour Subscribing Version
- Launch in your browser : [http://localhost:8079](http://localhost:8079)

- First terminal :
```
$  npm run ns

> Decentralized_Cellular_Automata_over_IPFS@0.0.1 ns
> node neighbour_subscribing_version

Initializing bootstrap node ... OK !
{
  PeerID: '12D3KooWPYpvFRUkRsWKrvi2NfR7rG4i3z1Lo18VNGZtAkk7iBcX',
  IPv4: '192.168.0.3'
}
Initializing ipfs client node 17 x:2 y:3 ... OK !
Initializing ipfs client node 10 x:0 y:2 ... OK !
Initializing ipfs client node 7 x:2 y:1 ... OK !
Initializing ipfs client node 15 x:0 y:3 ... OK !
Initializing ipfs client node 5 x:0 y:1 ... OK !
Initializing ipfs client node 20 x:0 y:4 ... OK !
Initializing ipfs client node 16 x:1 y:3 ... OK !
Initializing ipfs client node 8 x:3 y:1 ... OK !
Initializing ipfs client node 1 x:1 y:0 ... OK !
Initializing ipfs client node 19 x:4 y:3 ... OK !
Initializing ipfs client node 13 x:3 y:2 ... OK !
Initializing ipfs client node 9 x:4 y:1 ... OK !
Initializing ipfs client node 12 x:2 y:2 ... OK !
Initializing ipfs client node 4 x:4 y:0 ... OK !
Initializing ipfs client node 14 x:4 y:2 ... OK !
Initializing ipfs client node 11 x:1 y:2 ... OK !
Initializing ipfs client node 22 x:2 y:4 ... OK !
Initializing ipfs client node 0 x:0 y:0 ... OK !
Initializing ipfs client node 24 x:4 y:4 ... OK !
Initializing ipfs client node 23 x:3 y:4 ... OK !
Initializing ipfs client node 18 x:3 y:3 ... OK !
Initializing ipfs client node 2 x:2 y:0 ... OK !
Initializing ipfs client node 3 x:3 y:0 ... OK !
Initializing ipfs client node 6 x:1 y:1 ... OK !
Initializing ipfs client node 21 x:1 y:4 ... OK !
```

- Second terminal :
```
$ npm start
> Decentralized_Cellular_Automata_over_IPFS@0.0.1 start
> IPFS_PATH=./.ipfs ./ipfs pubsub pub cell-0-0 2
```

