/**
 * NodeCreationWizard — 5-step guided node creation.
 * Replaces AddNodeModal. Configures the node during creation.
 */
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal.jsx';
import Stepper from '@/components/ui/Stepper.jsx';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import LocationPicker from './LocationPicker.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const STEPS = [
  { id: 'identity', label: 'Identity & Location' },
  { id: 'camera', label: 'Camera & Stream' },
  { id: 'detection', label: 'Detection' },
  { id: 'road', label: 'Road & Lanes' },
  { id: 'review', label: 'Review' },
];

const LANE_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'right', label: 'Right-turn only' },
  { value: 'left', label: 'Left-turn only' },
];

const LANE_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'hov', label: 'HOV' },
];

const RESOLUTION_OPTIONS = [
  { value: '1920x1080', label: '1920×1080 (Full HD)' },
  { value: '2560x1440', label: '2560×1440 (2K)' },
  { value: '3840x2160', label: '3840×2160 (4K)' },
  { value: '1280x720', label: '1280×720 (HD)' },
];

const DEFAULT_FORM = {
  // Step 1
  nodeId: '',
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  // Step 2
  cameraResolution: '1920x1080',
  frameRate: '30',
  ipAddress: '192.168.1.200',
  videoFeedUrl: '',
  bandwidth: '100 Mbps',
  // Step 3
  detectionSensitivity: 70,
  minObjectSize: 50,
  firmwareVersion: '1.0.0',
  modelVersion: 'yolov8n-2026.01',
  // Step 4
  speedLimit: 80,
  lanes: [],
};

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-safe-text-primary mb-1.5">
      {children}
      {required && <span className="text-safe-danger ml-0.5">*</span>}
    </label>
  );
}

function SliderField({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-safe-text-primary">{label}</label>
        <span className="text-sm font-bold text-safe-blue">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-safe-gray-light rounded-lg appearance-none cursor-pointer accent-safe-blue-btn"
      />
      <div className="flex justify-between text-[10px] text-safe-text-muted mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function NodeCreationWizard({ isOpen, onClose, onSubmit, existingNodeIds, isSubmitting, submissionError }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [stepError, setStepError] = useState('');
  const [newLane, setNewLane] = useState({ name: '', type: 'standard', status: 'open' });

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      setCompletedSteps([]);
      setForm(DEFAULT_FORM);
      setStepError('');
      setNewLane({ name: '', type: 'standard', status: 'open' });
    }
  }, [isOpen]);

  const currentStep = STEPS[stepIndex];

  const setField = (field) => (e) => {
    const val = e && e.target !== undefined ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: val }));
    setStepError('');
  };

  const handleLocationChange = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setStepError('');
  };

  const validateStep = () => {
    switch (stepIndex) {
      case 0: { // Identity & Location
        const id = form.nodeId.trim();
        if (!id) return 'Node ID is required.';
        if (existingNodeIds?.some((eid) => eid.toLowerCase() === id.toLowerCase()))
          return 'Node ID already exists. Choose a unique ID.';
        if (!form.address.trim()) return 'Location address is required.';
        const lat = Number(form.latitude);
        const lng = Number(form.longitude);
        if (isNaN(lat) || lat < -90 || lat > 90) return 'Latitude must be between -90 and 90.';
        if (isNaN(lng) || lng < -180 || lng > 180) return 'Longitude must be between -180 and 180.';
        return null;
      }
      case 1: { // Camera & Stream
        if (!form.ipAddress.trim()) return 'IP address is required.';
        return null;
      }
      case 2: // Detection — no required fields
      case 3: // Road & Lanes — speed limit has a default
      case 4: // Review
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) { setStepError(error); return; }
    setCompletedSteps((prev) => [...new Set([...prev, currentStep.id])]);
    setStepIndex((i) => i + 1);
    setStepError('');
  };

  const handleBack = () => {
    setStepIndex((i) => i - 1);
    setStepError('');
  };

  const handleAddLane = () => {
    if (!newLane.name.trim()) return;
    const lane = {
      id: `lane-${Date.now()}`,
      name: newLane.name.trim(),
      type: newLane.type,
      status: newLane.status,
    };
    setForm((prev) => ({ ...prev, lanes: [...prev.lanes, lane] }));
    setNewLane({ name: '', type: 'standard', status: 'open' });
  };

  const handleRemoveLane = (laneId) => {
    setForm((prev) => ({ ...prev, lanes: prev.lanes.filter((l) => l.id !== laneId) }));
  };

  const handleSubmit = () => {
    onSubmit({
      nodeId: form.nodeId.trim(),
      name: form.name.trim() || form.nodeId.trim(),
      location: {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address.trim(),
      },
      nodeSpecs: {
        cameraResolution: form.cameraResolution,
        frameRate: parseInt(form.frameRate) || 30,
        ipAddress: form.ipAddress.trim(),
        bandwidth: form.bandwidth.trim() || '100 Mbps',
        detectionSensitivity: form.detectionSensitivity,
        minObjectSize: form.minObjectSize,
      },
      firmwareVersion: form.firmwareVersion.trim() || '1.0.0',
      modelVersion: form.modelVersion.trim() || 'yolov8n-2026.01',
      videoFeedUrl: form.videoFeedUrl.trim(),
      roadRules: {
        speedLimit: form.speedLimit,
        lanes: form.lanes,
      },
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setStepIndex(0);
    setCompletedSteps([]);
    setForm(DEFAULT_FORM);
    setStepError('');
    setNewLane({ name: '', type: 'standard', status: 'open' });
    onClose();
  };

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Node ID</FieldLabel>
                <Input value={form.nodeId} onChange={setField('nodeId')} placeholder="NODE-007" />
                <p className="text-[10px] text-safe-text-muted mt-1">Unique identifier. Cannot be changed after creation.</p>
              </div>
              <div>
                <FieldLabel>Display Name</FieldLabel>
                <Input value={form.name} onChange={setField('name')} placeholder="Highway A1 — Exit 23B" />
              </div>
              <div className="col-span-2">
                <FieldLabel required>Location Address</FieldLabel>
                <Input value={form.address} onChange={setField('address')} placeholder="Highway A1, Exit 23B, Ismailia" />
                <p className="text-[10px] text-safe-text-muted mt-1">Address search via map coming soon — type manually for now.</p>
              </div>
            </div>

            <div>
              <FieldLabel required>Pin Location on Map</FieldLabel>
              <LocationPicker
                lat={form.latitude !== '' ? Number(form.latitude) : null}
                lng={form.longitude !== '' ? Number(form.longitude) : null}
                onChange={handleLocationChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Latitude</FieldLabel>
                <Input
                  value={form.latitude}
                  onChange={setField('latitude')}
                  placeholder="30.0131"
                  type="text"
                  inputMode="decimal"
                />
              </div>
              <div>
                <FieldLabel required>Longitude</FieldLabel>
                <Input
                  value={form.longitude}
                  onChange={setField('longitude')}
                  placeholder="32.5498"
                  type="text"
                  inputMode="decimal"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Camera Resolution</FieldLabel>
                <Select value={form.cameraResolution} onChange={setField('cameraResolution')}>
                  {RESOLUTION_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel>Frame Rate (fps)</FieldLabel>
                <Input value={form.frameRate} onChange={setField('frameRate')} placeholder="30" type="text" inputMode="numeric" />
              </div>
              <div>
                <FieldLabel required>IP Address</FieldLabel>
                <Input value={form.ipAddress} onChange={setField('ipAddress')} placeholder="192.168.1.200" />
              </div>
              <div>
                <FieldLabel>Bandwidth</FieldLabel>
                <Input value={form.bandwidth} onChange={setField('bandwidth')} placeholder="100 Mbps" />
              </div>
              <div className="col-span-2">
                <FieldLabel>Video Feed URL</FieldLabel>
                <Input value={form.videoFeedUrl} onChange={setField('videoFeedUrl')} placeholder="http://192.168.1.200/stream" />
                <p className="text-[10px] text-safe-text-muted mt-1">MJPEG or HLS stream URL. Can be configured later.</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <SliderField
              label="Detection Sensitivity"
              value={form.detectionSensitivity}
              onChange={(v) => setForm((p) => ({ ...p, detectionSensitivity: v }))}
              min={0}
              max={100}
              unit="%"
            />
            <SliderField
              label="Minimum Object Size"
              value={form.minObjectSize}
              onChange={(v) => setForm((p) => ({ ...p, minObjectSize: v }))}
              min={0}
              max={200}
              unit="px"
            />
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <FieldLabel>Firmware Version</FieldLabel>
                <Input value={form.firmwareVersion} onChange={setField('firmwareVersion')} placeholder="1.0.0" />
              </div>
              <div>
                <FieldLabel>AI Model Version</FieldLabel>
                <Input value={form.modelVersion} onChange={setField('modelVersion')} placeholder="yolov8n-2026.01" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <SliderField
              label="Speed Limit"
              value={form.speedLimit}
              onChange={(v) => setForm((p) => ({ ...p, speedLimit: v }))}
              min={30}
              max={180}
              step={5}
              unit=" km/h"
            />

            <div>
              <p className="text-sm font-semibold text-safe-text-primary mb-3">
                Initial Lanes
                <span className="text-safe-text-muted font-normal text-xs ml-2">(optional — can be added after creation)</span>
              </p>

              {/* Existing lanes */}
              {form.lanes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.lanes.map((lane) => (
                    <div key={lane.id} className="flex items-center justify-between bg-safe-gray border border-safe-gray-light rounded-lg px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-safe-text-primary">{lane.name}</span>
                        <span className="text-xs text-safe-text-muted ml-2">{lane.type} · {lane.status}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveLane(lane.id)}
                        className="text-safe-text-muted hover:text-safe-danger transition-colors text-sm"
                      >
                        <FontAwesomeIcon icon="xmark" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add lane form */}
              <div className="bg-safe-gray border border-safe-gray-light rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={newLane.name}
                    onChange={(e) => setNewLane((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Lane name"
                  />
                  <Select
                    value={newLane.type}
                    onChange={(e) => setNewLane((p) => ({ ...p, type: e.target.value }))}
                  >
                    {LANE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                  <Select
                    value={newLane.status}
                    onChange={(e) => setNewLane((p) => ({ ...p, status: e.target.value }))}
                  >
                    {LANE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon="plus"
                  onClick={handleAddLane}
                  disabled={!newLane.name.trim()}
                >
                  Add Lane
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-safe-text-muted">Review the configuration before creating the node.</p>

            {[
              {
                title: 'Identity & Location',
                items: [
                  { label: 'Node ID', value: form.nodeId },
                  { label: 'Name', value: form.name || form.nodeId },
                  { label: 'Address', value: form.address },
                  { label: 'Coordinates', value: form.latitude && form.longitude ? `${form.latitude}, ${form.longitude}` : '(map pin not set — will use 0,0)' },
                ],
              },
              {
                title: 'Camera & Stream',
                items: [
                  { label: 'Resolution', value: form.cameraResolution },
                  { label: 'Frame Rate', value: `${form.frameRate} fps` },
                  { label: 'IP Address', value: form.ipAddress },
                  { label: 'Video Feed', value: form.videoFeedUrl || '(not set)' },
                ],
              },
              {
                title: 'Detection',
                items: [
                  { label: 'Sensitivity', value: `${form.detectionSensitivity}%` },
                  { label: 'Min Object Size', value: `${form.minObjectSize}px` },
                  { label: 'Firmware', value: form.firmwareVersion },
                  { label: 'AI Model', value: form.modelVersion },
                ],
              },
              {
                title: 'Road & Lanes',
                items: [
                  { label: 'Speed Limit', value: `${form.speedLimit} km/h` },
                  { label: 'Lanes', value: form.lanes.length > 0 ? form.lanes.map((l) => l.name).join(', ') : 'None (add after creation)' },
                ],
              },
            ].map(({ title, items }) => (
              <div key={title} className="bg-safe-gray border border-safe-gray-light rounded-lg p-4">
                <p className="text-xs font-bold text-safe-text-muted mb-3">{title.toUpperCase()}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {items.map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-safe-text-muted">{label}</p>
                      <p className="text-sm font-medium text-safe-text-primary truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal bare open={isOpen} onClose={handleClose} size="lg">
      <div className="bg-safe-gray border border-safe-gray-light rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-safe-gray-light flex-shrink-0">
          <h3 className="text-safe-text-primary font-bold text-xl mb-4">Add New Node</h3>
          <Stepper
            steps={STEPS}
            currentStep={currentStep.id}
            completedSteps={completedSteps}
          />
        </div>

        {/* Body — scrollable */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {renderStep()}
        </div>

        {/* Error */}
        {(stepError || submissionError) && (
          <div className="mx-8 mb-0 rounded-lg bg-safe-danger/10 border border-safe-danger/20 px-4 py-3 text-safe-danger text-sm flex-shrink-0">
            {submissionError || stepError}
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-5 border-t border-safe-gray-light flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-safe-text-muted">
            Step {stepIndex + 1} of {STEPS.length}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            {stepIndex > 0 && (
              <Button variant="secondary" size="sm" icon="arrow-left" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {stepIndex < STEPS.length - 1 ? (
              <Button variant="primary" size="sm" iconRight="arrow-right" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon="plus"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Create Node
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
