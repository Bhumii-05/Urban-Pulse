import { Trash2, Ban, CalendarClock, Wrench } from 'lucide-react'

// Single source of truth for category + priority values so the exact
// backend strings (overflowing_bin, illegal_dumping, ...) never get
// hardcoded or duplicated across components.
export const CONCERN_CATEGORIES = [
  {
    value: 'overflowing_bin',
    label: 'Overflowing Bin',
    icon: Trash2,
  },
  {
    value: 'illegal_dumping',
    label: 'Illegal Dumping',
    icon: Ban,
  },
  {
    value: 'missed_pickup',
    label: 'Missed Pickup',
    icon: CalendarClock,
  },
  {
    value: 'damaged_bin',
    label: 'Damaged Bin',
    icon: Wrench,
  },
]

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const DEFAULT_PRIORITY = 'medium'

export const getCategoryLabel = (value) =>
  CONCERN_CATEGORIES.find((c) => c.value === value)?.label ?? value

export const getPriorityLabel = (value) =>
  PRIORITY_LEVELS.find((p) => p.value === value)?.label ?? value
