// The Google Map.
var map; 

var geoJsonOutput;
var downloadLink;

var mapContainer;

//data box variables
var dataBox;
var dataContainer;

//selection variables
var selected = [];
var isSelected = false;
var feat;
var index=0;

//value of the rating of the feature
var value = "unknown";

function init() {
  map = new google.maps.Map(document.getElementById('map-holder'), {
    center: {lat: 39.623, lng: 19.914},
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeId: 'satellite'
  });
	
  map.data.setControls(['Point', 'LineString', 'Polygon']);
  map.data.setStyle({
  	editable: true,
  	draggable: true,
  	clickable: true
  });
	
  //sets the style in the features
  map.data.setStyle(function(feature) {
	//default color
        var color = "white";
	// sees if the rating and the color isnt null so it can proseed
        if (feature.getProperty("Rating") == null && feature.getProperty("Color") == null) {
            feature.setProperty("Rating", value);
	    feature.setProperty("Color", value);
        }
	//looks if the color is null and if it is then it sets it to the right one
        if (feature.getProperty("Color") != value) {
            var color = feature.getProperty("Color");
        }
        return ({
            strokeColor: color,
            strokeWeight: 4
        });
    });
	
  //when the user clicks on a feature
  map.data.addListener("click",function(clicking){	
	feat= clicking.feature; 	
	//sets the boolean to true if the current selected was already selected.
	//sets the boolean to false if the current one wasnt found in the selected array.
 	for(i=0;i<=index;i++){
		if(feat === selected[i]){			  
			isSelected = true;
			//if it finds that it was already selected it breaks.
			break;
		}else{
			isSelected = false;
		}
	}
	//if the boolean is false then it procceds to select the feature and adds in the array.
	//if not then it resets the style of the selected object(de-selects it).
	if(isSelected == false){
		//visualisation of the selection.
		map.data.overrideStyle(feat , {strokeWeight: 8});
		//puts the currently selected feature in an array.
		selected[index] = feat;
		//increases the size of the array.
		index++;
	}else{
		var max=index;
		//loops as many times as there is points in the array
		for(n=0;n<=max;n++){
			//a statement that finds in the selected array the one that is similar to the currently selected
			if(feat === selected[n]){
				//when it finds it ,it sets the selected array in the point its right now to zero
				selected[n] = 0;	
				index--;
				//decreses the size of the array
				//resets the visualisation of the selection.
				map.data.revertStyle(feat);
				//breaks out of the
				break;
			}						
		}
	}
  });
	
  bindDataLayerListeners(map.data);
  
  //load the json file	
  map.data.loadGeoJson("data/2016148_review.geojson");	
	
  // Retrieve HTML elements.
  dataContainer = document.getElementById('data-container');
  dataBox = document.getElementById('dataBox');	
	
  mapContainer = document.getElementById('map-holder');
  geoJsonOutput = document.getElementById('geojson-output');
  downloadLink = document.getElementById('download-link');
	
  displayStyle = document.getElementById('geojson-output').style.display;
	
  resize();
	
  [mapContainer, dataContainer].forEach(function(container) {
    google.maps.event.addDomListener(container, 'drop', handleDrop);
    google.maps.event.addDomListener(container, 'dragover', showDataBox);
  });

  google.maps.event.addDomListener(mapContainer, 'dragstart', showDataBox);
  google.maps.event.addDomListener(mapContainer, 'dragenter', showDataBox);	
	
  google.maps.event.addDomListener(dataContainer, 'dragend', hideDataBox);
  google.maps.event.addDomListener(dataContainer, 'dragleave', hideDataBox);
	
  google.maps.event.addDomListener(window, 'resize', resize);
}

//displays the data of the map(json file)
function showButton() {
    var my_disply = document.getElementById('geojson-output').style.display;
    if(my_disply === "none"){
        	document.getElementById('geojson-output').style.display = "block";
	}else{
        	document.getElementById('geojson-output').style.display = "none";
	}
}

google.maps.event.addDomListener(window, 'load', init);

//rating function is changing the properties of the feature
function ratingFunction(rating,col,feature) {
	feature.setProperty("Rating",rating);
	feature.setProperty("Color",col);
	map.data.overrideStyle(feature,{strokeWeight:4});
}

function Rating(rate){
	//sets the max of the interations that will be done
	var max=index;
	var col;
	var rate=rate;
	//a swich that changes the color relevant to the rating
	switch(rate){
		case 1:
			col = 'red';
			break;
		case 2:
			col = 'yellow';
			break;
		case 3:
			col = 'white';
			break;
		case 4:
			col = 'blue';
			break;
		case 5:
			col = 'green';
			break;	
	}
	//in each rating function a for loop is constructed so all the features 
	//that have been selected by the user are getting their properties changed
	for(i=0;i<=max-1;i++){
		//if statement to see if the array is empty
		if(max == 0){
			bootbox.alert({
    			message: "Nothing is selected!",
    			size: 'small',
    			backdrop: true
			});
			break;
		}
		var currentFeature = selected[i];
		ratingFunction(rate,col,currentFeature);
		selected[i]=0;
		index--;
	}
}

//clear function
//selectes all the features
//removes them
function Clear(){
	bootbox.confirm({
        message: "Are you sure?",
        buttons: {
            confirm: {label: 'Yes'},
            cancel: {label: 'No'}
        },
        callback: function (result) {
            if (result == true) {
                map.data.forEach(function(feature) {
                    map.data.remove(feature);
                    selected[1]=0;
                    index=0;
                });
            }
        }
	});
}

//deletes the selected.
//loops and deletes all the points in the array.
//resets the size of the array.
function DeleteSel(){
	var max=index;
	for(i=0;i<=max;i++){
		console.log("index: "+index);
		map.data.remove(selected[i]);
		index--;
	}
}

function showDataBox(e) {
  e.stopPropagation();
  e.preventDefault();
  dataContainer.className = 'visible';
  return false;
}

function hideDataBox() {
  dataContainer.className = '';
}

// Refresh different components from other components.
function refreshGeoJsonFromData() {
  map.data.toGeoJson(function(geoJson) {
    geoJsonOutput.value = JSON.stringify(geoJson, null, 2); 
    refreshDownloadLinkFromGeoJson();
  });
}

// Refresh download link.
function refreshDownloadLinkFromGeoJson() {
  downloadLink.href = "data:;base64," + btoa(geoJsonOutput.value);
}

// Apply listeners to refresh the GeoJson display on a given data layer.
function bindDataLayerListeners(dataLayer) {
  dataLayer.addListener('addfeature', refreshGeoJsonFromData);
  dataLayer.addListener('removefeature', refreshGeoJsonFromData);
  dataLayer.addListener('setgeometry', refreshGeoJsonFromData);
  dataLayer.addListener('setproperty', refreshGeoJsonFromData);
}

function setGeoJsonValidity(newVal) {
	if (!newVal) {
		geoJsonOutput.className = 'invalid';
	} else {
		geoJsonOutput.className = '';
	}
}

function handleDrop(e) {
	e.preventDefault();
	e.stopPropagation();
	hideDataBox();

	var files = e.dataTransfer.files;
	if (files.length) {
		// process file(s) being dropped
		// grab the file data from each file
		for (var i = 0, file; file = files[i]; i++) {
			var reader = new FileReader();
			reader.onload = function(e) {
				map.data.addGeoJson(JSON.parse(e.target.result));
			};
			reader.onerror = function(e) {
				console.error('reading failed');
			};
			reader.readAsText(file);
		}
	} else {
		// process non-file (e.g. text or html) content being dropped
		// grab the plain text version of the data
		var plainText = e.dataTransfer.getData('text/plain');
		if (plainText) {
			map.data.addGeoJson(JSON.parse(plainText));
		}
  	};
  // prevent drag event from bubbling further
  return false;
}

function resize() {
	var geoJsonOutputRect = geoJsonOutput.getBoundingClientRect();
	var dataBoxRect = dataBox.getBoundingClientRect();
	geoJsonOutput.style.height = dataBoxRect.bottom - geoJsonOutputRect.top - 8 + "px";
}

function HelpButton(){
	bootbox.alert({
    		message:"-You can choose multiple lines by clicking on them (the selected features are hightlighted)\n and if you want to de-select them you click on the selected one again. \n\n -You can delete everything by clicking on the 'Clear the Map' button. \n\n -You can delete the selected features by clicking on the 'Delete the selected'. \n\n -You can rate all the selected features by clicking on each button depented to \n the rate that you want(The worst rating is red and the best is green and the \n colors are red,yellow,white,blue,green). \n\n -After you finish the edition of the map you can download the geojson file \n by clicking on the 'Download Geojson'. " ,
    		backdrop: true
	});
			
}
