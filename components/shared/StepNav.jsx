import React from 'react';
import { STEP_NAMES } from '../../constants.js';

export default function StepNav({ currentStep, onStepClick }) {
  return (
    <nav className="steps-nav">
      {STEP_NAMES.map((name, i) => {
        const isDone   = i < currentStep;
        const isActive = i === currentStep;
        return (
          <React.Fragment key={name}>
            {i > 0 && <div className={`step-line ${i <= currentStep ? 'done' : ''}`} />}
            <div
              className={`step-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''} ${isDone ? 'clickable' : ''}`}
              onClick={() => isDone && onStepClick(i)}
            >
              <div className="step-circle">{isDone ? '✓' : i + 1}</div>
              <div className="step-lbl">{name}</div>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
