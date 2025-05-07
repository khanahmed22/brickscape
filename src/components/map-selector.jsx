"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import "leaflet/dist/leaflet.css"

export default function MapSelector({ onLocationSelect, initialAddress, initialCoordinates }) {
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const markerRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState(initialAddress || "")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState("")
  const [currentLocation, setCurrentLocation] = useState(
    initialCoordinates || {
      lat: 40.7128, // Default to New York City
      lng: -74.006,
    },
  )


  useEffect(() => {
   
    const initializeMap = async () => {
      try {
      
        const L = (await import("leaflet")).default

     
        if (!mapRef.current) {
      
          const map = L.map(mapContainerRef.current).setView(
            [initialCoordinates?.lat || currentLocation.lat, initialCoordinates?.lng || currentLocation.lng],
            13,
          )

        
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map)

        
          const icon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })

       
          const marker = L.marker(
            [initialCoordinates?.lat || currentLocation.lat, initialCoordinates?.lng || currentLocation.lng],
            { draggable: true, icon },
          ).addTo(map)

          // Handle marker drag end
          marker.on("dragend", () => {
            const position = marker.getLatLng()
            setCurrentLocation({
              lat: position.lat,
              lng: position.lng,
            })
            reverseGeocode(position.lat, position.lng)
          })

          // Handle map click to place marker
          map.on("click", (e) => {
            marker.setLatLng(e.latlng)
            setCurrentLocation({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            })
            reverseGeocode(e.latlng.lat, e.latlng.lng)
          })

          // Try to get user's current location if no initial coordinates
          if (navigator.geolocation && !initialCoordinates) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords
                map.setView([latitude, longitude], 14)
                marker.setLatLng([latitude, longitude])
                setCurrentLocation({
                  lat: latitude,
                  lng: longitude,
                })
                reverseGeocode(latitude, longitude)
              },
              (error) => {
                console.error("Error getting location:", error)
              },
            )
          }

          // Store references
          mapRef.current = map
          markerRef.current = marker
          setMapLoaded(true)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
        setError("Failed to load map. Please try again later.")
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Update map if initialCoordinates changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && initialCoordinates?.lat && initialCoordinates?.lng) {
      mapRef.current.setView([initialCoordinates.lat, initialCoordinates.lng], 14)
      markerRef.current.setLatLng([initialCoordinates.lat, initialCoordinates.lng])
      setCurrentLocation({
        lat: initialCoordinates.lat,
        lng: initialCoordinates.lng,
      })
    }
  }, [initialCoordinates])

  // Geocode address to coordinates using Nominatim (OpenStreetMap's free geocoding service)
  const geocodeAddress = async () => {
    if (!searchQuery) return

    try {
      setError("")
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            "Accept-Language": "en", // Prefer English results
          },
        },
      )

      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lon], 14)
          markerRef.current.setLatLng([lat, lon])
        }

        setCurrentLocation({
          lat: Number.parseFloat(lat),
          lng: Number.parseFloat(lon),
        })

        setSearchQuery(display_name)
      } else {
        setError("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      setError("Failed to search for location. Please try again.")
    }
  }

  // Reverse geocode coordinates to address using Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      setError("")
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en", // Prefer English results
          },
        },
      )

      const data = await response.json()

      if (data && data.display_name) {
        setSearchQuery(data.display_name)

        // Pass the selected location back to parent component
        onLocationSelect(lat, lng, data.display_name)
      } else {
        console.error("No address found for these coordinates")
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    geocodeAddress()
  }

  // Confirm location selection
  const confirmLocation = () => {
    onLocationSelect(currentLocation.lat, currentLocation.lng, searchQuery)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2" id="form">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for an address"
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          <MapPin className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        ref={mapContainerRef}
        className="h-[400px] w-full rounded-md border"
        aria-label="Map for selecting property location"
      />

      <div className="flex justify-end">
        <Button onClick={confirmLocation} type="button">
          Confirm Location
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Click on the map to place a marker or drag the marker to select the exact location of your property.
      </p>
    </div>
  )
}
