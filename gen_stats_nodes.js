const regex = /{"step":([0-9]+),.*?,"in":([0-9]+),"out":([0-9]+)}/gm;


fs = require('fs');
fs.readFile('stats.log', 'utf8', function (err,str) {
  if (err) {
    return console.log(err);
  }
  console.log(str);






	let m;

	function isset(a){
		return typeof(a) !== 'undefined'
	}

	var t = []

	while ((m = regex.exec(str)) !== null) {
	    // This is necessary to avoid infinite loops with zero-width matches
	    if (m.index === regex.lastIndex) {
	        regex.lastIndex++;
	    }
	    
	    // The result can be accessed through the `m`-variable.
	  /*  m.forEach((match, groupIndex) => {
	        console.log(`Found match, group ${groupIndex}: ${match}`);


	    });*/

	    if (!isset(t[parseInt(m[1])])){
	    	t[parseInt(m[1])] = []
	    }

	    t[parseInt(m[1])].push(parseInt(m[2])+parseInt(m[3]))
	}

	//console.dir(t)

	var u = []
	for(var i in t){
		var curSum = 0
		for(var j in t[i]){
			curSum += t[i][j]
		}
		u.push({s: i , t:(curSum/(t[i].length*i))})
		console.dir({i:i, tilength:t[i].length})
	}

	console.dir(u)
	curSum = 0;
	for(var i in u){
		curSum += u[i].t
	}

	console.dir(u[u.length-1])
	console.dir(curSum/u.length)

});


