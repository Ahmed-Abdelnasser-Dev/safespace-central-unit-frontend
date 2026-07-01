/**
 * Stepper — horizontal step progress indicator
 *
 * Props:
 *   steps: Array<{ id: string|number, label: string }>
 *   currentStep: string|number — id of the active step
 *   completedSteps: Array<string|number> — ids of completed steps
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Stepper({ steps = [], currentStep, completedSteps = [] }) {
  return (
    <div className="flex items-center w-full" role="list" aria-label="Progress steps">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isActive = step.id === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1" role="listitem">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors',
                  'motion-safe:transition-all',
                  isCompleted
                    ? 'bg-safe-success text-white'
                    : isActive
                    ? 'bg-safe-blue-btn text-white ring-2 ring-safe-blue-btn/30 ring-offset-2 ring-offset-safe-sidebar'
                    : 'bg-safe-gray text-safe-text-muted border border-safe-border',
                ].join(' ')}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <FontAwesomeIcon icon="check" className="text-xs" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={[
                  'text-xs font-medium text-center whitespace-nowrap',
                  isActive ? 'text-safe-text-primary' : 'text-safe-text-muted',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {!isLast && (
              <div
                className={[
                  'flex-1 h-px mx-2 mb-5 transition-colors',
                  isCompleted ? 'bg-safe-success' : 'bg-safe-border',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
