import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useRideContext } from '../context/RideContext';
import polyline from '@mapbox/polyline';

// Default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const captainIcon = new L.Icon({
  iconUrl: '/assets/uber-car.jpeg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const userIcon = new L.Icon({
  iconUrl: '/assets/user-address-map-pin.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const usersIcon = new L.Icon({
  iconUrl: '/assets/uber-car.jpeg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const LiveTracking = ({ currentLiveLocation = false, setCurrentLiveLocation, setCurrentAddress, locationMarkerPos, captainLocation ,waitingForUser,userLocation}) => {
  const [routePolyline, setRoutePolyline] = useState(null);

  const polylineRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const originRef = useRef(null);       // User's current location
  const destinationRef = useRef(null);  // Offset marker location
  
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;
  
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
  
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
  
      points.push([lat / 1e5, lng / 1e5]);
    }
  
    return points;
  }
  



  const {waitingForDrivers,setWaitingForDriver}=useRideContext()

  const getDirections = async () => {
    if (!originRef.current || !destinationRef.current) {
      console.log("Directions skipped: origin or destination not ready");
      return;
    }
  
    // Pass the lat, lng values directly for reverse geocoding
    const originLatLng = { lat: originRef.current.lat, lng: originRef.current.lng };
    const destinationLatLng = { lat: destinationRef.current.lat, lng: destinationRef.current.lng };
  
    try {
      const [originAddress, destinationAddress] = await Promise.all([
        reverseGeocode(originLatLng.lat, originLatLng.lng), // Pass lat, lng
        reverseGeocode(destinationLatLng.lat, destinationLatLng.lng), // Pass lat, lng
      ]);
  
      console.log("Origin Address:", originAddress);
      console.log("Destination Address:", destinationAddress);
      const testAddress='noida sector 10'
      const response = await axios.get('http://localhost:3000/maps/get-direction', {
        params: {
          // origin: originAddress,
          origin:testAddress,
          destination: destinationAddress,
        },
      });
  
      console.log("Route response:", response.data);
  
      const encodedPolyline = response.data.routes[0]?.overview_polyline?.points;
  
      if (encodedPolyline) {
        const decodedPoints = polyline.decode(encodedPolyline);
        const latLngs = decodedPoints.map(([lat, lng]) => L.latLng(lat, lng));
        setRoutePolyline(latLngs);
  
        // Remove previous polyline if any
        if (polylineRef.current) {
          mapRef.current.removeLayer(polylineRef.current);
        }
  
        // Add new polyline
        const polylineLayer = L.polyline(latLngs, { color: 'blue', weight: 5 }).addTo(mapRef.current);
        polylineRef.current = polylineLayer;
  
        // Zoom to fit route
        mapRef.current.fitBounds(polylineLayer.getBounds());
      }
  
    } catch (err) {
      setError('Error fetching directions');
      console.error(err);
    }
  };
  
  
  
  useEffect(() => {
    if (originRef.current && destinationRef.current && (waitingForDrivers || waitingForUser)) {
      getDirections();
    }
  }, [originRef.current, destinationRef.current, waitingForDrivers, waitingForUser]);
  
  useEffect(() => {
    if (origin && destination && (waitingForDrivers || waitingForUser)) {
      getDirections();
    }
  }, [origin, destination, waitingForDrivers, waitingForUser]);
  
  
  useEffect(()=>{
console.log("the waiting for user is ",waitingForUser)
  },[waitingForUser])
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const additionalMarkerRef = useRef(null); // Reference for additional marker
  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(8); // Start with 50 km
  
  useEffect(()=>{
console.log("the waiting for driver value has now changed ", waitingForDrivers)
  },[waitingForDrivers])
  // Auto-detect if captain based on URL
  const isCaptain = window.location.pathname.toLowerCase().includes('captain');

  // Function to calculate location offset (in meters) from the original position
  const calculateOffsetLocation = (userLoc, distanceInKm = 100) => {
    // Convert kilometers to degrees
    const latOffset = distanceInKm / 111.32; // 1 degree = 111.32 km approximately
    const lngOffset = distanceInKm / (111.32 * Math.cos((userLoc.lat * Math.PI) / 180)); // Adjust for longitude

    const newLat = userLoc.lat + latOffset;
    const newLng = userLoc.lng + lngOffset;

    return { lat: newLat, lng: newLng };
  };

  useEffect(() => {
    if (mapRef.current !== null) return;

    const map = L.map('map').setView([position.lat, position.lng], 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([position.lat, position.lng], {
      icon: isCaptain ? captainIcon : userIcon,
    }).addTo(map);
    markerRef.current = marker;

    // Create the additional marker with dynamic offset
    const targetOffsetLocation = isCaptain
    ? calculateOffsetLocation(userLocation || position, distanceInKm)
    : calculateOffsetLocation(captainLocation || position, distanceInKm);
  
    if (waitingForDrivers || waitingForUser) {
      const offsetLocation = calculateOffsetLocation(position, distanceInKm); // <-- Move inside here
      additionalMarkerRef.current = L.marker([offsetLocation.lat, offsetLocation.lng], {
        icon: isCaptain ? userIcon : captainIcon,
      }).addTo(map);
    }
    

    const locateButton = L.control({ position: 'bottomright' });
    locateButton.onAdd = function () {
      const button = L.DomUtil.create('button', 'leaflet-bar');
      button.innerHTML = '📍';
      button.title = 'Find my location';
      button.style.cursor = 'pointer';
      button.style.backgroundColor = 'white';
      button.style.border = 'none';
      button.style.padding = '4px';
      button.style.borderRadius = '22px';
      button.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.2)';
      button.style.zIndex = '1000';
      button.style.fontSize = '25px';

      button.onclick = () => {
        if (loading) return;
        setLoading(true);
        button.innerHTML = '⏳';

        if (!navigator.geolocation) {
          setError('Geolocation is not supported by your browser.');
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setPosition(newPos);
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom();
              mapRef.current.setView(newPos, currentZoom);
            }
            if (markerRef.current) markerRef.current.setLatLng(newPos);

            const offsetLocation = calculateOffsetLocation(newPos, distanceInKm); // Update with dynamic distance
            if (additionalMarkerRef.current) {
              additionalMarkerRef.current.setLatLng([offsetLocation.lat, offsetLocation.lng]);
            }

            setLoading(false);
            button.innerHTML = '📍';
          },
          (err) => {
            setLoading(false);
            button.innerHTML = '📍';
            switch (err.code) {
              case err.PERMISSION_DENIED:
                setError('Permission to access location was denied.');
                break;
              case err.POSITION_UNAVAILABLE:
                setError('Location information is unavailable.');
                break;
              case err.TIMEOUT:
                setError('The request to get user location timed out. Please try again.');
                break;
              default:
                setError('An unknown error occurred.');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 10000,
          }
        );
      };

      return button;
    };
    locateButton.addTo(map);

    const buttonContainer = locateButton.getContainer();
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.bottom = locationMarkerPos ? '148px' : '260px';
    buttonContainer.style.right = '13px';
    buttonContainer.style.zIndex = '1000';

    const zoomControl = map.zoomControl;
    zoomControl.setPosition('topleft');
    zoomControl.getContainer().style.top = '60px';
    zoomControl.getContainer().style.left = '10px';

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [position, loading, locationMarkerPos, isCaptain, distanceInKm, waitingForDrivers]); // Adding distanceInKm as a dependency

useEffect(() => {
  const target = isCaptain ? userLocation : captainLocation;
  if (target?.lat && target?.lng && additionalMarkerRef.current) {
    const offsetLocation = calculateOffsetLocation(target, distanceInKm);
    additionalMarkerRef.current.setLatLng([offsetLocation.lat, offsetLocation.lng]);
  }
}, [captainLocation, userLocation, distanceInKm]);

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'jsonv2',
      },
      headers: {
        'Accept-Language': 'en',
      },
    });
    return res.data.display_name || 'Address not found';
  } catch (err) {
    return 'Error fetching address';
  }
};


  useEffect(() => {
    if (!currentLiveLocation || !setCurrentAddress || !setCurrentLiveLocation) return;

    const fetchAddress = async () => {
      const address = await reverseGeocode(position.lat, position.lng);
      setCurrentAddress(address);
    };

    fetchAddress();
    setCurrentLiveLocation(false);
  }, [currentLiveLocation]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const newPos = { lat: coords.latitude, lng: coords.longitude };
        setPosition(newPos);
        originRef.current = newPos;
        setOrigin(newPos); // ✅
  
        const offsetLocation = calculateOffsetLocation(newPos, distanceInKm);
        destinationRef.current = offsetLocation;
        setDestination(offsetLocation); // ✅
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  
    return () => navigator.geolocation.clearWatch(watchId);
  }, [distanceInKm]);
  

  return (
    <div
      id="map"
      className="w-full h-full"
      style={{ position: 'relative' }}
    >
  

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LiveTracking;