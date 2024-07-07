import './app.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconArrow from './../projectInfo/images/icon-arrow.svg'
import iconLocation from './../projectInfo/images/icon-location.svg'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [data, setData] = useState({
    ip: '',
    location: '',
    placeId: '',
    timezone: '',
    isp: '',
    lat: '0',
    lng: '0'
  })

  function obtenerCoordenadasDesdeDireccion(direccion) {
    // console.log(direccion)
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${direccion}`

    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          // console.log('IP data - Dirección', data)
          const { lat, lon, name, place_id } = data[0]
          return {
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            placeName: name,
            placeId: place_id
          }
        } else {
          throw new Error(
            'No se encontraron coordenadas para la dirección proporcionada.'
          )
        }
      })
      .catch((error) => {
        console.error('Error al obtener coordenadas:', error)
        throw error
      })
  }

  async function obtenerDataDesdeIP(ip) {
    const baseUrl = 'https://geo.ipify.org/api/v2/country'
    const apiKey = 'at_JF6sySUdNO5eLRtnh0vSzltbO1W9l'

    try {
      const response = await fetch(
        `${baseUrl}?apiKey=${apiKey}&ipAddress=${ip}`
      )
      const data = await response.json()
      if (data !== undefined) {
        // console.log('IP data', data)
        const direccion = `${data.location.country}, ${data.location.region}`
        const { lat, lng, placeName, placeId } =
          await obtenerCoordenadasDesdeDireccion(direccion)
        setData({
          ip: data.ip,
          location: `${placeName}, ${data.location.country}`,
          placeId: placeId,
          timezone: `UTC ${data.location.timezone}`,
          isp: data.isp,
          lat: lat,
          lng: lng
        })
      }
    } catch (error) {
      console.error('Error al obtener Data desde IP:', error)
      throw error
    }
  }

  useEffect(() => {
    if (inputValue === '') {
      fetch('https://api.ipify.org?format=json')
        .then((response) => response.json())
        .then((data) => obtenerDataDesdeIP(data.ip))
    }
  }, [])

  // useEffect(() => {
  //   console.log(inputValue)
  // }, [inputValue])

  const handleSubmit = (event) => {
    event.preventDefault()
    obtenerDataDesdeIP(event.target[0].value)
    setInputValue('')
  }

  const RecenterMap = ({ lat, lng }) => {
    const map = useMap()
    useEffect(() => {
      map.setView([lat, lng], map.getZoom())
    }, [lat, lng, map])
    return null
  }

  const svgIconMarker = L.divIcon({
    html: `<img src="${iconLocation}" alt="Location Icon" style="width: 24px; height: 32px;" />`,
    iconSize: [24, 32], // Size of the icon container
    iconAnchor: [12, 32], // Position the anchor at the center bottom of the icon
    popupAnchor: [0, -32], // Position the popup anchor
    className: 'bg-transparent'
  })

  return (
    <div className="container m-auto flex h-screen flex-col">
      <div className="bg-responsive h-80 bg-desktop md:h-60 ">
        <div className=" relative m-auto flex h-full flex-col gap-8">
          <div className="flex flex-col items-center gap-8 pt-8">
            <h1 className="text-3xl font-bold text-white">
              IP Address Tracker
            </h1>
            <div className="flex w-full justify-center">
              <form
                onSubmit={handleSubmit}
                className="mx-8 flex w-full md:w-fit"
              >
                <input
                  type="text"
                  placeholder="Search for any IP address or domain"
                  className="w-full rounded-l-xl border-none p-2 outline-none md:w-96"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                />
                <button
                  type="submit"
                  className=" w-10 rounded-r-xl bg-black hover:bg-gray-900 disabled:bg-gray-500"
                  disabled={inputValue ? false : true}
                >
                  <img src={iconArrow} className="m-auto" />
                </button>
              </form>
            </div>
          </div>
          <div className=" absolute inset-x-0 -bottom-32 z-[500] mx-8 grid grid-rows-4 rounded-xl border border-solid bg-white py-2 md:-bottom-20 md:mx-32 md:h-40 md:grid-cols-4 md:grid-rows-1 md:divide-x md:p-8">
            <div className=" self-center text-center md:self-auto md:pl-8 md:text-left">
              <p className="text-xs font-bold text-gray-500">IP ADDRESS</p>
              <p className="font-bold">{data.ip}</p>
            </div>
            <div className="h-full self-center text-center md:self-auto md:pl-8 md:text-left">
              <p className="text-xs font-bold text-gray-500">LOCATION</p>
              <p className="font-bold">{data.location}</p>
              <p className="font-bold">{data.placeId}</p>
            </div>
            <div className="self-center text-center md:self-auto md:pl-8 md:text-left">
              <p className="text-xs font-bold text-gray-500">TIMEZONE</p>
              <p className="font-bold">{data.timezone}</p>
            </div>
            <div className="self-center text-center md:self-auto md:pl-8 md:text-left ">
              <p className="text-xs font-bold text-gray-500">ISP</p>
              <p className="font-bold">{data.isp}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <MapContainer
          center={[data.lat, data.lng]}
          zoom={10}
          zoomControl={false}
          scrollWheelZoom={true}
          className="h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[data.lat, data.lng]} icon={svgIconMarker} />
          <RecenterMap lat={data.lat} lng={data.lng} />
        </MapContainer>
      </div>
    </div>
  )
}

export default App
