const {swarm_length, cell_length, display_cells, pubsub_init_bootstrap, 
		pubsub_init_node_client, neighb_list, swarm_subscribe, cell_subscribe, swarm_publish
	  
	  } = require('./common_swarm.js')
var {swarms} = require('./common_swarm.js')


class Swarm {
	constructor(swarm_id){	
		this.swarm_id = swarm_id
		this.cells = []
		pubsub_init_node_client(swarm_id, cell_length, ()=>{
			this.subscribe = swarm_subscribe(this)
		})
	}
}


class Cell {
    constructor(coord, state, swarm) {
    	
    	this.coord = coord
        this.state = state
        this.step = 0
        this.total_neighb = []
        this.swarm_id = swarm.swarm_id
        this.neighb = neighb_list(coord,cell_length)
      //  this.subscribe = cell_subscribe(this,swarm)
	    pubsub_init_node_client(coord, cell_length, ()=>{
	        this.subscribe = cell_subscribe(this,swarm_publish)	        
	    })
    }
}






function build_swarms(){
	var cur_swarm = []
	var maxK = 0;
	//for(var swarm_id=0 ; swarm_id < swarm_length ; swarm_id++){
		var swarm_id = parseInt(process.argv[7])
		var swarm = new Swarm(swarm_id)
		var cells = new Array()
		var cellsDisplay = new Array()
		curK = 0
		for(var i=0 ; i < cell_length ; i++){
			for(var j=0 ; j < cell_length/swarm_length ; j++){
				var k = j + Math.round((swarm_id*cell_length)/swarm_length)
				if ((k <= maxK && k != 0) || k >= cell_length)
					continue;
				cells.push(new Cell({x:i,y:k}, state_from_coord(i,k), swarm))
				cellsDisplay.push({x:i, y:k, swarm_id:swarm_id})
				if (curK < k)
					curK=k
			}
		}
		if(curK > maxK){
			maxK = curK
		}
			
		console.dir(cellsDisplay)
		delete cellsDisplay
		swarm.cells = cells
		cur_swarm.push(swarm)
	//}

	//process.exit(0)
	return cur_swarm
}


function state_from_coord(i,j){
	//return  Math.floor(Math.random() * (10 - 1) + 1)%2
	return (i == 2 && j > 0 && j < cell_length-1)?1:0
}


swarms = build_swarms()


/*


function build_cells(){
	for(var i=0 ; i < cell_length ; i++)
		for(var j=0 ; j < cell_length ; j++)
			cells.push(new Cell({x:i,y:j}, state_from_coord(i,j)))
	return cells
}

pubsub_init_bootstrap(cell_length,()=>{
	cells = build_cells()
})*/