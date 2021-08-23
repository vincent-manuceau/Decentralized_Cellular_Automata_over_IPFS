const {exec,spawn} = require('child_process')



/* IPFS PubSub */

pubsub = {PeerID : "", IPv4 : "", stats_interval : 1, total_launched:0}

var routerName = []
routerName["f"] = "floodsub"
routerName["g"] = "gossipsub"

pubsub.clients = []; 
pubsub.pubsub_router = routerName[process.argv[3]]//"floodsub" // "floodsub" or "gossipsub"

pubsub.pub = function(cell_coord,msg,cell_length,origin){
/*	console.log("pubsub pub ");
	console.dir({cell_coord:cell_coord,msg:msg,cell_length:cell_length})
*/
	var topic = ''
	if (isset(cell_coord.x) && isset(cell_coord.y))
		topic = 'cell-'+cell_coord.x+'-'+cell_coord.y
	else
		topic = 'swarm-'+cell_coord


	/*console.dir("asking api_port_from_ipfs_id")
	console.dir({
		cell_coord : cell_coord,
		cell_length : cell_length
	})*/

	var api_port = api_port_from_ipfs_id(origin/*cell_coord*/, cell_length)
	//console.log("publishing to "+topic+" msg: "+msg)
/*	spawn('curl',['-X','POST',"http://127.0.0.1:"+api_port_from_ipfs_id(cell_coord,cell_length)+"/api/v0/pubsub/pub"+
	 	"?arg="+topic+"&arg="+encodeURIComponent(msg)]).unref();
*/
	const https = require('http')

	const postData = JSON.stringify({
	  topic: topic,
	  arg : encodeURIComponent(msg)
	})
/*
	const options = {
	  hostname: '127.0.0.1',
	  port: api_port_from_ipfs_id(cell_coord,cell_length),
	  path: "/api/v0/pubsub/pub?arg="+topic+"&arg="+encodeURIComponent(msg),
	 //	"?arg="+topic+"&arg="+encodeURIComponent(msg)],
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': data.length
	  }
	}

*/
	const options = {
	  hostname: '127.0.0.1',
	  port: api_port_from_ipfs_id(origin,cell_length),
	  path: //'/api/v0/pubsub/pub',
	  "/api/v0/pubsub/pub?arg="+topic+"&arg="+encodeURIComponent(msg),
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': Buffer.byteLength(postData)
	  }
	};
	//console.log("IPFS PUB :");

	const req = https.request(options, res => {
//	console.log(`statusCode: ${res.statusCode}`)

	})

	console.dir(options)


	req.on('error', error => {
		console.error(error)
		throw new Error(error)
	})
	req.write(postData);
	req.end();

}

pubsub.sub = function(cell, target_coord, process, cell_length, callback, swarm_id){
	//console.dir(cell)
	//console.log("Cell subscribing for "+'cell-'+cell.coord.x+'-'+cell.coord.y)
	//console.log("subscribed to "+cell_name(cell.coord))

	var sub = {}
	if (isset(target_coord.x) && isset(target_coord.y)){ 
		sub = spawn('./ipfs',['pubsub','sub','cell-'+target_coord.x+'-'+target_coord.y], 
		{env: { IPFS_PATH: './.ipfs'+ipfs_id_from_cell_coord(swarm_id/*target_coord*/,cell_length) , LIBP2P_FORCE_PNET:1 }})	
	}
	else{ // It's a Swarm !
		sub = spawn('./ipfs',['pubsub','sub','swarm-'+target_coord], 
		{env: { IPFS_PATH: './.ipfs'+ipfs_id_from_cell_coord(swarm_id/*target_coord*/,cell_length) , LIBP2P_FORCE_PNET:1 }})	

	}
	sub.stdout.on('data',process(cell,callback))
	return sub
}



pubsub.get_stats = function(coord, cell_length, step, callback){
	var stats = spawn('./ipfs',['stats','bw'], 
		{env: { IPFS_PATH: './.ipfs'+ipfs_id_from_cell_coord(coord,cell_length) , LIBP2P_FORCE_PNET:1 }});
	var statsData = "";
	stats.stdout.on('data',(chunk)=>{
		statsData += chunk
	})
	stats.stdout.on('end',()=>{
		const regex = /TotalIn: ([0-9]*[\.[0-9]+]?) ([kMGT]?)B\nTotalOut: ([0-9]*[[\.]?[0-9]+]?) ([kMGT]?)B/gm;
		/*const str = `TotalIn: 77.232 kB
		TotalOut: 76 B
		RateIn: 46 B/s
		RateOut: 4.5 kB/s`;*/
		let m = regex.exec(statsData);
		//console.dir(m)
		var unitTab = {
			'': 1,
			'k':1000,
			'M':1000000,
			'G':1000000000,
			'T':1000000000000
		}
		//console.dir(statsData)
		//console.dir(m)

		var res = {step:step,
			in : parseFloat(m[1])*unitTab[m[2]], 
			out : parseFloat(m[3])*unitTab[m[4]]}

		//console.dir(res)
		return callback(res) ;
	})
}


pubsub.get_stats_swarm = function(coord, cell_length, step, totalSwarmCells, callback){
	var stats = spawn('./ipfs',['stats','bw'], 
		{env: { IPFS_PATH: './.ipfs'+ipfs_id_from_cell_coord(coord,cell_length) , LIBP2P_FORCE_PNET:1 }});
	var statsData = "";
	stats.stdout.on('data',(chunk)=>{
		statsData += chunk
	})
	stats.stdout.on('end',()=>{
		const regex = /TotalIn: ([0-9]+[\.[0-9]+]?) ([kMGT]?)B\nTotalOut: ([0-9]+[[\.]?[0-9]+]?) ([kMGT]?)B/gm;
		/*const str = `TotalIn: 77.232 kB
		TotalOut: 76 B
		RateIn: 46 B/s
		RateOut: 4.5 kB/s`;*/
		let m = regex.exec(statsData);
		//console.dir(m)
		var unitTab = {
			'': 1,
			'k':1000,
			'M':1000000,
			'G':1000000000,
			'T':1000000000000
		}

		var res = {in : parseFloat(m[1])*unitTab[m[2]], 
			out : parseFloat(m[3])*unitTab[m[4]],
			swarm_id:coord,
			step: step,
			nodes : totalSwarmCells
		}

		//console.dir(res)
		return callback(res) ;
	})
}



pubsub.stop = function(cell,callback){
	var stop = spawn("kill",[cell.subscribe.pid])
	stop.stdout.on('end',()=>{
		return callback()
	})
}

function launch_ipfs_client_node(ipfs_id, PeerID, IPv4,pubsub_router,callback){
	//console.log("ipfs client "+ipfs_id)
	var api_port = 5001 + ipfs_id + 1 ;
	var gateway_port = 8080 + ipfs_id + 1;
	var swarm_port = 4001 + ipfs_id + 1 ;

	console.dir({ipfs_id:ipfs_id, api_port:api_port, gateway_port:gateway_port, swarm_port:swarm_port})

	//process.stdout.write("Initializing ipfs client node ... ")
	//var system_path = process.env.PATH
	var clean_conf = spawn('./ipfs_clean_conf.sh',[ipfs_id])
	clean_conf.stderr.on('data', function (msg) { throw new Error(msg) })
	clean_conf.stdout.on('end', function () {

		const IPFS_PATH = './.ipfs'+ipfs_id

		var init = spawn('./ipfs', ['init'], {
		  env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})

		var data = ''
		init.stdout.on('data', function (chunk) {
		  data += chunk
		})
		init.stderr.on('data', function (msg) { console.dir({path:IPFS_PATH}); throw new Error(msg)})

		init.stdout.on('end', function () {
			//console.log("update ports")
			var update_ports = spawn('./ipfs_update_ports.sh',[api_port,gateway_port,swarm_port,ipfs_id, pubsub.pubsub_router])
			update_ports.stderr.on('data', function (msg) { throw new Error(msg) })
			update_ports.stdout.on('end', function () {
			
				var rm_bootstrap = spawn('./ipfs', ['bootstrap','rm','--all'], {
			 			env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})
				var dataRM = ''
				rm_bootstrap.stdout.on('data', function (chunk) {
					//console.log("rm bootstrap")
					//console.dir(chunk.toString())
					dataRM += chunk

				})
				rm_bootstrap.stderr.on('data', function (msg) { throw new Error(msg) })

				rm_bootstrap.stdout.on('end', function () {	
					//console.log(dataRM)

				
					
					var add_bootstrap = spawn('./ipfs', ['bootstrap','add','/ip4/'+IPv4+'/tcp/4001/ipfs/'+PeerID], {
			 			env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})
				//	add_bootstrap.stderr.on('data', function (msg) { throw new Error(msg) })
					add_bootstrap.stdout.on('end', function () {	

					//	console.dir(data)
						var ipfs = spawn('./ipfs', ['christ','--enable-pubsub-experiment'], {
						  env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})

						var data = ''
						ipfs.stdout.on('data', function (chunk) {
						  data += chunk
						  //console.log(chunk.toString());
						 // console.dir(chunk.toString().includes('Christ is ready\n'))
						  if (chunk.toString().includes('Christ is ready'))
						  {
						  	return callback(ipfs_id);
						  }
						})
						//ipfs.stderr.on('data', function (msg) { throw new Error(msg) })

						ipfs.stdout.on('end', function () {
							console.log("Ipfs client node "+ipfs_id+" stopped")	
							console.dir(data)
							launch_ipfs_client_node(ipfs_id, PeerID, IPv4,pubsub_router,callback)
						})
					})
				})
			})
		})
	})
}





/*
var os = require('os');

var networkInterfaces = os.networkInterfaces();

console.log(networkInterfaces);*/

function get_local_network_ipv4(){
	const { networkInterfaces } = require('os');
	const nets = networkInterfaces();
	for (const name of Object.keys(nets))
	    for (const net of nets[name])
	        if (net.family === 'IPv4' && !net.internal) 
	            return net.address	
}

function ipfs_id_from_cell_coord(coord,cell_length){
	if (isset(coord.router))
		return ""
	else if (!isset(coord.x) && !isset(coord.y)){ // It's a Swarm !	
		return (/*cell_length*cell_length + */parseInt(coord) + 10000)
	}
	else{
	//	console.dir(coord)
	//	console.log("id => " + (coord.x + cell_length*coord.y))
		return (parseInt(coord.x) + cell_length*parseInt(coord.y) + 20000);
	}
	
}

function api_port_from_ipfs_id(coord,cell_length){
	return 5001 + ipfs_id_from_cell_coord(coord,cell_length) + 1
}
        
//console.dir(get_local_network_ipv4())

function launch_ipfs_bootstrap_node(pubsub_router, cell_length, swarm_length, callback){
	process.stdout.write("Initializing bootstrap node ... ")
	var clean_conf = spawn('./ipfs_clean_conf.sh',["*"])
	clean_conf.stderr.on('data', function (msg) { throw new Error(msg) })
	clean_conf.stdout.on('end', function () {
		//echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > ~/.ipfs/swarm.key
		//var system_path = process.env.PATH
		const IPFS_PATH = './.ipfs'
		var init = spawn('./ipfs', ['init'], {
		  env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})

		var data = ''
		init.stdout.on('data', function (chunk) {
		  data += chunk
		})
		init.stderr.on('data', function (msg) { throw new Error(msg) })
		init.stdout.on('end', function () {
			//console.dir(data)
			var gen_key = spawn('./generate_swarm_key.sh',[pubsub_router])
			gen_key.stderr.on('data', function (msg) { throw new Error(msg) })
			gen_key.stdout.on('end', function () {

				var rm_bootstrap = spawn('./ipfs', ['bootstrap','rm','--all'], {
		 			env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})

				var dataRM = ''
				rm_bootstrap.stdout.on('data', function (chunk) {
				  dataRM += chunk
				})
			//	rm_bootstrap.stderr.on('data', function (msg) { throw new Error(msg) })

				rm_bootstrap.stdout.on('end', function () {	
					//console.dir(dataRM)
					var peer = spawn('./ipfs', ['config','show'], {
			  			env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})
					
					var data2 = ''

					peer.stdout.on('data', function (chunk) {
					  data2 += chunk.toString()
					//	console.dir(chunk.toString())
					})
					peer.stderr.on('data', function (msg) { throw new Error(msg) })
					peer.stdout.on('end', function () {
						const regex = /"PeerID": "([0-9a-z-A-Z]+)"/gm;
						let m = regex.exec(data2)
						//console.dir(m)		
					  	var PeerID = m[1];
					  	//console.dir(PeerID)
					  	var IPv4 = get_local_network_ipv4()

					  	var add_bootstrap = spawn('./ipfs', ['bootstrap','add','/ip4/'+IPv4+'/tcp/4001/ipfs/'+PeerID], {
				 			env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})
						add_bootstrap.stderr.on('data', function (msg) { throw new Error(msg) })
						add_bootstrap.stdout.on('end', function () {	


						  	var ipfs = spawn('./ipfs', ['christ','--enable-pubsub-experiment'], {
							  env: {IPFS_PATH: IPFS_PATH, LIBP2P_FORCE_PNET:1}})
						  	ipfs.stderr.on('data', function (msg) { throw new Error(msg) })
							var data = ''
							var dataErr = ''
							ipfs.stderr.on('data', function (chunk) {
								dataErr += chunk
								process.stdout.write("KO !\n");
								throw new Error(dataErr)
							})

							ipfs.stdout.on('data', function (chunk) {
							  data += chunk
							 // console.log(chunk.toString());
							  //console.dir(chunk.toString().includes('Christ is ready\n'))
							  if (chunk.toString().includes('Christ is ready'))
							  {
							  	return callback({PeerID:PeerID,IPv4:IPv4})
							  }
							})

							ipfs.stdout.on('end', function () {
								console.log("Ipfs bootstrap node stopped")	
								console.dir(data)
							})


							const WebSocket = require('ws')
 
							const wss = new WebSocket.Server({ port: 8079 })
							pubsub.clients = [];

							wss.on('connection', ws => {
								pubsub.clients.push(ws)
							  /*ws.on('message', message => {
							   // console.log(`Received message => ${message}`)
							  })*/
							  wsMsg = {
							  	 		connection:true, 
			  							length:cell_length, 
			  							router: pubsub.pubsub_router, 
			  							stats_interval : pubsub.stats_interval,
			  							swarm_length: swarm_length
				  						}
							  ws.send(JSON.stringify(wsMsg))
							})


						})
					})
				})
			})
		})
	})
}


pubsub.launch_swarm = function(){
	return spawn('npm', ['run','sw_start'])
}

pubsub.launch_cells = function(){
	return spawn('npm', ['start'])
}

pubsub.init_bootstrap = function(cell_length, swarm_length, callback){
	launch_ipfs_bootstrap_node(pubsub.pubsub_router, cell_length, swarm_length, (bootstrap)=>{
	process.stdout.write("OK !\n");
	pubsub.total_launched++;
	console.dir(bootstrap)
		pubsub.PeerID = bootstrap.PeerID
		pubsub.IPv4 = bootstrap.IPv4
		return callback();
	});
}

var events = require('events');
pubsub.progressEmitter = new events.EventEmitter();


pubsub.init_node = function(cell_coord, length, callback){
	//console.log("INIT NODE coord:")
	
	//console.dir(length)
	

	ipfs_id = ipfs_id_from_cell_coord(cell_coord, length) //cell_coord.x + length*cell_coord.y
	/*console.log("ipfs_ID :")
	console.dir()
*/	console.dir({init_node:true, coord:cell_coord, ipfs_id: ipfs_id})
	launch_ipfs_client_node(ipfs_id, pubsub.PeerID, pubsub.IPv4, pubsub.pubsub_router, (ipfs_id)=>{
		var str = "";
		if (!isset(cell_coord.x) && !isset(cell_coord.y)){
			str = "swarm_id:"+cell_coord
		}
		else {
			str = "x:"+cell_coord.x+" y:"+cell_coord.y
		}
		process.stdout.write("Initializing ipfs client node "+ipfs_id+" "+str+" ... OK !\n");
		pubsub.total_launched++;
		//console.log("total launched : "+pubsub.total_launched)
		// require events module
		//const Event = require("events");

		// create a new event
		//const event = new Event();

		//event.emit("test");
		pubsub.progressEmitter.emit('test',pubsub.total_launched)
		return callback();
	})
}






pubsub.init_node_client = function(cell_coord, length, callback){
	//console.log("INIT NODE coord:")
	
	//console.dir(length)
	//console.dir(process.argv)
	var PeerID = (process.argv[5])
	var IPv4 = (process.argv[6])

	//console.dir({PeerID:PeerID, IPv4:IPv4})


	ipfs_id = ipfs_id_from_cell_coord(cell_coord, length) //cell_coord.x + length*cell_coord.y
	/*console.log("ipfs_ID :")
	console.dir()
*/	console.dir({init_node:true, coord:cell_coord, ipfs_id: ipfs_id})
	launch_ipfs_client_node(ipfs_id, PeerID, IPv4, pubsub.pubsub_router, (ipfs_id)=>{
		var str = "";
		if (!isset(cell_coord.x) && !isset(cell_coord.y)){
			str = "swarm_id:"+cell_coord
		}
		else {
			str = "x:"+cell_coord.x+" y:"+cell_coord.y
		}
		process.stdout.write("Initializing ipfs client node "+ipfs_id+" "+str+" ... OK !\n");
		pubsub.total_launched++;
		//console.log("total launched : "+pubsub.total_launched)
		// require events module
		//const Event = require("events");

		// create a new event
		//const event = new Event();

		//event.emit("test");
		pubsub.progressEmitter.emit('test',pubsub.total_launched)
		return callback();
	})
}






/*
launch_ipfs(0,(msg)=>{
	console.log("IPFS IS FULLY LAUNCHED "+msg)

})*/
/*
launch_ipfs_bootstrap_node((bootstrap)=>{
	process.stdout.write("OK !\n");
	console.dir(bootstrap)
	

	for(var i=0; i < 10 ; i++){
		launch_ipfs_client_node(i, bootstrap.PeerID, bootstrap.IPv4,(msg)=>{
		process.stdout.write("OK !\n");
		console.log("IPFS node "+i+" "+msg)
	})

	}
});
*/

function isset(a){
	return typeof(a) !== 'undefined'
}




exports.pubsub = pubsub ;