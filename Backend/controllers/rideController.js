const rideService = require('../services/rideServices');
const { validationResult } = require('express-validator');
const mapService = require('../services/mapService');
const { sendMessageToSocketId,cancelride ,cancelrideuser} = require('../socket');
const rideModel = require('../models/rideModel');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
    
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 22);
        const rideWithUser = await rideModel.findOne({_id: ride._id}).populate('user', 'phone fullname');
     
        // console.log("the captains in radius",captainsInRadius)
       
        captainsInRadius.forEach(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            });
            // console.log("the horse riding",rideWithUser,captain.socketId)
        });
        
    
        
        return res.status(201).json(ride);
    
    } catch (err) {
        console.log(err);
        if (!res.headersSent) {
            return res.status(500).json({ message: err.message });
        }
    }
    

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
//   console.log("the ride id is defined as",rideId)
    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });
        // console.log("the use socket id is",ride.user.socketId)
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ridestarted',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    // console.log("reached here we hnm")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
  
    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });
        // console.log("reached here",ride)
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })




        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } 
}
module.exports.endrideuser = async (req, res) => {
    // console.log("reached")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("no errors")}
    try { 
        cancelrideuser()
        
    } catch (err) {
      console.log(err)
    } 
}
module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
   
    try { 
        cancelride()
        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } 
}
