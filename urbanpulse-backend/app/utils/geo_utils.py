from geoalchemy2.functions import ST_MakePoint, ST_SetSRID


WGS84_SRID = 4326


def create_point(
    latitude: float,
    longitude: float,
):
    """
    Create a PostGIS POINT using WGS84 coordinates.

    Input:
        latitude
        longitude

    PostGIS POINT order:
        POINT(longitude latitude)

    Example:
        latitude = 22.522295090296844
        longitude = 88.39383270947972

        Result:
        POINT(88.39383270947972 22.522295090296844)
    """

    return ST_SetSRID(
        ST_MakePoint(
            longitude,
            latitude,
        ),
        WGS84_SRID,
    )


def parse_location(location):
    """
    Convert API location input into latitude and longitude.

    Supported formats:

    1. String:
        "22.522295090296844, 88.39383270947972"

    2. Dictionary:
        {
            "latitude": 22.522295090296844,
            "longitude": 88.39383270947972
        }

    3. Dictionary using lat/lng:
        {
            "lat": 22.522295090296844,
            "lng": 88.39383270947972
        }

    Returns:
        (latitude, longitude)
    """

    if isinstance(location, str):
        parts = location.split(",")

        if len(parts) != 2:
            raise ValueError(
                "Location must be in "
                "'latitude, longitude' format."
            )

        try:
            latitude = float(parts[0].strip())
            longitude = float(parts[1].strip())
        except ValueError:
            raise ValueError(
                "Latitude and longitude must be valid numbers."
            )

    elif isinstance(location, dict):
        latitude = location.get("latitude")
        longitude = location.get("longitude")

        if latitude is None:
            latitude = location.get("lat")

        if longitude is None:
            longitude = location.get("lng")

        if latitude is None or longitude is None:
            raise ValueError(
                "Location must contain latitude and longitude."
            )

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            raise ValueError(
                "Latitude and longitude must be valid numbers."
            )

    else:
        raise ValueError(
            "Unsupported location format."
        )

    if not -90 <= latitude <= 90:
        raise ValueError(
            "Latitude must be between -90 and 90."
        )

    if not -180 <= longitude <= 180:
        raise ValueError(
            "Longitude must be between -180 and 180."
        )

    return latitude, longitude