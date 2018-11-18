

var apiKey='017ec4c4ffcd4846816183870cffc8b8';
var baseMBTAurl = "https://api-v3.mbta.com";

var stops={};
createStopsArray();

function createStopsArray() {
 mbtaSubwayStops = new mbtaSubwayStops();
 mbtaSubwayStops.stops(function(data) {
		for (index in data.data) {
			var obj=data.data[index];
			var attributes=obj["attributes"];
			if (attributes) {
				var id=obj["id"];
				var platformName=attributes["platform_name"];
				var name=attributes["name"];
				if ((typeof platformName == 'string') && (! platformName.match(/Busway/)) && (! platformName.match(/Dudley/)) && (! name.match(/[@]/))){
					mbtaRouteFromStop = new mbtaRoute();
					routeId='';
					mbtaRouteFromStop.route(id, function(id, data2) {
						if (id==70070) console.log(1,data2.data[0]);
						if (data2.data[0]) {
							routeId=data2.data[0]["id"];
							stops[id]={ name: name, platformName: platformName , routeId: routeId};
							if (id==70070) console.log(2,stops[id]);
						}
					});	
				}
			}
		}
	});
	console.log(3,stops[70070]);
}

// retrieve all subway stops (red, orange, blue)
function mbtaSubwayStops() {

  	this.stops = function(callback)  {
    	var requestUrl = baseMBTAurl + '/stops?api_key='+apiKey+'&filter[route_type]=1'+'&format=json';
    	var request = new XMLHttpRequest();
    	request.open("GET", requestUrl, true);
    	request.onload = function() {
      		callback(JSON.parse(this.response));
    	}
    	request.send()
  	}

}

//retrieve all streetcar stops (green)
function mbtaStreetcarStops() {

  	this.stops = function(callback)  {
    	var requestUrl = baseMBTAurl + '/stops?api_key='+apiKey+'&filter[route_type]=0'+'&format=json';
    	var request = new XMLHttpRequest();
    	request.open("GET", requestUrl, true);
    	request.onload = function() {
      		callback(JSON.parse(this.response));
    	}
    	request.send()
  	}

}

function mbtaRoute() {

  	this.route = function(stopId, callback)  {
    	var requestUrl = baseMBTAurl + '/routes?api_key='+apiKey+'&filter[stop]='+stopId+'&format=json';
    	var request = new XMLHttpRequest();
    	request.open("GET", requestUrl, true);
    	request.onload = function() {
      		callback(stopId,JSON.parse(this.response));
    	}
    	request.send()
  	}

}



/* JAK - playing around with predictions*/


function getPredictedTimeForStation(stopId,routeId) {
	// get ID from click/hover element
	var stopId="70070" // Central Square, alewife platform
	if (!routeId) routeId=stops[stopId]["routeId"];
	var nextArrivalTimes='';
	stationPredictions = new mbtaStationPredictions();
	stationPredictions.predictions(stopId,routeId,function(data) {
		for (index in data.data) {
			var obj=data.data[index];
			var attributes=obj["attributes"];
			if (attributes) {
				var arrival_time=attributes["arrival_time"];
				if (typeof arrival_time=="string") {
					var time=arrival_time.split("T")[1];
					time=time.split("-")[0];
					if (nextArrivalTimes=='') {
						nextArrivalTimes=time;
					} else {
						nextArrivalTimes=nextArrivalTimes+', '+time;
						console.log("nextArrivalTimes 1 "+nextArrivalTimes);
					}
				}

			}
		}
		return nextArrivalTimes;
	});
	return nextArrivalTimes;
}

function mbtaStationPredictions() {

  	this.predictions = function(stopId,routeId, callback)  {
    	var requestUrl = baseMBTAurl + '/predictions?api_key='+apiKey+'&filter[route]='+routeId+'&filter[stop]='+stopId+'&format=json';
    	var request = new XMLHttpRequest();
    	request.open("GET", requestUrl, true);
    	request.onload = function() {
      		callback(JSON.parse(this.response));
    	}
    	request.send()
  	}

}

function getPredictedTimeForRoute(routeId) {
	// get ID from click/hover element
	var RouteId="Red";
	mbtaPredictionsForRoute = new mbtaPredictionsForRoute();
	mbtaPredictionsForRoute.predictions(routeId,function(data) {
		for (index in data.data) {
			var obj=data.data[index];
			console.log(4,obj);
			/*
			var attributes=obj["attributes"];
			if (attributes) {
				var platformName=attributes["platform_name"];
				var name=attributes["name"];
				if ((typeof platformName == 'string') && (! platformName.match(/Busway/)) && (! platformName.match(/Dudley/)) && (! name.match(/[@]/))){
					stops[obj["id"]]={ name: name, platformName: platformName };			
				}
			}
			*/
		}
	});
}

function mbtaPredictionsForRoute() {

  	this.predictions = function(routeId, callback)  {
    	var requestUrl = baseMBTAurl + '/predictions?api_key='+apiKey+'&filter[route]='+routeId +'&format=json';
    	var request = new XMLHttpRequest();
    	request.open("GET", requestUrl, true);
    	request.onload = function() {
      		callback(JSON.parse(this.response));
    	}
    	request.send()
  	}

}



/* --JAK */



$(document).ready(function() {
	
	// functionality for when you click/hover on any subway station
	$('.map-holder a').each(function() {
		var id = $(this).attr('id');
		$(this).bind({
   			click: function() {
    			$(this).toggleClass("active");
    			$(".active").not($(this)).removeClass('active');
				if ($(this).hasClass('active')) {
					selectStation();
				} else {
					deselectStation();
				}
   			},
   			mouseover: function() {
   				$(this).css('cursor','pointer').attr('title', hoverText(id));
    		}, 
    		function() {
        		$(this).css('cursor','auto');
   			}
 		});

		adjustTopPadding();	
	});


	/*mbtaClient = new MbtaClient();
	mbtaClient.predictions("Red", function(data) {
		console.log(data);
	});*/

}); //End documentready

function MbtaClient() {

  	this.predictions = function(routeId,callback)  {
    	var requestUrl = baseMBTAurl + '/predictions?api_key='+apiKey+'&filter[route]='+routeId +'&format=json';
    	var request = new XMLHttpRequest();
    	request.open("GET", requestUrl, true);
    	request.onload = function() {
      		callback(JSON.parse(this.response));
    	}
    	request.send()
  	}

}

function getLineData() { // JAK - might not use...

	var request = new XMLHttpRequest();

	request.open('GET', 'https://ghibliapi.herokuapp.com/films', true);
	request.onload = function () {

	  	// Begin accessing JSON data here
	  	var data = JSON.parse(this.response);

	  	if (request.status >= 200 && request.status < 400) {
	    	data.forEach(movie => {
	      	console.log(movie.title);
	    	});
	  	} else {
	    	console.log('error');
		}
	}

	request.send();
}

selectStation = function() {
	var line1data=["predicted delay at porter: 30min","published delay at porter: 10min","predicted delay at harvard: 15min","published delay at harvard: 15min"];
	var line2data=["predicted delay at coolidge corner: 30min","published delay at coolidge corner: 10min","predicted delay at boylston: 15min","published delay at boylston: 15min"];
	var line3data=[];

	if (line1data!='') {
		var line1Section=$('#line1Section');
		var linetype='red'; // get from data
		line1Section.html(sectionText(linetype));
		var line1obj=$('#line1Delays');
		line1obj.html(delaysForLine(line1data));
	}
	if (line2data!='') {
		var line2Section=$('#line2Section');
		var linetype='green'; // get from data
		line2Section.html(sectionText(linetype));
		var line2obj=$('#line2Delays');
		line2obj.html(delaysForLine(line2data));
	}
	if (line3data!='') {
		var line3Section=$('#line3Section');
		var linetype='orange'; // get from data
		line3Section.html(sectionText(linetype));
		var line3obj=$('#line1Delays');
		line3obj.html(delaysForLine(line3data));
	}

	// scroll down to the list of alerts
	if (line1data!='') {
    	$('html,body').animate({
        	scrollTop: $("#line1Section").offset().top},'slow');
	}
}

function deselectStation() {
	$('#line1Section').html('');
	$('#line1Delays').html('');
	$('#line2Section').html('');
	$('#line2Delays').html('');
	$('#line3Section').html('');
	$('#line3Delays').html('');
}

function sectionText(linetype) {
    // Create the list element:
    var section=document.createElement('section');
	var content = document.createTextNode('Delays for the '+linetype+' line:');
	section.appendChild(content);

    return section;
}

function delaysForLine(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

var nextArrivalTimes='';
function hoverText(id) {
	var stopIds=id.split('^');
	var predictedString='Predicted Delay: 20min'; // TODO: get from twitter

	getPredictedTimeForStation(70070);// testing 

	var publishedString='';
	for (index in stopIds) {
		var stopId=stopIds[index];
		if (stops[stopId]) {
			var stop=stops[stopId];
			var platformName=stop["platformName"];
			var routeId=stop["routeId"];
		}
		// TODO: get predicted arrival time

		setTimeout(function(){ nextArrivalTimes=getPredictedTimeForStation(stopId,routeId); }, 3000);
		console.log(5,nextArrivalTimes);

		if (publishedString=='') {
			publishedString='Next published arrivals on the '+platformName+' platform: '+nextArrivalTimes;
		} else {
			publishedString=publishedString+'\n'+'Next published arrival on the '+platformName+' platform: '+nextArrivalTimes;
		}
	}
	var tooltip=predictedString+'\n'+publishedString;
	return tooltip;
};

function adjustTopPadding() {
		var headerheight = $('.header').height();
	  	//console.log(headerheight);
	  	headerheight = headerheight;
		$('.main').css("padding-top", ""+headerheight+"px");	  
	}
