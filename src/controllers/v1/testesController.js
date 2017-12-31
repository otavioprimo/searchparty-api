const express = require('express'),
    app = express(),
    HttpStatus = require('http-status-codes'),
    geocoder = require('geocoder'),
    geolib = require('geolib');

exports.geocoderReverse = function (req, res) {
    geocoder.reverseGeocode(req.query.lat, req.query.lng, (err, data) => {
        if (err)
            res.status(HttpStatus.ACCEPTED).json({ erro: true, mensagem: err });
        else {
            if (data.status == 'OK') {
                var endereco = data.results[3].formatted_address;
                var city = false, state = false;
                for (var i = 0; i < data.results.length; i++) {
                    if ((!city || !state) && data.results[i].types[0] === "locality") {
                        cidade = data.results[i].address_components[0].short_name,
                            estado = data.results[i].address_components[2].short_name;
                    }
                }
                res.status(HttpStatus.ACCEPTED).json({ erro: true, endereco: endereco, cidade: cidade, estado: estado });
            }
        }
    });
}

exports.geocode = function (req, res) {
    geocoder.geocode(req.query.endereco, (err, data) => {
        if (err)
            res.status(HttpStatus.ACCEPTED).json({ erro: true, mensagem: err });
        else
            res.status(HttpStatus.ACCEPTED).json({ erro: true, mensagem: data });
    });
}

exports.distanceLatLng = function (req, res) {
    let ponto_inicial = {
        latitude: req.query.lat_inicio,
        longitude: req.query.lng_inicio
    };
    let ponto_final = {
        latitude: req.query.lat_final,
        longitude: req.query.lng_final
    };

    var distancia = geolib.getDistance(ponto_inicial, ponto_final, 10, 1);
    res.status(HttpStatus.ACCEPTED).json({ erro: true, mensagem: distancia });
}