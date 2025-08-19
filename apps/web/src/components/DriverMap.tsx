'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { LatLngExpression, LatLngLiteral } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type SelectMode = 'pickup' | 'dest'

interface DriverMapProps {
  mode: SelectMode
  center: LatLngExpression
  pickup: LatLngLiteral | null
  dest: LatLngLiteral | null
  onPick: (latlng: LatLngLiteral) => void
  onDest: (latlng: LatLngLiteral) => void
}

const pickupIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#2563eb;border:2px solid #fff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.2);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 14]
})

const destIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;background:#dc2626;border:2px solid #fff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.2);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 14]
})

const ClickHandler: React.FC<{ mode: SelectMode; onPick: (ll: LatLngLiteral) => void; onDest: (ll: LatLngLiteral) => void }>
  = ({ mode, onPick, onDest }) => {
  useMapEvents({
    click: (e) => {
      const ll = { lat: e.latlng.lat, lng: e.latlng.lng }
      if (mode === 'pickup') onPick(ll)
      else onDest(ll)
    }
  })
  return null
}

const DriverMap: React.FC<DriverMapProps> = ({ mode, center, pickup, dest, onPick, onDest }) => {
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-64 w-full rounded-lg overflow-hidden z-0">
      <TileLayer
        attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler mode={mode} onPick={onPick} onDest={onDest} />
      {pickup && <Marker position={pickup} icon={pickupIcon} />}
      {dest && <Marker position={dest} icon={destIcon} />}
    </MapContainer>
  )
}

export default DriverMap


