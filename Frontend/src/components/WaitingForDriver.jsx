import React from 'react'
import { useEffect } from 'react';
import { useRideContext } from "../context/RideContext";
const WaitingForDriver = () => {
 const {
        ridePanel,
        setRidePanel,
        currentAddress,
        setCurrentAddress,
        destinationAddress,
        setDestinationAddress,
        confirmRideVehicleImg,
        setConfirmRideVehicleImg,
        confirmedRide,
        setConfirmedRide,
        fare,
        setFare
      } = useRideContext();
    useEffect(() => {
      console.log("Updated confirm vehicle Image URL:", confirmRideVehicleImg);
    }, [confirmRideVehicleImg]);
  
    return (
      <div >
        <div className='flex '>
        <div className="w-full flex  mt-7">
          <img src='/assets/uber-car.jpeg' alt="Selected Ride" className="w-35" />
        </div>
        <div className='w-full mt-7  mr-3 text-right'>
        <h3 className='font-medium'>Sarthak</h3>
        <h1 className='font-bold text-xl'>MP04 AB 1234</h1>
        <h4 className=' text-sm'>Maruti Suzuki Alto</h4>
        </div>
        </div>
        <div className='flex flex-col gap-4 relative'>
        <div className='flex gap-5   ml-4 mt-9'>
          <img className='w-5 h-10' src="/assets/user-address-map-pin.svg" alt="" />
          <h2 className='w-full'>{currentAddress}</h2>
        </div>
        <div className='line  bg-gray-300 h-[1px] ml-2 mr-2'></div>
        <div className='flex gap-5 ml-4'>
          <img className='w-5 h-10' src="/assets/user-destination-map-pin.svg" alt="" />
          <h2 className=''>{destinationAddress}</h2>
        </div>
        <div className='line  bg-gray-300 h-[1px] ml-2 mr-2'></div>
        <div className='flex gap-5 ml-4'>
          <img className='w-5 h-10' src="/assets/money-rupee-circle-line.svg" alt="" />
          <div>
          <h2 className='font-medium'>₹{fare}</h2>
          <h2>Cash</h2>
          </div>
        </div>
       
        </div>
      </div>
    );
   
}

export default WaitingForDriver