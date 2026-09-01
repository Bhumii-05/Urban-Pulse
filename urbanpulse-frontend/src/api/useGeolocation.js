import { useCallback, useEffect, useState } from 'react'
import { coordsToLocationString } from '../api/location.service'

/**
 * Requests the browser's real GPS location on mount and exposes it as the
 * "lat, lng" string the Concerns API expects. Never falls back to a
 * hardcoded location — if GPS fails or is denied, status becomes 'error'
 * and the caller should block submission until the person retries.
 */
export function useGeolocation() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [coords, setCoords] = useState(null)
  const [location, setLocation] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setErrorMessage('Your browser does not support location detection.')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        setLocation(coordsToLocationString(latitude, longitude))
        setStatus('success')
      },
      (error) => {
        setStatus('error')
        setCoords(null)
        setLocation(null)
        setErrorMessage(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission is required to report a concern.'
            : 'We could not detect your location.'
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [])

  useEffect(() => {
    request()
  }, [request])

  return { status, coords, location, errorMessage, retry: request }
}
