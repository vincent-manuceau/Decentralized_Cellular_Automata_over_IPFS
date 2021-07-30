const {cell_length, display_cells, pubsub_init_bootstrap, 
		pubsub_init_node, neighb_list,neighb_subscribe,
		cell_publish} = require('./common.js')
var {cells} = require('./common.js')


class Cell {
    constructor(coord, state) {
    	pubsub_init_node(coord, cell_length, ()=>{
	    	this.coord = coord
	        this.state = state
	        this.alive_neighb = 0
	        this.current_neighb = 0
	        this.step = 0
	        this.subscribe = neighb_subscribe(this, cell_length, cell_publish)
	    })
    }
}

function state_from_coord(i,j){
	//return  Math.floor(Math.random() * (10 - 1) + 1)%2
	return (i == 2 && j > 0 && j < cell_length-1)?1:0
}

function build_cells(){
	for(var i=0 ; i < cell_length ; i++)
		for(var j=0 ; j < cell_length ; j++)
			cells.push(new Cell({x:i,y:j}, state_from_coord(i,j)))
	return cells
}

pubsub_init_bootstrap(cell_length,()=>{
	cells = build_cells()
})