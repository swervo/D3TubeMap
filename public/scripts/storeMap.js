/* global google */
/* global GMaps */

'use strict';

exports = module.exports = {
    init: init,
    reset: reset
};

var storeMap, mapBounds,
    storeDataArray, storeLookupTable, sainsburysLocData, markerTable,
    cityCircle, cityCircleArray,
    timerObject, numResults;

function init () {
    storeDataArray = [];
    markerTable = {};
    storeLookupTable = {};
    cityCircleArray = [];
    numResults = 0;
    $('#navbar-collapse a[href="#storeMap"]').tab('show');
    $('.js-refreshStore').on('click', getDummyData);
    setTimeout(function () {
        createMap();
        loadStoreData();
    }, 1000);
}

function reset () {
}

function createMarker (aPlaceObject, aMeta) {
    var image = '../assets/yellow_MarkerS.png';
    var myLatlng = new google.maps.LatLng(aPlaceObject.latitude, aPlaceObject.longitude);

    var marker = new google.maps.Marker({
        position: myLatlng,
        title: aPlaceObject.address,
        icon: image
    });
    markerTable[aMeta] = marker;
    marker.setMap(storeMap.map);
}

function updateMarkers (aData) {
    for (var i = 0; i < aData.length; i++) {
        var meta = aData[i].meta;
        var marker = markerTable[meta];
        marker.setIcon('../assets/red_MarkerS.png');
    }
}

function createMap () {
    storeMap = new GMaps({
        div: '#storeMapContainer',
        lat: 51.515351,
        lng: -0.127758,
        zoom: 14,
        panControl: false
    });
    mapBounds = storeMap.map.getBounds();
    // console.log(mapBounds);
}

function loadStoreData () {
    function success (data) {
        sainsburysLocData = data.pois;
        for (var i = 0; i < sainsburysLocData.length; i++) {
            storeLookupTable[sainsburysLocData[i].meta] = sainsburysLocData[i];
            createMarker(sainsburysLocData[i], sainsburysLocData[i].meta);
        }
    }
    $.getJSON('../data/sainsburys.json', success);
}

// function getLiveData () {
//     var i;
//     var hasData = false;
//     var dataPromise = $.getJSON('/pois/entered/cid-31405daf75b2494385e8b15fc3abee90/');
//     dataPromise.done(function (data) {
//         for (i = 0; i < data.results.length; i++) {
//             var result = data.results[i];
//             if (storeLookupTable[result.meta]) {
//                 // there is at least one displayable result
//                 hasData = true;
//                 result.locData = storeLookupTable[result.meta];
//             } else {
//                 // unrecognised meta
//                 data.results[i] = null;
//             }
//         }
//         if (hasData) {
//             showDataOnMap(data.results);
//             updateMarkers(data.results);
//         } else {
//             console.log('There is no Sainsburys data to display');
//         }
//     });
//     dataPromise.fail(function (jqXHR, msg) {
//         console.log(msg);
//         console.log(jqXHR.responseText);
//         console.log(JSON.parse(jqXHR.responseText).message);
//         alert('Problem loading POI data: ' + '\n' + JSON.parse(jqXHR.responseText).message);
//     });
// }

function getDummyData () {
    var data, i;
    if (numResults < sainsburysLocData.length) {
        numResults += 1;
    }
    data = {
        results: []
    };

    for (i = 0; i < numResults; i++) {
        var newDataPoint = {};
        newDataPoint.meta = sainsburysLocData[i].meta;
        newDataPoint.count = Math.floor(Math.random() * 150);
        data.results.push(newDataPoint);
    }

    // augment the results with the location data
    for (i = 0; i < data.results.length; i++) {
        var result = data.results[i];
        result.locData = storeLookupTable[result.meta];
    }
    showDataOnMap(data.results);
    updateMarkers(data.results);
}

function clearOldData (cb) {
    var arrayLength = cityCircleArray.length;
    for (var i = 0; i < arrayLength; i++) {
        var item = cityCircleArray.pop();
        item.setMap(null);
        item = null;
    }
    setTimeout(cb, 1000);
}

function showDataOnMap (aData) {
    function createNewData () {
        for (var i = 0; i < aData.length; i++) {
            if (aData[i]) {
                var latLng = new google.maps.LatLng(aData[i].locData.latitude, aData[i].locData.longitude);
                var storeVisits = {
                    strokeWeight: 0,
                    fillColor: '#000000',
                    fillOpacity: 0.4,
                    map: storeMap.map,
                    center: latLng,
                    radius: 20 + aData[i].count
                };
                // Add the circle for this city to the map.
                cityCircle = new google.maps.Circle(storeVisits);
                cityCircleArray.push(cityCircle);
            }
        }
    }
    // clear out the old data
    clearOldData(createNewData);
}

timerObject = setInterval(getDummyData, (1000 * 3));
// timerObject = setInterval(getLiveData, (1000 * 10));
