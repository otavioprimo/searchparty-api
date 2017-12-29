const superagent = require('superagent');

const urlGeocode = "https://maps.googleapis.com/maps/api/geocode/json";
const maps_key = "AIzaSyBvG_a0R3UG-Zs0tMkJm-eTnXQQDov2Ks4";

// result_type: "political",
exports.getCidadeEstado = function (latitude, longitude, successCallback, errorCallback) {
    superagent.get(urlGeocode)
        .query({ latlng: latitude + ',' + longitude, key: maps_key })
        .end((err, resp) => {
            if (err)
                errorCallback({ error: true, mensagem: "Erro no request", log: err });
            else {
                if (resp.body.status == 'OK') {
                    if (resp.body.results[1]) {
                        var city = false, state = false;
                        for (var i = 0; i < resp.body.results.length; i++) {
                            if ((!city || !state) && resp.body.results[i].types[0] === "locality") {
                                cidade = resp.body.results[i].address_components[0].short_name,
                                    estado = resp.body.results[i].address_components[2].short_name;
                                successCallback({ cidade: cidade, estado: estado, error: false, message: "" });
                            }
                        }
                    }
                } else {
                    successCallback({ cidade: "", estado: "", error: true, message: "Cidade não encontrada" })
                }
            }
        });

}

