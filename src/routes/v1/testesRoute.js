const express = require('express'),
    router = express.Router();

var testesController = require("../../controllers/v1/testesController");


router.route('/geocode-reverse')
    .get(testesController.geocoderReverse);

router.route('/geocode')
    .get(testesController.geocode);

router.route('/distance')
    .get(testesController.distanceLatLng);

module.exports = router;