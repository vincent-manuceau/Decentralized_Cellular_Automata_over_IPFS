# About Decentralized Swarms of Asynchronous Distributed Cellular Automata using IPFS

Node.js Implementation for Research Paper : "About Decentralized Swarms of Asynchronous Distributed Cellular Automata Using Inter-Planetary File System's Publish-Subscribe Experimental Implementation" (Work in progress)

This article describes the simple implementation of an asynchronous distributed cellular automata and a decentralized swarm of asynchronous distributed cellular automata built on top of Inter-Planetary File System's Publish-Subscribe (IPFS pubsub) experimentation. Various Publish-Subscribe models such as IPFS FloodSub, Libp2p GossipSub and Libp2p EpiSub are described. As an illustrating example, two distributed versions and a decentralized swarm version of a 2D elementary cellular automaton are detailed in order to highlight the simplicity of implementation with IPFS and the inner workings of these kinds of cellular automata. This work is prior to the implementation of a large scale decentralized epidemic propagation modeling and prediction system based upon asynchronous distributed cellular automata with application to the current SARS-CoV-2 (COVID-19) epidemic.


# Usage
First terminal :
```
$ npm run neighbour_publishing
> Decentralized Swarm of Asynchronous Distributed Cellular Automata@0.0.1 neighbour_publishing
> node neighbour_publishing_version

Initializing bootstrap node ... OK !
{
  PeerID: '12D3KooWPpUW9UNfZZHP7PZZN2iCaZ7X3y5arYyuV2vBWDnmo3ME',
  IPv4: '192.168.0.3'
}
Initializing ipfs client node 2 x:0 y:1 ... OK !
Initializing ipfs client node 3 x:1 y:1 ... OK !
Initializing ipfs client node 0 x:0 y:0 ... OK !
Initializing ipfs client node 1 x:1 y:0 ... OK !
```

Second terminal :
```
$ npm start
> Decentralized Swarm of Asynchronous Distributed Cellular Automata@0.0.1 start
> IPFS_PATH=./.ipfs ./ipfs pubsub pub cell-0-0 2
```

