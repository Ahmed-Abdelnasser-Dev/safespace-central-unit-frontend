/**
 * Incident Decision Service
 * Provides API calls to confirm or reject accident reports.
 */
import axios from 'axios';
import { API_URL } from '../../../lib/apiConfig';

/**
 * Send confirmed decision with selected actions.
 * @param {string} incidentId
 * @param {number} nodeId
 * @param {string[]} actions - array of action ids
 */
export async function confirmAccident(incidentId, nodeId, actions) {
  const res = await axios.post(`${API_URL}/accident-decision`, {
    incidentId,
    nodeId,
    status: 'CONFIRMED',
    actions,
  });
  return res.data;
}

/**
 * Reject an accident report.
 * @param {string} incidentId
 * @param {number} nodeId
 * @param {string} message
 */
export async function rejectAccident(incidentId, nodeId, message = 'the accident is not correct') {
  const res = await axios.post(`${API_URL}/accident-decision`, {
    incidentId,
    nodeId,
    status: 'REJECTED',
    message,
  });
  return res.data;
}
