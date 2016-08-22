function map_flow(){
	// the object that will handle Leaflet.js map
	var map,
	// the SVG layer to draw graphics
	svg, g;
	
	var centroid = [43.68915169677964,10.438610315322876];
	var zoomLevel = 12;
	var tilesLayers = [
		L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20],mapbox-water[soft-light])/{z}/{x}/{y}.png",{
			maxZoom: 18,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}),
		// Stamen_TonerLite
		L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
			attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			subdomains: 'abcd',
			minZoom: 0,
			maxZoom: 20,
			ext: 'png'
		})
	];
	
	var trajectories;
	var tesselation;
	
	var transform = d3.geo.transform({
		point: projectPoint
	});

	function projectPoint(x, y) {
		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	};
	
	var d3path = d3.geo.path().projection(transform);
	
	var strk = d3.scale.sqrt()
	.range([0,10]);
	
	
// create a line function that can convert data[] into x and y points
		var line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d,i) { 
				// return the X coordinate where we want to plot this datapoint
				return map.latLngToLayerPoint(new L.LatLng(d.node.lat, d.node.lon)).x 
			})
			.y(function(d) { 
				// return the X coordinate where we want to plot this datapoint
				return map.latLngToLayerPoint(new L.LatLng(d.node.lat, d.node.lon)).y 
			})
	
	
	
	
	function me(selection){
		map = L.map(selection.node())
			.setView(L.latLng(centroid[0],centroid[1]),zoomLevel)
			// .setZoom(19)
			.addLayer(tilesLayers[1]);
			
		svg = d3.select(map.getPanes().overlayPane).append("svg")
			.attr("width", 1520)
			.attr("height", 1520)
			.style("position","relative");
		
		
		g = svg
			.append("g")
			.attr("class", "leaflet-zoom-hide");
	}
	
	me.trajectories = function(_){
		if(!arguments.length) return trajectories;
		trajectories = _;
		
		trajectories.forEach(function(t){
			t.forEach(function(p){
				
			})
		})
		
		var trjs = g.selectAll("g.trj")
		.data(trajectories);
		
		trjs
			.enter()
			.append("g")
			.attr("class","trj")
			.append("path");
		
		var ends = g.selectAll("g.ends")
			.data(trajectories);
			
		ends.enter()
			.append("g")
			.attr("class", "ends");
		
		ends.selectAll("circle")
			.data(function(d){return d.filter(function(e){return e.status!="p"});})
			.enter()
			.append("circle")
			// .filter(function(d){return d.status != "p"})
			.attr("r",3)
			.attr("fill",function(d){
				return d.status=='a'?"#662506":"#fee391"
			});
		
		
		map.on("viewreset", map_reset);
		map_reset();
		
		return me;
	}
	
	me.tesselation = function(_){
		if(!arguments.length) return tesselation;
		tesselation = _;
		
		var centroids = d3.values(tesselation);
		var max = d3.max(centroids, function(d){return d.count});
		strk.domain([0,max]);
		
		
		var seeds = g.append("g")
			.attr("class","seeds")
			.selectAll("circle")
		.data(centroids);
		
		seeds.enter()
			.append("circle")
			.attr("r",4)
		.attr("fill", "#fe9929");
		
		map_reset();
		
		return me;
	}
	
	function map_reset(){
		
		if(trajectories){
		var trjs = g.selectAll("g.trj path");
		trjs.attr("d",line);
		
		
		var ends = g.selectAll("g.ends circle")
			.attr("cx",function(d){
				return map.latLngToLayerPoint(new L.LatLng(d.node.lat, d.node.lon)).x + Math.random()*10 
			})
			.attr("cy",function(d){
				return map.latLngToLayerPoint(new L.LatLng(d.node.lat, d.node.lon)).y 
			})
		}
		
		if(tesselation){
			var seeds = g.selectAll(".seeds circle")
			.attr("cx", function(d){
				return map.latLngToLayerPoint(new L.LatLng(d.lat, d.lon)).x
			})
			.attr("cy", function(d){
				return map.latLngToLayerPoint(new L.LatLng(d.lat, d.lon)).y
			})
			.attr("r", function(d){
				return strk(d.count);
			})
		}
		
		console.log("center", map.getCenter())
	}
	
	
	return me;
}