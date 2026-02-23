import React, { useState } from 'react';

import { STEP_NAMES, DEFAULT_ABILITIES } from './constants.js';
import { AGES }                          from './data/ages.js';
import { calcPointsLeft, syncChains }    from './utils.js';

import StepNav       from './components/shared/StepNav.js';
import StepConcept   from './components/steps/StepConcept.js';
import StepAge       from './components/steps/StepAge.js';
import StepAbilities from './components/steps/StepAbilities.js';
import StepSkills    from './components/steps/StepSkills.js';
import StepTalents   from './components/steps/StepTalents.js';
import StepEquipment from './components/steps/StepEquipment.js';
import StepChains    from './components/steps/StepChains.js';
import StepSheet     from './components/steps/StepSheet.js';

// ── INITIAL STATE ──────────────────────────────────────────────────────────

function initialChar() {
  return {
    // Step 0
    name:        '',
    descriptor:  '',
    roots:       '',
    conviction:  '',
    // Step 1
    age:         null,
    // Step 2
    abilities:   { ...DEFAULT_ABILITIES },
    // Step 3
    skills:      [],
    // Step 4
    talents:     [],
    spell:       null,
    spellSchool: 'Arcane',
    // Step 5
    gold:        0,
    cart:        [],
    // Step 6
    chains:      {},
  };
}

// ── VALIDATION ─────────────────────────────────────────────────────────────

function canProceed(step, char) {
  const ageCfg = char.age ? AGES[char.age] : null;
  switch (step) {
    case 0: return char.name.trim() && char.descriptor.trim() && char.conviction.trim();
    case 1: return !!char.age;
    case 2: return ageCfg && calcPointsLeft(char.abilities, ageCfg) === 0;
    case 3: return ageCfg && char.skills.length === ageCfg.skills;
    case 4: {
      if (char.talents.length < 2) return false;
      if (char.talents.includes('spellcast') && !char.spell) return false;
      return true;
    }
    case 5: return char.gold > 0;
    case 6: return true;
    default: return true;
  }
}

// ── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(0);
  const [char, setChar] = useState(initialChar());

  // Generic field updater
  function onChange(field, value) {
    setChar(prev => {
      const next = { ...prev, [field]: value };
      // When age changes, reset skills and chains
      if (field === 'age') {
        next.skills = [];
        next.chains = {};
      }
      return next;
    });
  }

  function goBack() {
    if (step > 0) { setStep(s => s - 1); window.scrollTo(0, 0); }
  }

  function goNext() {
    if (!canProceed(step, char)) return;
    // Sync chains before entering the chains step
    if (step === 5) {
      setChar(prev => ({
        ...prev,
        chains: syncChains(prev.chains, prev.cart, prev.spell, prev.talents),
      }));
    }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  }

  function restart() {
    if (window.confirm('Start a new character? All progress will be lost.')) {
      setChar(initialChar());
      setStep(0);
      window.scrollTo(0, 0);
    }
  }

  const isLastStep = step === STEP_NAMES.length - 1;
  const ready      = canProceed(step, char);

  const STEPS = [
    <StepConcept   char={char} onChange={onChange} />,
    <StepAge       char={char} onChange={onChange} />,
    <StepAbilities char={char} onChange={onChange} />,
    <StepSkills    char={char} onChange={onChange} />,
    <StepTalents   char={char} onChange={onChange} />,
    <StepEquipment char={char} onChange={onChange} />,
    <StepChains    char={char} onChange={onChange} />,
    <StepSheet     char={char} onRestart={restart} />,
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="site-header">
        <div className="eyebrow">Jaunskungu Edicija · Beta v0.8</div>
        <div className="main-title">Dzintaru Dziesmas</div>
        <div className="main-sub">Character Creator</div>
      </header>

      {/* Step navigator */}
      <StepNav
        currentStep={step}
        onStepClick={i => { setStep(i); window.scrollTo(0, 0); }}
      />

      {/* Active step */}
      {STEPS[step]}

      {/* Navigation buttons */}
      {!isLastStep && (
        <div className="nav-row">
          <button
            className="btn btn-secondary"
            onClick={goBack}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          <button
            className="btn btn-primary"
            onClick={goNext}
            disabled={!ready}
          >
            {step === STEP_NAMES.length - 2 ? 'View Character →' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  );
}
