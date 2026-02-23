import React from 'react';
import Card from '../shared/Card.jsx';
import { ABILITIES } from '../../data/abilities.js';
import { AGES } from '../../data/ages.js';
import { fmt, calcHP, calcSupply, calcItemSlots, calcPointsLeft } from '../../utils.js';

export default function StepAbilities({ char, onChange }) {
  const ageCfg    = AGES[char.age];
  const pointsLeft = calcPointsLeft(char.abilities, ageCfg);
  const hp         = calcHP(char.abilities, char.talents);
  const supply     = calcSupply(char.abilities, char.talents);
  const slots      = calcItemSlots(char.abilities);

  function adjust(id, delta) {
    const cur  = char.abilities[id];
    const next = cur + delta;
    if (next < -2 || next > 5) return;
    if (delta > 0 && pointsLeft <= 0) return;
    onChange('abilities', { ...char.abilities, [id]: next });
  }

  return (
    <Card
      title="Ability Scores"
      subtitle={`All abilities start at –2. Distribute ${ageCfg.points} points. Maximum score: +5.`}
    >
      <div className="pts-bar">
        <span className="pts-lbl">Points Remaining</span>
        <span className="pts-cnt">{pointsLeft}</span>
      </div>

      <div className="ability-grid">
        {ABILITIES.map(ab => {
          const val = char.abilities[ab.id];
          return (
            <div key={ab.id} className="ab-box">
              <div className="ab-abbr">{ab.id}</div>
              <div className="ab-full">{ab.desc}</div>
              <div className="ab-ctrl">
                <button
                  className="ab-btn"
                  onClick={() => adjust(ab.id, -1)}
                  disabled={val <= -2}
                >−</button>
                <div className={`ab-val ${val > 0 ? 'pos' : val < 0 ? 'neg' : ''}`}>
                  {fmt(val)}
                </div>
                <button
                  className="ab-btn"
                  onClick={() => adjust(ab.id, 1)}
                  disabled={val >= 5 || pointsLeft <= 0}
                >+</button>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="sep" />

      <div className="derived-row">
        <div className="derived-box">
          <div className="derived-lbl">Hit Points</div>
          <div className="derived-val">{hp}</div>
          <div className="derived-form">10 + STR + WIL</div>
        </div>
        <div className="derived-box">
          <div className="derived-lbl">Supply</div>
          <div className="derived-val">{supply}</div>
          <div className="derived-form">5 + INT</div>
        </div>
        <div className="derived-box">
          <div className="derived-lbl">Item Slots</div>
          <div className="derived-val">{slots}</div>
          <div className="derived-form">15 + STR</div>
        </div>
      </div>
    </Card>
  );
}
