import React from 'react';

type SubmitState = 'idle' | 'loading' | 'success';

type SubmitButtonProps = {
  state: SubmitState;
  hover: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
};

export default function SubmitButton({
  state,
  hover,
  onEnter,
  onLeave,
  onClick,
}: SubmitButtonProps) {
  return (
    <button
      type="button"
      data-cursor="true"
      data-magnetic="true"
      className={`eo-submit-btn${hover ? ' eo-submit-hover' : ''}${state === 'success' ? ' eo-submit-success' : ''}`}
      disabled={state !== 'idle'}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {state === 'idle' && <span>Reserve your evening</span>}
      {state === 'loading' && (
        <span className="eo-submit-dots" aria-live="polite">
          <span className="eo-dot" />
          <span className="eo-dot" />
          <span className="eo-dot" />
        </span>
      )}
      {state === 'success' && (
        <span className="eo-submit-success-text">
          <svg className="eo-checkmark" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M4 12.5 L10 18.5 L20 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          See you soon.
        </span>
      )}
    </button>
  );
}
