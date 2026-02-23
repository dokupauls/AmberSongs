import React from 'react';
import Card from '../shared/Card.js';
import { SKILLS } from '../../data/skills.js';
import { AGES } from '../../data/ages.js';

export default function StepSkills({ char, onChange }) {
  const ageCfg = AGES[char.age];
  const max    = ageCfg.skills;

  function toggle(skill) {
    const has = char.skills.includes(skill);
    if (!has && char.skills.length >= max) return;
    onChange('skills', has
      ? char.skills.filter(s => s !== skill)
      : [...char.skills, skill]
    );
  }

  return (
    <Card
      title="Skills"
      subtitle="When a Skill applies to a Check, add your Ability Score twice instead of once."
    >
      <div className="tally">
        Selected: <span>{char.skills.length}</span> / {max}
      </div>

      <div className="skill-grid">
        {SKILLS.map(skill => {
          const selected = char.skills.includes(skill);
          const locked   = !selected && char.skills.length >= max;
          return (
            <div
              key={skill}
              className={`skill-chip ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
              onClick={() => toggle(skill)}
            >
              {skill}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
