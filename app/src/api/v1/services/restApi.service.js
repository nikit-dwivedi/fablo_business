const axios = require('axios');

//==========distance-matrix======================================================

async function getDistance(originDestination) {
    const query = "https://maps.googleapis.com/maps/api/distancematrix/json" + originDestination + "&key="
    const response = await axios.get(query);
    const distance = response.data.rows[0].elements[0].distance;
    const duration = response.data.rows[0].elements[0].duration;
    return { distance, duration };
}

//==========distance-matrix======================================================


module.exports = {
    getDistance
}
