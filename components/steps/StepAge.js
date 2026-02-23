import React from 'react';
import Card from '../shared/Card.js';
import { AGES } from '../../data/ages.js';

export default function StepAge({ char, onChange }) {
  return (
    <Card
      title="Age"
      subtitle="Your age determines raw potential and lived experience. Choose wisely."
    >
      <div className="age-grid">
        {Object.entries(AGES).map(([age, cfg]) => (
          <div
            key={age}
            className={`age-card ${char.age === age ? 'selected' : ''}`}
            onClick={() => onChange('age', age)}
          >
            <div className="age-name">{age}</div>
            <div className="age-stat">Ability Points <strong>{cfg.points}</strong></div>
            <div className="age-stat">Skills <strong>{cfg.skills}</strong></div>
            <div className="age-stat">Chain Links <strong>{cfg.links}</strong></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
