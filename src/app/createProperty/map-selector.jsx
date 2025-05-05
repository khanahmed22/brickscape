"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Replace with your Mapbox access token
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUta2V5LTEyMzQ1Njc4OTAiLCJhIjoiY2xleGFtcGxlIn0.example-signature"

export default function MapSelector({ onLocationSelect, initialAddress, initialCoordinates }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const [searchQuery, setSearchQuery] = useState(initialAddress || "")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(
    initialCoordinates || {
      lat: 40.7128, // Default to New York City
      lng: -74.006,
    },
  )

  // Initialize map
  useEffect(() => {
    if (map.current) return // Map already initialized

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCoordinates?.lng || currentLocation.lng, initialCoordinates?.lat || currentLocation.lat],
      zoom: 13,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: "#FF0000",
    })
      .setLngLat([initialCoordinates?.lng || currentLocation.lng, initialCoordinates?.lat || currentLocation.lat])
      .addTo(map.current)

    // Handle marker drag end
    marker.current.on("dragend", () => {
      const lngLat = marker.current.getLngLat()
      setCurrentLocation({
        lat: lngLat.lat,
        lng: lngLat.lng,
      })
      reverseGeocode(lngLat.lat, lngLat.lng)
    })

    map.current.on("load", () => {
      setMapLoaded(true)
    })

    // Handle map click to place marker
    map.current.on("click", (e) => {
      marker.current.setLngLat(e.lngLat)
      setCurrentLocation({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      })
      reverseGeocode(e.lngLat.lat, e.lngLat.lng)
    })

    // Try to get user's current location
    if (navigator.geolocation && !initialCoordinates) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
          })
          marker.current.setLngLat([longitude, latitude])
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

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map if initialCoordinates changes
  useEffect(() => {
    if (map.current && initialCoordinates?.lat && initialCoordinates?.lng) {
      map.current.flyTo({
        center: [initialCoordinates.lng, initialCoordinates.lat],
        zoom: 14,
      })
      marker.current.setLngLat([initialCoordinates.lng, initialCoordinates.lat])
      setCurrentLocation({
        lat: initialCoordinates.lat,
        lng: initialCoordinates.lng,
      })
    }
  }, [initialCoordinates])

  // Geocode address to coordinates
  const geocodeAddress = async () => {
    if (!searchQuery) return

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?access_token=${mapboxgl.accessToken}&limit=1`,
      )

      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center
        const placeName = data.features[0].place_name

        map.current.flyTo({
          center: [lng, lat],
          zoom: 14,
        })

        marker.current.setLngLat([lng, lat])

        setCurrentLocation({
          lat,
          lng,
        })

        setSearchQuery(placeName)
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
    }
  }

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&limit=1`,
      )

      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name
        setSearchQuery(placeName)

        // Pass the selected location back to parent component
        onLocationSelect(lat, lng, placeName)
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
      <form onSubmit={handleSubmit} className="flex gap-2">
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

      <div
        ref={mapContainer}
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
