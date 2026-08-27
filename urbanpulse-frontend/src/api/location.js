// The Concerns API has no separate latitude/longitude fields — it takes
// one "location" string. This is the only place that formatting happens,
// so the shape can't drift between components.
export const coordsToLocationString = (latitude, longitude) =>
  `${latitude}, ${longitude}`
