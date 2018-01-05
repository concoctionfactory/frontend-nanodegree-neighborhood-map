var vm = null;
var yelp = function(){
	var YELP_TOKEN ="YlMcv9vPSHaFuf7Nhx_ehTogP9kgChamwjXtk5h-gDY63vZt-RvcU1AwgI2KB3b41N6psdR840cAxPPlTtB89iWELNVhJsLElP6XJVT4ymxMgnKiavFc6HQRITpOWnYx";
	var yelp_url='http://api.yelp.com/v3/businesses/search';
	var cors_anywhere_url = 'https://cors-anywhere.herokuapp.com/'; 

	var parameters = {
		location: 'Canal Street New York',
		term: 'noodle tea ',
		limit: 10
	};

	var yelpRequestTimeout = setTimeout(function(){
		alert("yelp data was not successful");
	},8000);

	//https://stackoverflow.com/questions/45684805/extract-yelps-rating
	var settings = {
		"data": parameters,
		"async": true,
		"crossDomain": true,
		"url": cors_anywhere_url + yelp_url ,
		"method": "GET",
		"headers": {
			"authorization": "Bearer " + YELP_TOKEN,
			"cache-control": "public, max-age=31536000",
		},
		success: function(results) {
			console.log(results);
			var initialPlaces =results.businesses;
			vm = new viewModel(initialPlaces);
			ko.applyBindings(vm);
			clearTimeout(yelpRequestTimeout);
		}
	};

	this.init = function(){
		$.ajax(settings);
	};
};
new yelp().init();



var Place= function(data){
	console.log(data);
	this.name = ko.observable(data.name);
	var address_1 = data.location.display_address[0] ? data.location.display_address[0]+" " : "";
	var address_2 = data.location.display_address[1] ? data.location.display_address[1]+" " : "";
	var imageUrl = data.image_url.replace("ms","ls");

	/**
		 * @description determine if an array contains one or more items from another array.
		 * @param {array} haystack the array to search.
		 * @param {array} arr the array providing items to check for in the haystack.
		 * @return {boolean} true|false if haystack contains at least one item from arr.
	 */
	var findOne = function (haystack, arr) {
		return arr.some(function (v) {
			for (var hay in haystack){
				console.log(haystack[hay]);
				if ( haystack[hay].indexOf(v) >= 0){
					return haystack[hay].indexOf(v) >= 0;
				}
			}
		});
	};

	console.log(findOne(data.categories.title, ["bars"]));
	this.isBar = ko.observable(findOne(data.categories.title, ["tea"]));
	this.address = ko.observable(address_1 + address_2 + data.location.city);
	this.location = ko.observable (data.location);
	this.image= ko.observable(imageUrl);
	this.maker =null;
	this.infowindow =null;
	this.phone = ko.observable(data.display_phone);
};



// stores current search and current select store
var storage = function(vm){
	if (!localStorage.searchStore) {
		localStorage.searchStore = ko.toJSON("");
	}
	if (!localStorage.currentStore) {
		localStorage.currentStore = ko.toJSON("");
	}
	this.searchStore = function(data){
		if (!data){
			return JSON.parse(localStorage.searchStore);
		}
		localStorage.searchStore = ko.toJSON(data);
	};
	this.currentStr = function(data){
		if (!data){
			return JSON.parse(localStorage.currentStore);
		}

		var tempCurrent ={
			name : data.name(),
			address : data.address(),
			phone: data.phone(),
			image : data.image()
		};
		//ko.toJson(data) gives error
		localStorage.currentStore = ko.toJSON(tempCurrent);
	};
};



var viewModel = function(initialPlaces){
	var self = this;
	var vmStorage = new storage(self);

	self.placeList = ko.observableArray([]);


	initialPlaces.forEach(function(item){
		self.placeList.push(new Place(item));
	});

	self.filter = ko.observable(vmStorage.searchStore());


	self.currentPlace = ko.observable(vmStorage.currentStr());


	self.filterPlaces = ko.computed(function(){
		//http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
		vmStorage.searchStore(self.filter());
		var filter= self.filter().toLowerCase();
		if(!filter){
			return self.placeList();

		}
		else{
			var filterList = ko.utils.arrayFilter(self.placeList(), function(item) {
						return item.name().toLowerCase().indexOf(filter) !== -1;
			});
			if (filterList.length === 0){
				vmStorage.searchStore("");
			}
			return filterList;
		}
	});


	self.setCurrent =function(data){
		self.currentPlace(data);
		vmStorage.currentStr(self.currentPlace());
		goo.markerShowInfo(data);
	};


	self.markerInfo = function(){
		self.setCurrent (this);
		self.hideShowMenu();

	};

	//Google Map error handling
	if (typeof google !== 'undefined'){
		var goo = new googleMaps(self);
		goo.initMap();
	}
	else{
		alert("google map data was not successful");
	}

	self.hideShowMenu = function(){
		$(".menu").toggleClass("menu-hidden");
		$(".thumbnail-section").toggleClass("thumbnail-section-hidden");
	};

};


//Drink by Creative Stall from the Noun Project
//Noodles by Lemon Liu from the Noun Project
//Sandwich by Alex Chocron from the Noun Project
//Teapot by Lilit Kalachyan from the Noun Project



var googleMaps = function(data){
	var self = this;
	var gMap;
	var placeList = data.placeList();
	var filterPlaces = data.filterPlaces();

	self.initMap =function(){
		gMap = new google.maps.Map(document.getElementById('map-canvas'), {
			zoom: 12,
		});


		gMap.set('styles',[
			{
				featureType: "road.highway",
				elementType: "geometry",
				stylers: [
					{saturation: -100 },
					{lightness: 80 },
					//{gamma: 2 }
				]
			},{
				featureType: "road.arterial",
				elementType: "geometry",
				stylers: [
					{saturation: -100 },
					//{gamma: 1 },
					{lightness: 0 }
				]
			},{
			featureType: "road.local",
				elementType: "labels",
				stylers: [
					{visibility: 'on' }
				]
			},{
				featureType: "poi",
				elementType: "all",
				stylers: [
					{saturation: -100 },
					{visibility: 'off' },
					//{lightness: 54 }

				]
			},{
				featureType: "administrative",
				stylers: [
					{saturation: -100 },
					{visibility: 'off' }
				]
			},{
				featureType: "transit",
				stylers: [
					{saturation: -100 },
					{ visibility: 'simplified' }
				]
			},{
				featureType: "water",
				elementType: "geometry",
				stylers: [
					{saturation: -100 },
					{lightness: 25 },
					{ visibility: 'simplified' }
				]
			},{
				featureType: "road",
				stylers: [
					{saturation: -100 },
					{lightness: -15 },
					{ visibility: 'simplified' }
				]
			},{
				featureType: "landscape",
				stylers: [
					{saturation: -100 },
					{lightness: 70 },
					{ visibility: 'simplified' }
				]
			}
		]);


		var geocoder = new google.maps.Geocoder();
		var latlngbounds = new google.maps.LatLngBounds();
		self.geocodeAddress(geocoder, latlngbounds);

		google.maps.event.addDomListener(window, 'resize', function() {
			console.log("resize");
			var center = gMap.getCenter();
			google.maps.event.trigger(gMap, "resize");
			gMap.setCenter(center);
		});
		data.filterPlaces.subscribe(function (newValue) {
			placeList.forEach(function(item){
				self.showMarker(item,self.checkShowMarker(item, newValue));
			});
		});
	}; // end self.initMap


	self.showMarker= function(item, val){
		if (val){
			item.marker.setMap(gMap);
		}
		else{
			item.marker.setMap(null);
		}
	};


	self.checkShowMarker = function(place, placeArray){
		return (jQuery.inArray(place,placeArray)!== -1) ? true: false;
	};


	self.geocodeAddress= function (geocoder, llbound ) {
		placeList.forEach(function(item){
			geocoder.geocode({'address': item.address()}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					llbound.extend(results[0].geometry.location);
					self.createMarker(results[0],item, self.checkShowMarker(item, filterPlaces) );
				}
				else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
				gMap.fitBounds(llbound);
			});

		});
	};// end self.geocodeAddress


	self.createMarker= function (place,item,show){
		console.log(item.isBar());
		var sizeX, sizeY =50;
		var imgDrink ='./images/noun_154278_cc_1.png';
		var imgFood ='./images/noun_82812_cc.png';
		var icon = item.isBar() ? imgDrink: imgFood;

		var marker = new google.maps.Marker({
			map: show ? gMap :null,
			position: place.geometry.location,
			animation: google.maps.Animation.DROP,
			icon: icon

		});

		var contentString = '<div>'+ item.name()+'</div';
		var infowindow = new google.maps.InfoWindow({content: contentString});

		item.marker = marker;
		item.infowindow = infowindow;

		marker.addListener('click',function(){
			data.setCurrent(item);
		},marker);

	};//end self.createMarker


	self.markerShowInfo =function (item){
			placeList.forEach(function(item){
				item.infowindow.close();
			});

			item.infowindow.open(gMap,item.marker);
			item.marker.setAnimation(google.maps.Animation.DROP);
	}; //end self.markerShowInfo

};// end var googleMaps



