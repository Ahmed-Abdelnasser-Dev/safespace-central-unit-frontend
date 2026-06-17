import { describe, expect, it } from 'vitest';
import { getDefaultUnitTypes, selectDefaultUnitIds } from './dispatchDefaults';

describe('getDefaultUnitTypes', () => {
  it('maps SOS emergencyType to the right unit types', () => {
    expect(getDefaultUnitTypes({ caseType: 'sos', emergencyType: 'MEDICAL' })).toEqual(['ambulance']);
    expect(getDefaultUnitTypes({ caseType: 'sos', emergencyType: 'FIRE' })).toEqual(['ambulance', 'fire']);
    expect(getDefaultUnitTypes({ caseType: 'sos', emergencyType: 'POLICE' })).toEqual(['ambulance', 'police']);
    expect(getDefaultUnitTypes({ caseType: 'sos', emergencyType: 'ROAD_ACCIDENT' })).toEqual([
      'ambulance',
      'police',
      'civil_protection',
    ]);
    expect(getDefaultUnitTypes({ caseType: 'sos', emergencyType: 'UNSPECIFIED' })).toEqual([
      'ambulance',
      'police',
      'civil_protection',
    ]);
  });

  it('maps incident incidentType to the right unit types', () => {
    expect(getDefaultUnitTypes({ caseType: 'incident', incidentType: 'COLLISION' })).toEqual([
      'ambulance',
      'police',
      'civil_protection',
    ]);
    expect(getDefaultUnitTypes({ caseType: 'incident', incidentType: 'STOPPED_VEHICLE' })).toEqual(['police']);
    expect(getDefaultUnitTypes({ caseType: 'incident', incidentType: 'ROAD_HAZARD' })).toEqual([
      'police',
      'civil_protection',
    ]);
    expect(getDefaultUnitTypes({ caseType: 'incident', incidentType: 'UNSPECIFIED' })).toEqual([
      'ambulance',
      'police',
      'civil_protection',
    ]);
  });

  it('falls back to the unspecified set for an unrecognized type', () => {
    expect(getDefaultUnitTypes({ caseType: 'sos', emergencyType: 'SOMETHING_NEW' })).toEqual([
      'ambulance',
      'police',
      'civil_protection',
    ]);
  });
});

describe('selectDefaultUnitIds', () => {
  it('picks the nearest available unit of each required type', () => {
    // already ranked nearest-first, as rankByDistance would produce
    const rankedUnits = [
      { id: 'amb-near', unitType: 'ambulance', status: 'available', distanceKm: 1 },
      { id: 'police-near', unitType: 'police', status: 'available', distanceKm: 2 },
      { id: 'amb-far', unitType: 'ambulance', status: 'available', distanceKm: 5 },
      { id: 'civil-near', unitType: 'civil_protection', status: 'available', distanceKm: 3 },
    ];

    const selected = selectDefaultUnitIds(rankedUnits, { caseType: 'sos', emergencyType: 'ROAD_ACCIDENT' });

    expect(selected).toEqual(['amb-near', 'police-near', 'civil-near']);
  });

  it('skips a required type entirely when no available unit of that type exists', () => {
    const rankedUnits = [{ id: 'amb-near', unitType: 'ambulance', status: 'available', distanceKm: 1 }];

    const selected = selectDefaultUnitIds(rankedUnits, { caseType: 'sos', emergencyType: 'ROAD_ACCIDENT' });

    expect(selected).toEqual(['amb-near']);
  });

  it('ignores units that are not available', () => {
    const rankedUnits = [
      { id: 'amb-busy', unitType: 'ambulance', status: 'en_route', distanceKm: 1 },
      { id: 'amb-free', unitType: 'ambulance', status: 'available', distanceKm: 4 },
    ];

    const selected = selectDefaultUnitIds(rankedUnits, { caseType: 'sos', emergencyType: 'MEDICAL' });

    expect(selected).toEqual(['amb-free']);
  });

  it('returns an empty array when no units are available', () => {
    expect(selectDefaultUnitIds([], { caseType: 'sos', emergencyType: 'MEDICAL' })).toEqual([]);
  });
});
