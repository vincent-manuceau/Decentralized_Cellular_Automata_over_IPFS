const {swarm_length, cell_length, pubsub_init_bootstrap} = require('./common_swarm.js')


pubsub_init_bootstrap(cell_length,swarm_length,()=>{
	//swarms = build_swarms()
	console.dir("Swarm server init : OK !")
})