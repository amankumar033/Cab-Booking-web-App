const axios = require('axios');
const captainModel=require('../models/captainModel')
module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GO_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error('GoMaps API Error:', error.message);
        throw error;
    }
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GO_MAPS_API;

    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {

        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        } else {
            throw new Error('Unable to fetch distance and time');
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getdirection = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }
    const apiKey = process.env.GO_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/directions/json`;

    try {
        const response = await axios.get(url, {
          params: {
            origin,
            destination,
            key: apiKey
          }
        });
  
        // Optional: log to debug or return relevant data
        // console.log('Route response:', response.data);
  
        return response.data; // You’ll likely want to return `routes[0]` or similar
      } catch (error) {
        console.error('Error fetching directions:', error);
        throw error;
      }
    }
  




module.exports.getAutoCompleteSuggestions = async (address) => {
           
    if (!address) {
        throw new Error('query is required');
    }
    
    const apiKey = process.env.Go_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {
    // console.log("request came with",lat,lng,radius)
    
    const captain=await captainModel.find()
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ lng, lat ], radius / 6371 ]
            }
        }
    });
    // console.log("all the captains",captain)
    // console.log("the captains found from mapservice within radius",captains)
    return captains;


}

