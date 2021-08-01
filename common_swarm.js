// Common functions
const {pubsub} = require('./pubsub.js')
const swarm_length = 2
const cell_length = 2
const max_step = 1000

var swarms = Array()

function cell_name(x,y) {
  return "cell-"+x+"-"+y
}

function neighb_list(coord, len){
	var neighb = []
	var {x,y} = coord
	var delta = [-1, 0 , 1]
	for(var alpha in delta)
		for(var beta in delta){
			if(delta[alpha] != 0 || delta[beta] != 0){
				var mu = (len+x+delta[alpha])%len
				var nu = (len+y+delta[beta])%len
				neighb.push({x:mu,y:nu, swarm_id:-1})
			}
		}
	return neighb
}

/* Swarm PubSub */
function swarm_subscribe(swarm, publish){
	//console.dir(cell)
	var sub = pubsub.sub(swarm, swarm.swarm_id, swarm_process, cell_length, publish)
	return sub
}
function swarm_publish(swarm,msg){
	console.log("swarm publish:")
	//console.dir(swarm)
	
	console.dir(msg.toString())
	console.dir(msg)
	//msg = JSON.parse(msg)
	//console.dir(msg)
	if (swarm.swarm_id == msg[0])
		(swarm_process(swarm))(msg)
	else
		pubsub.pub( swarm.swarm_id, JSON.stringify(msg), cell_length)
}

function cell_subscribe(cell, publish){
	//console.dir(cell)
	var sub = pubsub.sub(cell, cell.coord, cell_process, cell_length, publish)
	return sub
}

function cell_publish(msg){
	console.log("cell publish:")
	console.dir(msg)
	pubsub.pub( {x:msg[1], y:msg[2]},
				JSON.stringify(msg),
				cell_length)
}

function cell_msg_broadcast(cell,swarm){
	console.log("cell_msg_broadcast")
	console.dir({ coord: cell.coord, swarm_id:swarm.swarm_id})

	for(i in cell.neighb){
		var cur_nghb = cell.neighb[i]
		var cur_step = cell.step
		if (cur_nghb.swarm_id == -1){
			cur_step = cell.swarm_id
		}
		console.dir(cell.swarm_id)
		console.dir(cur_step)
		var msg = [cur_nghb.swarm_id,cur_nghb.x,cur_nghb.y,
					cell.coord.x,cell.coord.y,cell.state,cur_step]
		console.dir(msg)
		swarm_publish(swarm, msg)
	}
}

function not_in(t, x){
	for(i in t){
		var cur_test = true
		for(j in x){
			cur_test = cur_test && (t[i][j] == x[j])
		}
		if (cur_test)
			return false
	}
	return true
}


function swarm_process(swarm){
	return function message_router(msg){
		console.log("swarm process:")
		console.dir(msg.toString())

		const regex = /\[([\-]?[0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+)\]/gm;
		let m;
		var msgList = []
		while ((m = regex.exec(msg)) !== null) {
		    // This is necessary to avoid infinite loops with zero-width matches
		    if (m.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }
		    /* [cur_nghb.swarm_id,cur_nghb.x,cur_nghb.y,
					cell.coord.x,cell.coord.y,cell.state,cell.step]*/
			var curMsg = []
			for(var i=1 ; i <= 7 ; i++){
				curMsg.push(parseInt(m[i]))
			}

			if (not_in(msgList, curMsg)){
				msgList.push(curMsg)
			}

	//		console.dir(m)
	//		console.dir(curMsg)
			//console.dir(msgList)

		}

		//console.dir(msgList);
		//process.exit(0);

		for(var i in msgList){
			var msg = msgList[i]

			var coord = {x : msg[1], y: msg[2]}
			var cell_id = find_cell_id(swarm.cells, coord)
			if (cell_id >= 0) // Incoming message
				(cell_process(swarm.cells[cell_id], swarm))(msg)
			else if (msg[0] >= 0) // Sending to known swarm
				swarm_publish(swarm, msg)
			else
				cell_publish(msg)	
		}

		/*msg = JSON.parse(msg.toString())
		var coord = {x : msg[1], y: msg[2]}
		var cell_id = find_cell_id(swarm.cells, coord)
		if (cell_id >= 0) // Incoming message
			return (cell_process(swarm.cells[cell_id], swarm))(msg)
		else if (msg[0] >= 0) // Sending to known swarm
			return swarm_publish(swarm, msg)
		else
			return cell_publish(msg)		*/
	}
}

function find_cell_id(cells, coord){
	for(var i in cells){
		if (cells[i].x == coord.x && cells[i].y == coord.y){
			return i
		}
	}
	return -1
}

function cell_process(cell,swarm){
	return function message_processor(msg){
		console.log("cell process:")
		console.dir(msg.toString())


		const regex = /\[([\-]?[0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+)\]/gm;
		let m;
		var msgList = []
		while ((m = regex.exec(msg)) !== null) {
		    // This is necessary to avoid infinite loops with zero-width matches
		    if (m.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }
		    /* [cur_nghb.swarm_id,cur_nghb.x,cur_nghb.y,
					cell.coord.x,cell.coord.y,cell.state,cell.step]*/
			var curMsg = []
			for(var i=1 ; i <= 7 ; i++){
				curMsg.push(m[i])
			}

			if (not_in(msgList, curMsg)){
				msgList.push(curMsg)
			}

		//	console.dir(m)
		//	console.dir(curMsg)
			//console.dir(msgList)

		}

		//console.dir(msgList);
		//process.exit(0);

		for(var i in msgList){
			var msg = msgList[i]
		
			var swarm_id = parseInt(msg[0])
			var coord = {x : parseInt(msg[1]), y : parseInt(msg[2])}
			var target = {x: parseInt(msg[3]), y : parseInt(msg[4])}
			var state = parseInt(msg[5])
			var step = parseInt(msg[6])
			
			if(swarm_id == -1){// Start the CA
				console.dir("Start CA request -> cell_msg_broadcast")
				var neighb_id = coord_to_id(cell.neighb, target)
				if(neighb_id >= 0)
					cell.neighb[neighb_id].swarm_id = step
				cell_msg_broadcast(cell, swarm)
				return true
			} 

			var neighb_id = coord_to_id(cell.neighb, target)
			cell.neighb[neighb_id].swarm_id = swarm_id
			cell.neighb[neighb_id].state[step] = state
			var {alive, total} = alive_n(cell.neighb, cell.step)
			if (total == 8){ // All neighbours received
				cell.state = ((alive == 2 && cell.state == 1) 
								 || alive == 3)?1:0	
				cell.step++
				reset_neighb(cell)
				cell_msg_broadcast(cell,swarm)
				//return true
			}
			//return false
		}
	}
}

function coord_to_id(neighb, target){
	for(var i in neighb){
		if (neighb[i].x == target.x && neighb[i].y == target.y)
			return i
	}
	/*throw new Error({
			msg:"Coord_to_id not found for target",
			neighb : neighb,
			target : target
		})*/
	return -1
}

function alive_n(neighb, step){
	var alive = 0
	var total = 0
	for(var i in neighb){
		if (isset(neighb[i].state[step])){
			total++
			if (neighb[i].state[step] == 1)
				alive++
		}
	}
	return {alive, total}
}


function reset_neighb(cell){
	for(var i in cell.neighb){
		if (isset(cell.neighb[i].state[cell.step-1])){
			delete cell.neighb[i].state[cell.step-1]
		}
	}
}




/* Cells PubSub */
/*function cell_publish(cell){
	pubsub.pub( cell.coord,
				JSON.stringify([cell.step,cell.coord.x,cell.coord.y,cell.state]),
				cell_length)
}

function neighb_publish(cell){
	//console.log("publishing "+cell.coord.x+" "+cell.coord.y)
	//console.dir(cell.neighb)
	for(var i in cell.neighb){
		//console.dir(i)
		pubsub.pub( cell.neighb[i],
					JSON.stringify([cell.step,cell.coord.x,cell.coord.y,cell.state]),
					cell_length)
	}
}

function cell_subscribe(cell, publish){
	//console.dir(cell)
	var sub = pubsub.sub(cell, cell.coord, process_np, cell_length, publish)
	return sub
}

function neighb_subscribe(cell,length, publish){
	var neighb = neighb_list(cell.coord, length)
	var sub = Array(8)
	for(var i in neighb)
		sub[i] = pubsub.sub( cell, neighb[i], process_cp, cell_length, publish)
		//cell_subscribe(neighb[i],publish)
	return sub
}*/

function isset(x){
	return typeof(x) !== 'undefined'
}

function display_cells(){
	// todo
}


exports.swarms = swarms
exports.swarm_length = swarm_length
exports.cell_length = cell_length
exports.display_cells = display_cells
exports.pubsub_init_bootstrap = pubsub.init_bootstrap
exports.pubsub_init_node = pubsub.init_node	
exports.neighb_list = neighb_list	
exports.swarm_subscribe = swarm_subscribe	
exports.cell_subscribe = cell_subscribe	
