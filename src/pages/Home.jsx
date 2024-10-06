import { SpotContainer } from '../components/SpotContainer'
import { SpotInfoContainer } from '../components/SpotInfoContainer'
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet'
import '../assets/Home.css'
import 'leaflet/dist/leaflet.css'
import {Icon, imageOverlay} from 'leaflet'
import {React, useState, useEffect, useCallback, Fragment} from 'react'
import NavBar from '../components/NavBar'
import {ref, listAll, getDownloadURL} from 'firebase/storage'
import {child, ref as dbRef, getDatabase, onValue} from 'firebase/database'
import { imgDB, rtDB, auth } from '../firebaseconfig'
import { onAuthStateChanged } from 'firebase/auth'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'

export default function Home() {
  const [spots, setSpots] = useState([])
  const [position, setPosition] = useState({latitude: 43.747474670410156, longitude: -79.49417877197266})
  const [spotID, setSpotID] = useState(0)
  const [isSpotClicked, setIsSpotClicked] = useState(false)
  const [markersData, setMarkersData] = useState()
  // const [authUser, setAuthUser] = useState(null);
  const imageListRef = ref(imgDB, 'images/')
  const databaseRef = dbRef(rtDB, 'spots/')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobileWidth, setIsMobileWidth] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [filteredData, setFilteredData] = useState()

  let autoResize = () => {
    if (window.innerWidth < 700 ){
        setIsMobileWidth(true)
        
    } else {
        setIsMobileWidth(false)
    }
}

  useEffect(() => {
      window.addEventListener('resize', autoResize)
      autoResize();  
  }, [])

  function showMap() {
    document.getElementById('mapcontainuh').style.display = 'block'
  }

  useEffect(() => {
    onValue(databaseRef, (snapshot) => {
      if (snapshot.size != spots.length) {
        const newSpots = []
        snapshot.forEach(childSnapShot => {
          newSpots.push(childSnapShot.val())
        })
        setMarkersData(newSpots)
        setFilteredData(newSpots)
        setSpots(newSpots)
      }
    })

    const successCallback = (position) => {
      setPosition({latitude: position.coords.latitude, longitude: position.coords.longitude});
    }
    
    navigator.geolocation.getCurrentPosition(successCallback);
  }, [])

  function getSpotContent(obj) {
    setIsSpotClicked(true)
    setSpotID(obj.currentTarget.id)
    setPosition({latitude: filteredData[obj.currentTarget.id].lat, longitude: filteredData[obj.currentTarget.id].long})
  }

  function markerClick(id) {
    setIsSpotClicked(true)
    setSpotID(id)
    setPosition({latitude: filteredData[id].lat, longitude: filteredData[id].long})
  }

  function spotClick() {
    setIsSpotClicked(false)
    setCurrentIndex(0)
  }

  const customIcon = new Icon({
    iconUrl: "https://cdn2.iconfinder.com/data/icons/activity-5/50/1F6F9-skateboard-512.png",
    iconSize: [64, 64]
  })

  function SetViewOnClick() {
    const map = useMap()
    if (isSpotClicked) {
      map.flyTo([position.latitude, position.longitude], 18,
      {
        animate: true,
        duration: 2
      }) 
    } else {
      map.flyTo([position.latitude, position.longitude], 10, {
        animate: true,
        duration: 2 
      })
    }
    return null
  }

  const buttonStyle = {
    width: "3vw",
    height: "3vw",
    background: 'none',
    border: '0px',
}

const properties = {
    canSwipe: true,
    transitionDuration: 100,
    prevArrow: <button className = 'button' style={{ ...buttonStyle }}>&lt;</button>,
    nextArrow: <button className = 'button' style={{ ...buttonStyle }}>&gt;</button>
}

  return (
    <Fragment>
      <NavBar/>
      <div className = 'bigContainer'>
      {markersData ? (
        <MapContainer id = "mapcontainuh" center={[position.latitude, position.longitude]} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick/>
        {filteredData ? (
          <div>
          {filteredData.map((spot, i) => (
            <>
            <Marker
              id = {i} 
              position = {[spot.lat, spot.long]} 
              icon = {customIcon}
              eventHandlers={{
                click: (e) => {
                  markerClick(e.target.options.id)
                }
              }}
            /> 
            </>
            ))
          }
          </div> 
        ):(
          <></>
        )}
      </MapContainer>
      ):(
        null
        )}
      
      { isSpotClicked ? (
        <div className = "spotWindow">
          {markersData ? (
                <SpotInfoContainer properties={properties} spotID={spotID} markersData={markersData} spotClick={spotClick} showMap={showMap} filteredData={filteredData} position={position}/>
          ) : (
            <></>
          )}
        </div>
      ):(
        <>
        {markersData ? (
          <SpotContainer  markersData={markersData} getSpotContent={getSpotContent} filteredData={filteredData} setFilteredData={setFilteredData}/>
          ) : (
            null
          )
        }
        </>
      )}
      </div>
    </Fragment>
  )
}