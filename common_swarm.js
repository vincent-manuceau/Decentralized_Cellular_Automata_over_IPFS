// Common functions
const {pubsub} = require('./pubsub.js')
const swarm_length = parseInt(process.argv[2]) //3
const cell_length = parseInt(process.argv[4]) //3
const max_step = 100

var swarms = Array()


const fs = require('fs');
fs.writeFile('stats.log', "","utf8",(err)=>{if (err) throw err})

function log(m){
	// append data to a file
	console.dir(m);
	fs.appendFile('stats.log', JSON.stringify(m), (err) => {
	    if (err) {
	        throw err;
	    }
	});
}



function cell_name(x,y) {
  return "cell-"+x+"-"+y
}

pubsub.progressEmitter.on('test',function(msg){
	var total = cell_length*cell_length + swarm_length + 1
	console.log(msg+"/"+total)

	if (msg == total){
		console.log("LAUNCH")
		pubsub.launch_swarm()
	}
})


function neighb_list(coord, len){
	var neighb = []
	var {x,y} = coord
	var delta = [-1, 0 , 1]
	for(var alpha in delta)
		for(var beta in delta){
			if(delta[alpha] != 0 || delta[beta] != 0){
				var mu = (len+x+delta[alpha])%len
				var nu = (len+y+delta[beta])%len
				neighb.push({x:mu,y:nu, swarm_id:-1, state:[]})
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
//	console.log("swarm publish:")
	//console.dir(swarm)
	
//	console.dir(msg.toString())
//	console.dir(msg)
	//msg = JSON.parse(msg)
	//console.dir(msg)
//	console.dir({swarm_id :swarm.swarm_id, msg0: msg[0] })
	if (swarm.swarm_id == msg[0])
		(swarm_process(swarm))(msg)
	else if (parseInt(msg[0]) == -1)
		cell_publish(msg,swarm.swarm_id)
	else
		pubsub.pub( msg[0], JSON.stringify(msg), cell_length, swarm.swarm_id)
}

function cell_subscribe(cell, publish){
	//console.dir(cell)
	var sub = pubsub.sub(cell, cell.coord, cell_process, cell_length, publish)
	return sub
}

function cell_publish(msg,origincoord){
/*	console.log("cell publish:")
	console.dir(msg)*/
	pubsub.pub( {x:msg[1], y:msg[2]},
				JSON.stringify(msg),
				cell_length, origincoord)
}

function cell_msg_broadcast(cell,swarm){
/*	console.log("cell_msg_broadcast")
	console.dir({ coord: cell.coord, swarm_id:swarm.swarm_id})

	console.dir(cell.neighb)
*/
	for(i in cell.neighb){
		var cur_nghb = cell.neighb[i]
		/*var cur_step = cell.step
		if (cur_nghb.swarm_id == -1){
			cur_step = cell.swarm_id
		}*/
//		console.dir(cell.swarm_id)
//		console.dir(cur_step)
		var msg = [cur_nghb.swarm_id,cur_nghb.x,cur_nghb.y,
					cell.coord.x,cell.coord.y,cell.state,cell.step,swarm.swarm_id]
		//console.dir(msg)
		swarm_publish(swarm, msg)
	}
}

function not_in(t, x){
	//return true
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
/*		console.log("swarm process:")
		console.dir(msg.toString())*/
		if ((msg.toString())[0] != '[' && (msg.toString())[(msg.toString()).length-1] != ']')
			msg = '['+msg.toString()+']'
		
		const regex = /\[([\-]?[0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([\-]?[0-9]+)\]/gm;
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
			for(var i=1 ; i <= 8 ; i++){
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

			var coord = {x : parseInt(msg[1]), y: parseInt(msg[2])}
//			console.dir({swarm_id:swarm.swarm_id, check_cells:true})
			var cell_id = find_cell_id(swarm.cells, coord)

/*
			var neighbCoord = []
				for(var i in swarm.cells){
					neighbCoord.push(swarm.cells[i].coord)
				}
			console.dir(neighbCoord)
*/


			if (cell_id >= 0) // Incoming message
				(cell_process(swarm.cells[cell_id], swarm))(msg)
			else if (msg[0] >= 0) // Sending to known swarm
				swarm_publish(swarm, msg)
			else
				cell_publish(msg,swarm.swarm_id)	
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
		if (cells[i].coord.x == coord.x && cells[i].coord.y == coord.y){
			return i
		}
	}
//	console.dir({notfound:true, coord:coord})
	return -1
}


function sortArray(n){
	return function sortFunction(a, b) {
	    if (a[n] === b[n]) {
	        return 0;
	    }
	    else {
	        return (a[n] < b[n]) ? -1 : 1;
	    }
	}
}




function cell_process(cell,swarm){
	return function message_processor(msg){
//		console.log("cell process:")
		console.dir({cell_process_coord:cell.coord, msg: msg.toString()})
//		console.dir(msg.toString())


		if (isset(cell.stop)){
			return true
		}

		if ((msg.toString())[0] != '[' && (msg.toString())[msg.length-1] != ']')
			msg = '['+msg.toString()+']'

		const regex = /\[([\-]?[0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([0-9]+),([\-]?[0-9]+)\]/gm;
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
			for(var i=1 ; i <= 8 ; i++){
				curMsg.push(parseInt(m[i]))
			}

			if (not_in(msgList, curMsg)){
				msgList.push(curMsg)
			}

		//	console.dir(m)
		//	console.dir(curMsg)
			//console.dir(msgList)

		}

		//console.dir(msgList)

//		msgList.sort(sortArray(7))
//		msgList.sort(sortArray(0))
		//console.dir(msgList)

		//console.dir(msgList);
		//process.exit(0);
		var toBroadCast = false;
		for(var i in msgList){
			var msg = msgList[i]
		
			var swarm_id = parseInt(msg[0])
			var coord = {x : parseInt(msg[1]), y : parseInt(msg[2])}
			var target = {x: parseInt(msg[3]), y : parseInt(msg[4])}
			var state = parseInt(msg[5])
			var step = parseInt(msg[6])
			var swarm_id_from = parseInt(msg[7])

			if(swarm_id == -1 && swarm_id_from == -1){// Start the CA
				console.dir("Start CA request -> cell_msg_broadcast")
				/*var neighb_id = coord_to_id(cell.neighb, target)
				if(neighb_id >= 0)
					cell.neighb[neighb_id].swarm_id = step*/
				toBroadCast = toBroadCast || true ;
				//cell.step = 0
				//continue;//return true
				break;
			} 
		/*	else if (swarm_id == -1 && cell.step == -1){
				console.dir("First Launch ->")
				swarm_id = swarm_id_from
				step = 0
				cell.step = 0
				toBroadCast = true
			}
			else if (swarm_id == -1){
				swarm_id = step
				step = 0
			}*/

			var neighb_id = coord_to_id(cell.neighb, target)
			cell.neighb[neighb_id].state[step] = state
			
			if (cell.neighb[neighb_id].swarm_id == -1 && swarm_id_from >= 0)
				cell.neighb[neighb_id].swarm_id = swarm_id_from
			

/*			var neighbCoord = []
				for(var i in cell.neighb){
					neighbCoord.push(cell.neighb[i])
				}
			console.dir(neighbCoord)
*/
			/* Tests*/
			/*if (!isset(cell.alive[step])){
				cell.alive[step] = 0
			}
			cell.alive[step] += state
			cell.total_neighb++*/

			if (!isset(cell.total_neighb[step])){
				cell.total_neighb[step] = 0
			}

			cell.total_neighb[step]++

			var {alive, total} = alive_n(cell.neighb, cell.step)
			total = cell.total_neighb[step]
			/*var alive = cell.alive[step]
			var total = cell.total_neighb*/
		console.dir({
				cell:cell.coord, alive:alive, total:total
			})
			if (total >= 8){ // All neighbours received
				cell.state = ((alive == 2 && cell.state == 1) 
								 || alive == 3)?1:0	
				cell.step++
				//reset_neighb(cell)

//				delete cell.alive[step-1]
				cell.total_neighb[step] = 0


				//var msg = {step:cell.step,coord:cell.coord,state:cell.state}
				//	console.dir(msg)

				toBroadCast = toBroadCast || true;
				//cell_msg_broadcast(cell,swarm)
				//return true
			/*	if (cell.step % pubsub.stats_interval == 0)
					pubsub.clients.forEach(function each(client) {
					    client.send(JSON.stringify(msg));
					});
					*/

				/*pubsub.get_stats(cell.coord,cell_length,(stats)=>{
					var msg = {step:cell.step,coord:cell.coord,state:cell.state, in:stats.in,out:stats.out}
				//	console.dir(msg)
					if (cell.step % pubsub.stats_interval == 0)
					pubsub.clients.forEach(function each(client) {
					    client.send(JSON.stringify(msg));
					});
				})*/

				if (cell.step >= max_step)
					cell.stop = true

				if ((cell.step % pubsub.stats_interval) == 0){
					var newStepSwarm = true;

					for(var i in swarm.cells){
						if (swarm.cells[i].coord.x != cell.coord.x || swarm.cells[i].coord.y != cell.coord.y )
						newStepSwarm = newStepSwarm && (cell.step > swarm.cells[i].step) ;
					}
					if(newStepSwarm){
						pubsub.get_stats_swarm(swarm.swarm_id,cell_length,cell.step,swarm.cells.length,(stats)=>{
							var msg = {step:stats.step,coord:stats.swarm_id,nodes:stats.nodes,in:stats.in,out:stats.out}
							log(msg)
							if ((cell.step % pubsub.stats_interval) == 0)
							pubsub.clients.forEach(function each(client) {
							    client.send(JSON.stringify(msg));
							});
						})
					}
				}

				



			}
			else if (cell.step == 0 && total == 1 
				&& !(cell.coord.x == 0 && cell.coord.y == 0)){
				toBroadCast = toBroadCast || true;
			}
			//return false
		}
		if (toBroadCast)
			cell_msg_broadcast(cell, swarm)
	}
}

function coord_to_id(neighb, target){
	for(var i in neighb){
		if (neighb[i].x == target.x && neighb[i].y == target.y){
//			console.log("TARGET FOUND");
//			console.dir(target)
			return i
		}
	}
	/*throw new Error({
			msg:"Coord_to_id not found for target",
			neighb : neighb,
			target : target
		})*/
//	console.log("TARGET NOT FOUND");
//			console.dir(target)
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
exports.pubsub_init_node_client = pubsub.init_node_client	
exports.neighb_list = neighb_list	
exports.swarm_subscribe = swarm_subscribe	
exports.cell_subscribe = cell_subscribe	
