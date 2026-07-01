import { describe, expect, it } from 'vitest';
import {
  getAssignmentStatusStyle,
  getCaseStatusStyle,
  getCaseTypeLabel,
  getSeverityStyle,
  getUnitStatusStyle,
  getUnitTypeIcon,
  getUnitTypeLabel,
  timeSince,
} from './caseFormatters';

describe('getSeverityStyle', () => {
  it('returns a distinct badge variant + label for every severity', () => {
    expect(getSeverityStyle('HIGH')).toEqual({ variant: 'danger', label: 'High' });
    expect(getSeverityStyle('MEDIUM')).toEqual({ variant: 'accent', label: 'Medium' });
    expect(getSeverityStyle('LOW')).toEqual({ variant: 'info', label: 'Low' });
  });

  it('falls back to a neutral style for an unknown severity rather than throwing', () => {
    expect(getSeverityStyle('UNKNOWN')).toEqual({ variant: 'neutral', label: 'UNKNOWN' });
  });
});

describe('getUnitStatusStyle', () => {
  it('returns a distinct badge variant + label for every unit status', () => {
    expect(getUnitStatusStyle('available')).toEqual({ variant: 'success', label: 'Available' });
    expect(getUnitStatusStyle('en_route')).toEqual({ variant: 'info', label: 'En Route' });
    expect(getUnitStatusStyle('on_scene')).toEqual({ variant: 'accent', label: 'On Scene' });
    expect(getUnitStatusStyle('off_duty')).toEqual({ variant: 'neutral', label: 'Off Duty' });
  });
});

describe('getAssignmentStatusStyle', () => {
  it('returns a distinct badge variant + label for every assignment status', () => {
    expect(getAssignmentStatusStyle('notified')).toEqual({ variant: 'neutral', label: 'Notified' });
    expect(getAssignmentStatusStyle('en_route')).toEqual({ variant: 'info', label: 'En Route' });
    expect(getAssignmentStatusStyle('on_scene')).toEqual({ variant: 'accent', label: 'On Scene' });
    expect(getAssignmentStatusStyle('completed')).toEqual({ variant: 'success', label: 'Completed' });
    expect(getAssignmentStatusStyle('cancelled')).toEqual({ variant: 'neutral', label: 'Cancelled' });
  });
});

describe('getCaseStatusStyle', () => {
  it('returns a distinct badge variant + label for every case status', () => {
    expect(getCaseStatusStyle('received')).toEqual({ variant: 'neutral', label: 'Received' });
    expect(getCaseStatusStyle('active')).toEqual({ variant: 'info', label: 'Active' });
    expect(getCaseStatusStyle('escalated')).toEqual({ variant: 'accent', label: 'Escalated' });
    expect(getCaseStatusStyle('closed')).toEqual({ variant: 'neutral', label: 'Closed' });
  });
});

describe('getUnitTypeLabel / getUnitTypeIcon', () => {
  it('returns a human label for every unit type', () => {
    expect(getUnitTypeLabel('ambulance')).toBe('Ambulance');
    expect(getUnitTypeLabel('police')).toBe('Police');
    expect(getUnitTypeLabel('fire')).toBe('Fire');
    expect(getUnitTypeLabel('civil_protection')).toBe('Civil Protection');
  });

  it('returns a registered icon name for every unit type', () => {
    expect(getUnitTypeIcon('ambulance')).toBe('truck-medical');
    expect(getUnitTypeIcon('police')).toBe('shield-halved');
    expect(getUnitTypeIcon('fire')).toBe('fire-flame-curved');
    expect(getUnitTypeIcon('civil_protection')).toBe('hard-hat');
  });
});

describe('getCaseTypeLabel', () => {
  it('formats SOS emergencyType into a human label', () => {
    expect(getCaseTypeLabel({ caseType: 'sos', emergencyType: 'ROAD_ACCIDENT' })).toBe('Road Accident');
    expect(getCaseTypeLabel({ caseType: 'sos', emergencyType: 'UNSPECIFIED' })).toBe('Unspecified');
  });

  it('formats incident incidentType into a human label', () => {
    expect(getCaseTypeLabel({ caseType: 'incident', incidentType: 'COLLISION' })).toBe('Collision');
    expect(getCaseTypeLabel({ caseType: 'incident', incidentType: 'STOPPED_VEHICLE' })).toBe('Stopped Vehicle');
  });
});

describe('timeSince', () => {
  it('renders a "just now" style label for sub-minute durations', () => {
    const now = Date.parse('2026-06-16T12:00:00Z');
    const receivedAt = new Date(now - 10 * 1000).toISOString();
    expect(timeSince(receivedAt, now)).toBe('just now');
  });

  it('renders whole minutes for sub-hour durations', () => {
    const now = Date.parse('2026-06-16T12:00:00Z');
    const receivedAt = new Date(now - 5 * 60 * 1000).toISOString();
    expect(timeSince(receivedAt, now)).toBe('5 min ago');
  });

  it('renders whole hours for durations of an hour or more', () => {
    const now = Date.parse('2026-06-16T12:00:00Z');
    const receivedAt = new Date(now - 3 * 60 * 60 * 1000).toISOString();
    expect(timeSince(receivedAt, now)).toBe('3 hr ago');
  });
});
