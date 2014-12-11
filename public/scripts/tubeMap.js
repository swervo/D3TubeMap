'use strict';

exports = module.exports = {
    init: init
};

var $tubeMapContainer,
    d3SvgMap, tubeStationLocData, locLookUp,
    timerObject;

function init () {
    d3SvgMap = d3.select('svg');
    $tubeMapContainer = $('#tubeMapContainer');
    $('#tubeHeatMap').on('click', goFullScreen);
    // $forceRefresh = $('.js-refreshTube').on('click', getLiveData);
    $('.js-refreshTube').on('click', getDummyData);
    loadStationData();
}

function goFullScreen () {
    /* jshint validthis:true */
    if (this.requestFullscreen) {
        this.requestFullscreen();
    } else if (this.msRequestFullscreen) {
        this.msRequestFullscreen();
    } else if (this.mozRequestFullScreen) {
        this.mozRequestFullScreen();
    } else if (this.webkitRequestFullscreen) {
        this.webkitRequestFullscreen();
    }
}

function loadStationData () {
    function createLocLookUp () {
        locLookUp = {};
        var i;
        for (i = 0; i < tubeStationLocData.length; i++) {
            locLookUp[tubeStationLocData[i].meta] = tubeStationLocData[i];
        }
    }
    function success (data) {
        tubeStationLocData = data.pois;
        // create an object that provides easy lookup of location data
        createLocLookUp();
    }
    $.getJSON('../data/stationData.json', success);
}

// function getLiveData () {
//     var i;
//     var hasData = false;
//     var dataPromise = $.getJSON('/pois/entered/cid-5c559a9108a344848d746d055cab0905/');
//     dataPromise.done(function (data) {
//         for (i = 0; i < data.results.length; i++) {
//             var result = data.results[i];
//             if (locLookUp[result.meta]) {
//                 // there is at least one displayable result
//                 hasData = true;
//                 result.locData = locLookUp[result.meta];
//             } else {
//                 // unrecognised meta
//                 data.results[i] = null;
//             }
//         }
//         if (hasData) {
//             showDataOnMap(data.results);
//         } else {
//             console.log('There is no TFL data to display');
//         }
//     });
//     dataPromise.fail(function (jqXHR, msg) {
//         console.log(msg);
//         console.log(jqXHR.responseText);
//         console.log(JSON.parse(jqXHR.responseText).message);
//         alert('Problem loading POI data: ' + '\n' + JSON.parse(jqXHR.responseText).message);
//     });
// }

timerObject = setInterval(getDummyData, (1000 * 10));

function getNormalisedRadius (aCount) {
    // should really replace this with the normalisation function
    // provided by d3
    return (25 + Math.min(aCount, 60));
    // return (20 + Math.sqrt(aArea/Math.PI));
}

function showDataOnMap (aData) {
    var gStations = d3SvgMap.selectAll('g')
        .data(aData, function (d) {
            return(d.meta);
        });

    gStations.each(function(d){
        var oldCount = +d3.select(this).select('text')[0][0].innerHTML;
        if (d.count !== oldCount) {
            d3.select(this)
                .attr('class', 'update');
        } else {
            // Its possible that it may have been previously updated
            // But it hasn't changed since the last update
            // So, to make sure set it to 'unchanged' (black)
            // console.log(d.meta);
            d3.select(this)
                .attr('class', 'unchanged');
        }
    });

    gStations.enter()
        .append('g')
        .attr('transform', function (d) {
            return 'translate(' + d.locData.tflMapX + ', ' + d.locData.tflMapY + ')';
        })
        .attr('opacity', 1)
        .attr('class', 'enter');

    gStations.exit()
        .attr('class', 'exit')
        .transition()
            .duration(500)
            .attr('opacity', 0)
            .each('end', function () {
                d3.select(this).remove();
            })
            .delay(500);

    var cStations = gStations.selectAll('circle')
        .data(function (d) {
            var locArray = [];
            locArray.push(d);
            return locArray;
        });

    cStations.enter()
        .append('circle')
        .attr({
            'r': 0,
            'stroke-width': '0'
        })
        .transition()
            .attr('r', function (d) {
                return(getNormalisedRadius(d.count));
            })
            .duration(500);

    var tStations = gStations.selectAll('text')
        .data(function (d) {
            var locArray = [];
            locArray.push(d);
            return locArray;
        })
        .enter()
        .append('text')
        .attr({
            'opacity': 1,
            'class': 'visitCount',
            'text-anchor': 'middle'
        })
        .text(function (d) {
            return d.count;
        });

    gStations.selectAll('circle')
        .transition()
            .attr('r', function (d) {
                return(getNormalisedRadius(d.count));
            })
            .duration(500);

    gStations.selectAll('text')
        .text(function (d) {
            return d.count;
        });
}

function getDummyData () {
    var data, i;
    var numResults = Math.floor(Math.random() * tubeStationLocData.length);
    data = {
        results: []
    };

    for (i = 0; i < numResults; i++) {
        var newDataPoint = {};
        newDataPoint.poiId = 20001;
        newDataPoint.meta = tubeStationLocData[i].meta;
        newDataPoint.count = Math.floor(Math.random() * 120);
        data.results.push(newDataPoint);
    }

    // augment the results with the location data
    for (i = 0; i < data.results.length; i++) {
        var result = data.results[i];
        result.locData = locLookUp[result.meta];
    }
    showDataOnMap(data.results);
}
