'use strict';

var tubeMap = require('./tubeMap'),
    storeMap = require('./storeMap');

exports = module.exports = {
    init: init,
    showUi: showUi,
    hideUi: hideUi
};

function init() {
    showUi();
    tubeMap.init();
    storeMap.init();
}

function showUi() {
    $('#main').removeClass('hide');
}

function hideUi() {
    $('#main').addClass('hide');
}


