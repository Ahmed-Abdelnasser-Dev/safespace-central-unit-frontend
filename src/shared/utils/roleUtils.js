export const CAN_MANAGE_CAMERAS = ['ADMINISTRATOR', 'NODE_MAINTAINER'];

export function canManageCameras(role) {
  return CAN_MANAGE_CAMERAS.includes(role);
}
