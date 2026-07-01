export const CAN_MANAGE_CAMERAS = ['admin', 'node_maintenance_crew'];

export function canManageCameras(role) {
  return CAN_MANAGE_CAMERAS.includes(role);
}
