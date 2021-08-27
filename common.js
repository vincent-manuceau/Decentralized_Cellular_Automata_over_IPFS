// Common functions
const {pubsub} = require('./pubsub.js')
const cell_length = parseInt(process.argv[2])
const max_step = 100

var cells = Array()
var t_start = ""
var t_stop = ""

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




function cell_name(coord) {
  return "cell-"+coord.x+"-"+coord.y
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
				neighb.push({x:mu,y:nu})
			}
		}
	return neighb
}

pubsub.progressEmitter.on('test',function(msg){
	var total = cell_length*cell_length + 1
	console.log(msg+"/"+total)

	if (msg == total){
		console.log("LAUNCH")
		
		
		setTimeout(function(){
	  //      pubsub.launch_cells()
	    	console.log("ready ...")
	//    	 pubsub.launch_cells()
	    	 cell_publish(cells[0])
	    	 t_start = new Date()
	    }, 60000);
		//pubsub.pub({x:0,y:0}, [0,0,0,cells[0].state], cells.length)
		//cell_publish(cells[0])
	}
})


/* Cells PubSub */
function cell_publish(cell){
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
}

function isset(x){
	return typeof(x) !== 'undefined'
}

function coord_to_str(coord){
	if (isset(coord.x) && isset(coord.y)){
		return coord.x+"-"+coord.y
	}
	else
		return coord
}

// Processing msg in Neighbour Publishing Version
function process_np(cell, publish_callback){
	//console.dir(cell)

	return function message_processor(msg){	
		if (cell.stopped){	
			return true
			
		}

		const regex = /\[([0-9]+),([0-9]+),([0-9]+),([0-9]+)\]/gm;
					  ///\[([0-9]+),([0-9]+)\]/gm;
//		const str = `'[0,2,2,0][0,2,1,1][0,2,0,1][0,0,1,1][0,0,2,0][0,1,1,0][0,1,2,0]'`;
		let m;
		var is_start = false;
		while ((m = regex.exec(msg)) !== null) {
		    // This is necessary to avoid infinite loops with zero-width matches
		    if (m.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }
		    
		    // The result can be accessed through the `m`-variable.
		    /*m.forEach((match, groupIndex) => {
		        console.log(`Found match, group ${groupIndex}: ${match}`);
		    });*/
		    var curCell = {
		    	step : parseInt(m[1]),
		    	x : parseInt(m[2]),
		    	y : parseInt(m[3]),
		    	state : parseInt(m[4])
		    }

		    if (!isset(cell.msg))
		    {
		    	cell.msg = {}
		    }

		    if (curCell.step >= cell.step){
		    	if (!isset(cell.msg[curCell.step])){
			    	cell.msg[curCell.step] = []
			    }

			    if (curCell.state != 2){
			    	var already_present = false;
			    	for(var i in cell.msg[curCell.step]){
			    		if (cell.msg[curCell.step][i].x == curCell.x &&
			    			cell.msg[curCell.step][i].y == curCell.y ){
			    			already_present = true;
			    			break;
			    		}
			    	}


			    	if (!already_present)
					    cell.msg[curCell.step].push(curCell)
			    }
				else
					is_start = true;
			    //console.dir(m)
//			    console.dir(curCell)
		    } 
		}

//		console.log(cell.coord.x + " " + cell.coord.y+" -> "+msg)
//		console.log("Cell "+cell.coord.x+"-"+cell.coord.y+" received :");
//		console.dir(msg.toString())
		//msg = parseInt(String.fromCharCode(msg[msg.length-1]))
//		console.dir(msg)
		//console.dir("Process cell "+cell.coord.x+" "+cell.coord.y+" msg: "+msg)
		if(is_start){ //Start CA request
			console.log("CA start request received...")
			t_start = new Date()
		//	display_cells()
			pubsub.get_stats({router:true},cell_length,0,(stats)=>{
			//	console.dir({step:cell.step, router: pubsub.pubsub_router, in:stats.in,out:stats.out})
				return publish_callback(cell)
			})			
		}
		else{
			//console.dir(cell.msg)
			cell.alive_neighb = 0//parseInt(msg)
			if (!isset(cell.msg[cell.step]))
				cell.msg[cell.step] = []
			for(var i in cell.msg[cell.step]){
				cell.alive_neighb += cell.msg[cell.step][i].state
			}
			cell.current_neighb = cell.msg[cell.step].length;

			/*if (cell.current_neighb > 8){
				delete cell.subscribe
				console.dir(cell)
				throw new Error(JSON.stringify(cell))
			}*/

			if(cell.current_neighb >= 8){
			//	console.log("8 neighbours !");
				cell.state = ((cell.alive_neighb == 2 && cell.state == 1) 
							 || cell.alive_neighb == 3)?1:0
				cell.alive_neighb = cell.current_neighb = 0
				delete cell.msg[cell.step]
				cell.step++ ;
			//	console.dir(cell.msg)

				if (cell.step % pubsub.stats_interval == 0){
					pubsub.get_stats(cell.coord,cell_length,cell.step,(stats)=>{
						var msg = {step:stats.step,coord:coord_to_str(cell.coord),state:cell.state, /*alive:cell.alive_neighb,current:cell.current_neighb, */in:stats.in,out:stats.out}
						//console.dir(msg)
						log(msg)
						msg = {step:stats.step,coord:cell.coord,state:cell.state, /*alive:cell.alive_neighb,current:cell.current_neighb, */in:stats.in,out:stats.out}
						
						if (cell.step % pubsub.stats_interval == 0)
						pubsub.clients.forEach(function each(client) {
						    client.send(JSON.stringify(msg));
						});
					})
				
					if(cell.coord.x == 0 && cell.coord.y == 0){
					//	display_cells()
						pubsub.get_stats({router:true},cell_length,cell.step,(stats)=>{
						var msg = {step:stats.step, router: pubsub.pubsub_router, in:stats.in,out:stats.out}
						//console.dir(msg)
						log(msg)
						if (cell.step % pubsub.stats_interval == 0)
						pubsub.clients.forEach(function each(client) {
							    client.send(JSON.stringify(msg));
							});
						})
					}	
				}


				if (cell.step == max_step){
					cell.stopped = true
					pubsub.stop(cell,()=>{
						delete cell.subscribe
						t_stop = new Date()
						console.dir({execTime:(t_stop-t_start)/1000})
						//console.log("Cell "+cell.coord.x+" "+cell.coord.y+" : stopped !")
						/*var cellStopped = 0;
						for(var i in cells){
							if (typeof(cells[i].stopped) != 'undefined' && cells[i].stopped)
								cellStopped++
						}
						if (cellStopped == cell_length*cell_length){
							console.dir(cells);

						}*/
						return true
					})
					//console.log("Stopped")
				}
			}			
			//console.dir({alive:cell.alive_neighb,current:cell.current_neighb})
			return publish_callback(cell)
		}
	}
}






// Processing msg in Neighbour Subscribing Version
function process_cp(cell, publish_callback){
	//console.dir(cell)

	return function message_processor(msg){	
		if (cell.stopped){	
			return true
			
		}
	//	console.dir(msg.toString());
		const regex = /\[([0-9]+),([0-9]+),([0-9]+),([0-9]+)\]/gm;
					  ///\[([0-9]+),([0-9]+)\]/gm;
//		const str = `'[0,2,2,0][0,2,1,1][0,2,0,1][0,0,1,1][0,0,2,0][0,1,1,0][0,1,2,0]'`;
		let m;
		var is_start = false;
		while ((m = regex.exec(msg)) !== null) {
		    // This is necessary to avoid infinite loops with zero-width matches
		    if (m.index === regex.lastIndex) {
		        regex.lastIndex++;
		    }
		    
		 
		    var curCell = {
		    	step : parseInt(m[1]),
		    	x : parseInt(m[2]),
		    	y : parseInt(m[3]),
		    	state : parseInt(m[4])
		    }

		    if (!isset(cell.msg))
		    {
		    	cell.msg = {}
		    }

		    if (curCell.state == 2){
			    is_start = true
		    }
		    else{
		   // 	console.dir(curCell)
		    	if (curCell.step >= cell.step){
		    		if (!isset(cell.msg[curCell.step])){
		    			cell.msg[curCell.step] = {}
		    		}

		    		if (!isset(cell.msg[curCell.step][curCell.x])){
		    			cell.msg[curCell.step][curCell.x] = {}
		    		}

		    		if (!isset(cell.msg[curCell.step][curCell.x][curCell.y])){
		    			cell.msg[curCell.step][curCell.x][curCell.y] = curCell.state
		    		}
		    	}
		    }


		    /*if (curCell.step >= cell.step){

			    if (curCell.state != 2 && !isset(cell.msg[curCell.step])){
			    	var already_present = false;
			    	for(var i in cell.msg[curCell.step]){
			    		if (cell.msg[curCell.step][i].x == curCell.x &&
			    			cell.msg[curCell.step][i].y == curCell.y ){
			    			already_present = true;
			    			break;
			    		}
			    	}


			    	if (!already_present)
					    cell.msg[curCell.step].push(curCell)
			    }
				else
					is_start = true;
			    //console.dir(m)
//			    console.dir(curCell)
		    } */
		}

//		console.log(cell.coord.x + " " + cell.coord.y+" -> "+msg)
//		console.log("Cell "+cell.coord.x+"-"+cell.coord.y+" received :");
//		console.dir(msg.toString())
		//msg = parseInt(String.fromCharCode(msg[msg.length-1]))
//		console.dir(msg)
		//console.dir("Process cell "+cell.coord.x+" "+cell.coord.y+" msg: "+msg)
		if(is_start){ //Start CA request
			console.log("CA start request received...")
			t_start = new Date()
		//	display_cells()
			pubsub.get_stats({router:true},cell_length,cell.step,(stats)=>{
			//	console.dir({step:cell.step, router: pubsub.pubsub_router, in:stats.in,out:stats.out})
				return publish_callback(cell)
			})			
		}
		else{
			//console.dir(cell.msg)
			cell.alive_neighb = 0//parseInt(msg)
			cell.current_neighb = 0
			if (!isset(cell.msg[cell.step]))
				cell.msg[cell.step] = {}
			for(var i in cell.msg[cell.step])
				for(var j in cell.msg[cell.step][i])
				{
					cell.alive_neighb += cell.msg[cell.step][i][j]
					cell.current_neighb++
				}
			//cell.current_neighb = cell.msg[cell.step].length;

			/*if (cell.current_neighb > 8){
				delete cell.subscribe
				console.dir(cell)
				throw new Error(JSON.stringify(cell))
			}*/

			if(cell.current_neighb >= 8){
			//	console.log("8 neighbours !");
				cell.state = ((cell.alive_neighb == 2 && cell.state == 1) 
							 || cell.alive_neighb == 3)?1:0
				cell.alive_neighb = cell.current_neighb = 0
				delete cell.msg[cell.step]
				cell.step++ ;
			//	console.dir(cell.msg)

			if (cell.step % pubsub.stats_interval == 0){

				pubsub.get_stats(cell.coord,cell_length,cell.step,(stats)=>{
				//	var msg = {step:stats.step,coord:coord_to_str(cell.coord),state:cell.state, /*alive:cell.alive_neighb,current:cell.current_neighb, */in:stats.in,out:stats.out}
				//	console.dir(msg)
					var msg = {step:stats.step,coord:coord_to_str(cell.coord),state:cell.state, /*alive:cell.alive_neighb,current:cell.current_neighb, */in:stats.in,out:stats.out}
					//console.dir(msg)
					log(msg)
					msg = {step:stats.step,coord:cell.coord,state:cell.state, /*alive:cell.alive_neighb,current:cell.current_neighb, */in:stats.in,out:stats.out}
						

					if (cell.step % pubsub.stats_interval == 0)
					pubsub.clients.forEach(function each(client) {
					    client.send(JSON.stringify(msg));
					});
				})
				
				if(cell.coord.x == 0 && cell.coord.y == 0){
				//	display_cells()
					pubsub.get_stats({router:true},cell_length,cell.step,(stats)=>{
					var msg = {step:stats.step, router: pubsub.pubsub_router, in:stats.in,out:stats.out}
				//	console.dir(msg)
					log(msg)
					if (cell.step % pubsub.stats_interval == 0)
					pubsub.clients.forEach(function each(client) {
						    client.send(JSON.stringify(msg));
						});
					})
				}

				}

				if (cell.step == max_step){
					cell.stopped = true
					pubsub.stop(cell,()=>{
						delete cell.subscribe
						t_stop = new Date()
						console.dir({execTime:(t_stop-t_start)/1000})
					//	console.log("Cell "+cell.coord.x+" "+cell.coord.y+" : stopped !")
						/*var cellStopped = 0;
						for(var i in cells){
							if (typeof(cells[i].stopped) != 'undefined' && cells[i].stopped)
								cellStopped++
						}
						if (cellStopped == cell_length*cell_length){
							console.dir(cells);

						}*/
						return true
					})
					//console.log("Stopped")
				}
			}			
			//console.dir({alive:cell.alive_neighb,current:cell.current_neighb})
			return publish_callback(cell)
		}
	}
}






function display_cells(){
	var line = 0;
	for(var i in cells){
		//console.dir(cells[i])
		if (cells[i].coord.x != line){
			line = cells[i].coord.x
			this.process.stdout.write('\n')
		}
		this.process.stdout.write(cells[i].state + ' ')
	}
	console.log("");
}





exports.cells = cells
exports.cell_length = cell_length
exports.display_cells = display_cells
exports.pubsub_init_bootstrap = pubsub.init_bootstrap
exports.pubsub_init_node = pubsub.init_node
exports.cell_name = cell_name	
exports.neighb_list = neighb_list	
exports.cell_publish = cell_publish	
exports.neighb_publish = neighb_publish
exports.cell_subscribe = cell_subscribe	
exports.neighb_subscribe = neighb_subscribe		
