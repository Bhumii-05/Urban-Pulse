from geoalchemy2.functions import ST_MakePoint, ST_SetSRID


WGS84_SRID = 4326


def create_point(
    latitude: float,
    longitude: float,
):
    """
    Create a PostGIS POINT using WGS84 coordinates.

    PostGIS expects:
        POINT(longitude latitude)
    """

    return ST_SetSRID(
        ST_MakePoint(
            longitude,
            latitude,
        ),
        WGS84_SRID,
    )