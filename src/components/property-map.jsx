"use client"

import { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"

export default function PropertyMap({ coordinates, address, propertyTitle }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setIsMapReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    
    if (!isMapReady || !coordinates || !coordinates.lat || !coordinates.lng || !mapContainerRef.current) {
      return
    }

    const initializeMap = async () => {
      try {
        
        const L = (await import("leaflet")).default

        
        if (!mapRef.current) {
          console.log("Initializing map with coordinates:", coordinates)

         
          const map = L.map(mapContainerRef.current, {
            
            zoomAnimation: false,
          }).setView([coordinates.lat, coordinates.lng], 15)

         
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

          
          const marker = L.marker([coordinates.lat, coordinates.lng], { icon }).addTo(map)

          
          if (propertyTitle || address) {
            const popupContent = `
              <div>
                <strong>${propertyTitle || "Property"}</strong>
                ${address ? `<br>${address}` : ""}
              </div>
            `
            marker.bindPopup(popupContent).openPopup()
          }

          
          mapRef.current = map
          markerRef.current = marker

          
          setTimeout(() => {
            if (map) {
              map.invalidateSize()
            }
          }, 250)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [coordinates, address, propertyTitle, isMapReady])

  
  useEffect(() => {
    if (mapRef.current && markerRef.current && coordinates?.lat && coordinates?.lng) {
      mapRef.current.setView([coordinates.lat, coordinates.lng], 15)
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng])

      
      mapRef.current.invalidateSize()
    }
  }, [coordinates])

  return (
    <div
      ref={mapContainerRef}
      className="h-[400px] w-full rounded-md border"
      style={{ minHeight: "400px", position: "relative" }}
      aria-label="Map showing property location"
    />
  )
}
