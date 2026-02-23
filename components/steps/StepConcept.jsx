import React from 'react';
import Card from '../shared/Card.jsx';

export default function StepConcept({ char, onChange }) {
  return (
    <Card
      title="Hero Concept"
      subtitle="Who is this person, and what drives them into danger?"
    >
      <div className="field">
        <label className="lbl">Name of Hero</label>
        <input
          type="text"
          value={char.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="e.g. Inga Vētra"
        />
      </div>

      <div className="field">
        <label className="lbl">Descriptor</label>
        <input
          type="text"
          value={char.descriptor}
          onChange={e => onChange('descriptor', e.target.value)}
          placeholder="e.g. Disgraced Knight, Wandering Herbalist…"
        />
        <div className="hint">A two-to-three word phrase capturing who your hero is.</div>
      </div>

      <div className="field">
        <label className="lbl">
          Roots{' '}
          <span style={{ color: 'var(--muted)', fontSize: '.8em', letterSpacing: 0 }}>
            (optional)
          </span>
        </label>
        <textarea
          value={char.roots}
          onChange={e => onChange('roots', e.target.value)}
          placeholder="A sentence or two grounding your hero in the world. Where do they come from? What shaped them?"
        />
      </div>

      <div className="field">
        <label className="lbl">Conviction</label>
        <input
          type="text"
          value={char.conviction}
          onChange={e => onChange('conviction', e.target.value)}
          placeholder='Something your hero strongly believes. e.g. "Debts of blood must be repaid."'
        />
        <div className="hint">
          Your Conviction drives every decision and earns XP at session end.
        </div>
      </div>
    </Card>
  );
}
