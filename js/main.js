//-- intro dialog ------------------------------------------
$(function () {
    $("#intro-dialog").dialog({
        height: "auto",
        width: 500,
        modal: true,
        draggable: false,
        resizable: false,
        buttons: {
            Enter: function () {
                $(this).dialog("close");
            }
        }
    });
});

//-- setup map ---------------------------------------------
var calgary_grey = L.tileLayer('http://136.159.122.90/PHPTileServer/CalgaryGrey/{z}/{x}/{y}.png', {
    attribution: 'Data &copy; OpenStreetMap contributors. Licensed under the Open Data Commons Open Database License. City of Calgary &copy; Open Data. Design &copy; <a href="http://gisciencegroup.ucalgary.ca/">GISience Group</a>', wax: 'http://136.159.122.90/PHPTileServer/CalgaryGrey.tilejson'});

var map = L.map('map', {center: [51.000, -114.011],
    zoom: 8,
    minZoom: 7,
    maxZoom: 18,
    maxBounds: ([
        [50.73, -114.51],
        [51.30, -113.54]
    ]),
    layers: [calgary_grey]});

//-- setup zoom tool ---------------------------------------------
L.control.scale().addTo(map);

//-- selection option functions ----------------------------------
function getColor(d) {
    return d == 0 ? '#fed976' :
            d == 1 ? '#800026' :
                    d == 2 ? '#fc4e2a' :
                            '#ffeda0';
}

function getPowerColor(d) {
    return d == 0 ? '#9e9af5' :
            d == 1 ? '#0c0855' :
                    d == 2 ? '#1b13c1' :
                            '#1b13c1';
}

function getBridgeClosed(d) {
    return d == 1 ? bridgeClosedIcon :
            d == 0 ? openedbridgeClosedIcon :
                    bridgeClosedIcon;
}

function getGarbage(d) {
    return d == "firestation" ? firehallIcon :
            d == "landfill" ? landfillIcon :
                    firehallIcon;
}

function getPowertext(d) {
    return d == 0 ? "Power has been re-established" :
            d == 1 ? "Power has been cut off" :
                    d == 2 ? "Power is partially re-established" :
                            "Power has been cut off";
}

function getMusterComment(d) {
    return d == "" ? "" :
            d != "" ? "<p style=\"color:#e01020\"><b>" + d + "</b></p>" :
                    "";
}

function getBridgeComment(d) {
    return d == "" ? "" :
            d != "" ? "</br><b><i>" + d + "</i></b>" :
                    "";
}

function getRoadClosedComment(d) {
    return d == "" ? "" :
            d != "" ? "</br><i>" + d + "</i>" :
                    "";
}

function getReceptionStatus(d) {
    return d == "Full" ? "<p style=\"color:#e01020\"><b>" + d + "</b></p>" :
            d == "Closed" ? "<p style=\"color:#e01020\"><b>" + d + "</b></p>" :
                    "<i>" + d + "</i>";
}

function getParkingEntrance(d) {
    return d == "" ? "" :
            d != "" ? "</br><i>" + d + "</i>" :
                    "";
}

//-- feature styles ----------------------------------
function lrtLineStyle() {
    return {
        color: '#95072e',
        lineCap: 'butt',
        weight: '10',
        opacity: 1
    };
}

function powerStyle(feature) {
    return {
        fillColor: getPowerColor(feature.properties.power_out),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.closed),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function hydroStyle() {
    return {
        fillColor: '#1d7fde',
        weight: 1,
        opacity: 1,
        color: '#1d7fde',
        fillOpacity: 0.6,
        zIndex: 10
    };
}

function evac_2013Style() {
    return {
        fillColor: '#e01020',
        weight: 3,
        opacity: 1,
        color: '#e01020',
        fillOpacity: 0.6,
        zIndex: 100
    };
}

function floodStyle() {
    return {
        fillColor: '#988d6b',
        weight: 1,
        opacity: 0.5,
        color: '#988d6b',
        fillOpacity: 0.5,
        zIndex: 5
    };
}

function commStyle(feature) {
    return {
        fillColor: getColor(feature.properties.closed),
        weight: 3,
        opacity: 1,
        color: 'white',
        dashArray: '4',
        fillOpacity: 0.7,
        zIndex: 30
    };
}

//-- Listener functions ----------------------------------
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 7,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function highlightPowerFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 7,
        color: '#f20a26',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info_power.update(layer.feature.properties);
}

function resetHighlight(e) {
    effected_com_map.resetStyle(e.target);
    info.update();
}

function resetPowerHighlight(e) {
    power_out_map.resetStyle(e.target);
    info_power.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function onEachPowerFeature(feature, layer) {
    layer.on({
        mouseover: highlightPowerFeature,
        mouseout: resetPowerHighlight,
        click: zoomToFeature
    });
}

function onReceptionFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.desc) {
        var strPopup = '<b>' + feature.properties.desc + '</b>' + '<br>' + feature.properties.address + ", " +
                feature.properties.city + '<br>' + getReceptionStatus(feature.properties.status);
        layer.bindPopup(strPopup);
    }
}

function onAccommodationFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.desc) {
        var strPopup = '<b>' + feature.properties.desc + '</b>' + '<br>' + feature.properties.address + ", " +
                feature.properties.city + '<br>' + getReceptionStatus(feature.properties.status);
        layer.bindPopup(strPopup);
    }
}

function onBridgeFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.bridge) {
        layer.bindPopup(feature.properties.bridge + getBridgeComment(feature.properties.comment));
    }
}

function onParkingFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        var strPopup = '<b>' + feature.properties.name + '</b>' + '<br>' + feature.properties.address +
                getParkingEntrance(feature.properties.entrance);
        layer.bindPopup(strPopup);
    }
}

function onMusterFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        var strPopup = '<b>' + feature.properties.name + '</b>' + '<br>' + feature.properties.address +
                getMusterComment(feature.properties.comment);
        layer.bindPopup(strPopup);
    }
}

function onGarbageFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.name) {
        var strPopup = '<b>' + feature.properties.name + '</b>' + '<br>' + feature.properties.address;
        layer.bindPopup(strPopup);
    }
}

function onAnimalFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.desc) {
        var strPopup = '<b>' + feature.properties.desc + '</b>' + '<br>' + feature.properties.address;
        layer.bindPopup(strPopup);
    }
}

function onVolunteerFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.desc) {
        var strPopup = '<b>' + feature.properties.desc + '</b>' + '<br>' + feature.properties.address + '<br>' +
                feature.properties.comment;
        layer.bindPopup(strPopup);
    }
}

function onlrtFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.station) {
        var strPopup = '<b>' + feature.properties.station + '</b>' + '<p>' + feature.properties.comment + '</p>';
        layer.bindPopup(strPopup);
    }
}

function onRoadClosedFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.Name) {
        var strPopup = '<b>' + feature.properties.Name + '</b>' + getRoadClosedComment(feature.properties.description);
        layer.bindPopup(strPopup);
    }
}

function formatNumber(n, decPlaces, thouSeparator, decSeparator) {
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
    decSeparator = decSeparator == undefined ? "." : decSeparator;
    thouSeparator = thouSeparator == undefined ? "," : thouSeparator;
    sign = n < 0 ? "-" : "";
    i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "";
    j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
}

//-- Icons ----------------------------------
var lrtIcon = L.icon({
    iconUrl: "img/nolrt.png",
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 18], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -18] // point from which the popup should open relative to the iconAnchor
});

var accommodationIcon = L.icon({
    iconUrl: 'img/accommodation.png',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 18], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -18] // point from which the popup should open relative to the iconAnchor
});

var volunteerIcon = L.icon({
    iconUrl: 'img/volunteer.png',
    iconSize: [30, 30], // size of the icon
    iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -25] // point from which the popup should open relative to the iconAnchor
});

var animalIcon = L.icon({
    iconUrl: 'img/animal.png',

    iconSize: [43, 43], // size of the icon
    iconAnchor: [19, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -20] // point from which the popup should open relative to the iconAnchor

});

var bridgeClosedIcon = L.icon({
    iconUrl: 'img/roadblock.png',

    iconSize: [51, 51], // size of the icon
    iconAnchor: [23, 22], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -26] // point from which the popup should open relative to the iconAnchor

});

var openedbridgeClosedIcon = L.icon({
    iconUrl: 'img/openedroadblock.png',

    iconSize: [51, 51], // size of the icon
    iconAnchor: [23, 22], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -26] // point from which the popup should open relative to the iconAnchor

});

var receptionIcon = L.icon({
    iconUrl: 'img/reception.png',

    iconSize: [27, 27], // size of the icon
    iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -13] // point from which the popup should open relative to the iconAnchor

});

var parkingIcon = L.icon({
    iconUrl: 'img/parking.png',

    iconSize: [34, 38], // size of the icon
    iconAnchor: [15, 19], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -15] // point from which the popup should open relative to the iconAnchor

});

var musterIcon = L.icon({
    iconUrl: 'img/muster.png',

    iconSize: [31, 31], // size of the icon
    iconAnchor: [14, 14], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -14] // point from which the popup should open relative to the iconAnchor

});

var firehallIcon = L.icon({
    iconUrl: 'img/firehall.png',

    iconSize: [40, 40], // size of the icon
    iconAnchor: [18, 13], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -13] // point from which the popup should open relative to the iconAnchor

});

var landfillIcon = L.icon({
    iconUrl: 'img/landfill.png',

    iconSize: [40, 40], // size of the icon
    iconAnchor: [18, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor

});

//-- Create GeoJSON map layers ----------------------------------
var flood_map = L.geoJson(floodData, {style: floodStyle}).addTo(map);
var hydro_map = L.geoJson(hydroData, {style: hydroStyle}).addTo(map);
var evac_map = L.geoJson(evac_2013_Data, {style: evac_2013Style}).addTo(map);

var bridge_map = L.geoJson(bridgeData, {
    filter: function (feature, layer) {
        return feature.properties.closed;
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getBridgeClosed(feature.properties.closed)
        });
    },
    onEachFeature: onBridgeFeature
});

var reception_map = L.geoJson(receptionData, {
    filter: function (feature, layer) {
        return feature.properties.status != "Closed";
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: receptionIcon
        });
    },
    onEachFeature: onReceptionFeature
});

var parking_map = L.geoJson(parkingData, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: parkingIcon
        });
    },
    onEachFeature: onParkingFeature
});

var muster_map = L.geoJson(musterData, {
    filter: function (feature, layer) {
        return feature.properties.comment != "Closed";
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: musterIcon
        });
    },
    onEachFeature: onMusterFeature
});

var garbage_map = L.geoJson(garbageData, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getGarbage(feature.properties.type)
        });
    },
    onEachFeature: onGarbageFeature
});

var animal_map = L.geoJson(animalData, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: animalIcon
        });
    },
    onEachFeature: onAnimalFeature
});

var effected_com_map = L.geoJson(evac_comm_Data, {
    style: commStyle,
    onEachFeature: onEachFeature
});

var power_out_map = L.geoJson(powerData, {
    style: powerStyle,
    onEachFeature: onEachPowerFeature
});

var volunteer_map = L.geoJson(volunteerData, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: volunteerIcon
        });
    },
    onEachFeature: onVolunteerFeature
});

var accommodation_map = L.geoJson(accommodationData, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: accommodationIcon
        });
    },
    onEachFeature: onAccommodationFeature
});

var lrt_map = L.geoJson(lrtData, {
    filter: function (feature, layer) {
        return feature.properties.status == 1;
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: lrtIcon
        });
    },
    onEachFeature: onlrtFeature
});

var lrt_line_map = L.geoJson(lrtLineData, {
    filter: function (feature, layer) {
        return feature.properties.status != 0;
    },
    style: lrtLineStyle
});

var road_line_map = L.geoJson(roadClosureData, {
    filter: function (feature, layer) {
        return feature.properties.closed != "Open";
    },
    style: function (feature) {
        switch (feature.properties.closed) {
            case 'Closed':
                return {color: "#8a1018", weight: '6', opacity: 1};
            case 'Open':
                return {color: "#80d221", weight: '6', opacity: 1};
            case 'Restricted':
                return {color: "#859ee5", weight: '6', opacity: 1};
        }
    },
    onEachFeature: onRoadClosedFeature
});

//-- Layer groups ----------------------------------
var lrt_Layer = new L.LayerGroup();
lrt_Layer.addLayer(lrt_line_map)
        .addLayer(lrt_map);

var road_bridge_Layer = new L.LayerGroup();
road_bridge_Layer.addLayer(road_line_map)
        .addLayer(bridge_map);

//-- Layer control ----------------------------------
var overlay_layers = {
    "Effected Communities": effected_com_map,
    "Power Outage": power_out_map,
    "Road & Bridge Closures": road_bridge_Layer,
    "LRT Closures": lrt_Layer,
    "Reception Centres": reception_map,
    "Accommodation": accommodation_map,
    "Re-entry Information Centres": muster_map,
    "Parking": parking_map,
    "Waste & Recycling Services": garbage_map,
    "Animal Shelters": animal_map,
    "Volunteer Call-out": volunteer_map
};

var base_layers = {
    "Evacuation Area": evac_map
};

var layer_control = L.control.layers(base_layers, overlay_layers, {
    collapsed: false
});

layer_control.addTo(map);

//-- Layer/legend/info automation ----------------------------------
map.on('layeradd', function (e) {
    if (map.hasLayer(effected_com_map)) {
        $('div.community_info').show();
        $('div.effected_communities_legend').show();
    }
    if (map.hasLayer(reception_map)) {
        $('div.reception_legend').show();
    }
    if (map.hasLayer(bridge_map)) {
        $('div.bridge_legend').show();
    }
    if (map.hasLayer(parking_map)) {
        $('div.parking_legend').show();
    }
    if (map.hasLayer(muster_map)) {
        $('div.muster_legend').show();
    }
    if (map.hasLayer(garbage_map)) {
        $('div.garbage_legend').show();
    }
    if (map.hasLayer(power_out_map)) {
        $('div.power_legend').show();
        $('div.community_power_info').show();
    }
    if (map.hasLayer(animal_map)) {
        $('div.animal_legend').show();
    }
    if (map.hasLayer(volunteer_map)) {
        $('div.volunteer_legend').show();
    }
    if (map.hasLayer(accommodation_map)) {
        $('div.accommodation_legend').show();
    }
    if (map.hasLayer(lrt_Layer)) {
        $('div.lrt_legend').show();
    }
});

map.on('layerremove', function (e) {
    if (!map.hasLayer(effected_com_map)) {
        $('div.community_info').hide();
        $('div.effected_communities_legend').hide();
    }
    if (!map.hasLayer(reception_map)) {
        $('div.reception_legend').hide();
    }
    if (!map.hasLayer(parking_map)) {
        $('div.parking_legend').hide();
    }
    if (!map.hasLayer(muster_map)) {
        $('div.muster_legend').hide();
    }
    if (!map.hasLayer(bridge_map)) {
        $('div.bridge_legend').hide();
    }
    if (!map.hasLayer(garbage_map)) {
        $('div.garbage_legend').hide();
    }
    if (!map.hasLayer(power_out_map)) {
        $('div.power_legend').hide();
        $('div.community_power_info').hide();
    }
    if (!map.hasLayer(animal_map)) {
        $('div.animal_legend').hide();
    }
    if (!map.hasLayer(volunteer_map)) {
        $('div.volunteer_legend').hide();
    }
    if (!map.hasLayer(accommodation_map)) {
        $('div.accommodation_legend').hide();
    }
    if (!map.hasLayer(lrt_Layer)) {
        $('div.lrt_legend').hide();
    }
});

//-- Effected communities Info ----------------------------------
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'community_info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Community</h4>' + (props ?
            '<b>' + props.name + '</b><br />Population: ' + formatNumber(props.population, 0, ',', '.')
            : 'Hover over a community');
};

info.addTo(map);
$('div.community_info').insertAfter('#map');

//-- Effected communities Power Info ----------------------------------
var info_power = L.control();

info_power.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'community_power_info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info_power.update = function (props) {
    this._div.innerHTML = '<h4>Community</h4>' + (props ?
            '<b>' + props.name + '</b><br />' + getPowertext(props.power_out)
            : 'Hover over a community');
};

info_power.addTo(map);
$('div.community_power_info').insertAfter('#map');

//-- Legend creation ----------------------------------
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = '<h3>Legend</h3>';
    div.innerHTML += '<div style="display: inline-block;"><h4>Evacuated Areas</h4>';
    div.innerHTML += '<i style="background: #e01020"></i><br></div>';

    div.innerHTML += '<div style="display: inline-block;"><h4>Waterways</h4>';
    div.innerHTML += '<i style="background: #1d7fde"></i><br></div>';

    div.innerHTML += '<div style="display: inline-block;"><h4>Predicted 100 Year Flood Extent</h4>';
    div.innerHTML += '<i style="background: #988d6b"></i><br></div>';

    div.innerHTML += '<div class="effected_communities_legend"><h4>Effected Communities</h4></div>';
    div.innerHTML += '<div class="effected_communities_legend"><i style="background:#fed976"></i>Full re-entry allowed<br></div>';
    div.innerHTML += '<div class="effected_communities_legend"><i style="background:#800026"></i>Evacuated<br></div>';
    div.innerHTML += '<div class="effected_communities_legend"><i style="background:#fc4e2a"></i>Partial Re-entry allowed<br></div>';

    div.innerHTML += '<div class="bridge_legend"><h4>Road &amp; Bridge Closures</h4></div>';
    div.innerHTML += '<div class="bridge_legend" style="margin-top: -5px;"><img src="img/roadblock.png" height="40" width="40">Bridge closed</div>';
    div.innerHTML += '<div class="bridge_legend" style="margin-top: -15px;"><img src="img/roadClosedLine.png" height="36" width="40">Road closed</div>';
    div.innerHTML += '<div class="bridge_legend" style="margin-top: -15px;"><img src="img/roadRestrictedLine.png" height="36" width="40">Road restricted</div>';

    div.innerHTML += '<div class="lrt_legend"><img src="img/nolrt.png" height="40" width="40"></div>';
    div.innerHTML += '<div class="lrt_legend" style="margin-top: -25px; margin-left: 35px;"><h4>LRT Station Closures</h4></div>';
    div.innerHTML += '<div class="lrt_legend"><img src="img/lrtline.png" height="36" width="40"></div>';
    div.innerHTML += '<div class="lrt_legend" style="margin-top: -25px; margin-left: 35px;"><h4>Closed LRT Line</h4></div>';

    div.innerHTML += '<div class="reception_legend"><img src="img/reception.png" height="27" width="27"></div>';
    div.innerHTML += '<div class="reception_legend" style="margin-top: -20px; margin-left: 25px;"><h4>Reception Centres</h4></div>';

    div.innerHTML += '<div class="parking_legend"><img src="img/parking.png" height="38" width="34"></div>';
    div.innerHTML += '<div class="parking_legend" style="margin-top: -25px; margin-left: 30px;"><h4>Open Parkades and School Parking Lots</h4></div>';

    div.innerHTML += '<div class="muster_legend"><img src="img/muster.png" height="31" width="31"></div>';
    div.innerHTML += '<div class="muster_legend" style="margin-top: -25px; margin-left: 30px;"><h4>Re-entry Information Centres</h4></div>';

    div.innerHTML += '<div class="garbage_legend"><h4>Waste & Recycling Services</h4></div>';
    div.innerHTML += '<div class="garbage_legend" style="margin-top: -5px;"><img src="img/firehall.png" height="40" width="40">Fire Hall</div>';
    div.innerHTML += '<div class="garbage_legend" style="margin-top: -15px;"><img src="img/landfill.png" height="40" width="40">Landfill</div>';

    div.innerHTML += '<div class="power_legend"><h4>Power Outages</h4></div>';
    div.innerHTML += '<div class="power_legend"><i style="background:#0c0855"></i>Power out<br></div>';
    div.innerHTML += '<div class="power_legend"><i style="background:#d9d8fb"></i>Power fully re-established<br></div>';
    div.innerHTML += '<div class="power_legend"><i style="background:#1b13c1"></i>Power partially re-established<br></div>';

    div.innerHTML += '<div class="animal_legend"><img src="img/animal.png" height="35" width="35"></div>';
    div.innerHTML += '<div class="animal_legend" style="margin-top: -25px; margin-left: 35px;"><h4>Animal Shelters</h4></div>';

    div.innerHTML += '<div class="volunteer_legend"><img src="img/volunteer.png" height="30" width="30"></div>';
    div.innerHTML += '<div class="volunteer_legend" style="margin-top: -25px; margin-left: 35px;"><h4>Volunteer Call-out</h4></div>';

    div.innerHTML += '<div class="accommodation_legend"><img src="img/accommodation.png" height="40" width="40"></div>';
    div.innerHTML += '<div class="accommodation_legend" style="margin-top: -25px; margin-left: 35px;"><h4>Accommodation</h4></div>';

    div.innerHTML += '<hr><p>Information valid 9:00 a.m. July 8 2013.</p>';

    return div;
};

legend.addTo(map);

//-- Adding locate me control ----------------------------------
var locate_me_control = L.control.locate().addTo(map);

//-- Adding geocoder control ----------------------------------
function getURLParameter(name) {
    return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ])[1]
    );
}

var regionParameter = getURLParameter('region');
var region = (regionParameter === 'undefined') ? '' : regionParameter;

var geocoder_control = new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google({
        region: region
    })
}).addTo(map);

$('form.leaflet-control-layers-list').append('<div class="leaflet-control-layers-separator"></div>');
$('form.leaflet-control-layers-list').append('<p><b>Hint</b>: turn on information that you</br>want to see by <b>clicking</b> on items</br>listed <b>above</b>. Click icons on the </br>map to get more information.</p>');

