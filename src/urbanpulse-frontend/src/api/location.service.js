/**
 * Project Name: UrbanPulse
 * Group Name: Vision Crafters
 * Author(s): Sneha Kesharwani
 * Date of Last Modification: 13 September 2026
 * Brief Description: Handles API requests for location-related operations.
 */

// The Concerns API has no separate latitude/longitude fields — it takes
// one "location" string. This is the only place that formatting happens,
// so the shape can't drift between components.
export const coordsToLocationString = (latitude, longitude) =>
  `${latitude}, ${longitude}`
