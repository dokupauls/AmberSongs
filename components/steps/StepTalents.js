import React, { useState } from 'react';
import Card from '../shared/Card.js';
import { TALENTS, TALENT_CATEGORIES } from '../../data/talents.js';
import { SPELLS, SPELL_ABILITY } from '../../data/spells.js';

const FILTER_CATS = ['All', 'Offensive', 'Defensive', 'Utility', 'Mystique'];
const FILTER_KEYS = { All: 'all', Offensive: 'off', Defensive: 'def', Utility: 'util', Mystique: 'myst' };

export default function StepTalents({ char, onChange }) {
  const [filter, setFilter]       = useState('All');
  const [school, setSchool]       = useState(char.spellSchool || 'Arcane');

  const hasSpellcasting = char.talents.includes('spellcast');
  const hasCantrips     = char.talents.includes('cantrips');

  const visible = filter === 'All' ? TALENTS : TALENTS.filter(t => t.cat === filter);

  function toggleTalent(id) {
    const has = char.talents.includes(id);
    if (!has && char.talents.length >= 2) return;
    const next = has
      ? char.talents.filter(x => x !== id)
      : [...char.talents, id];
    // clear spell if spellcasting removed
    if (!next.includes('spellcast')) onChange('spell', null);
    onChange('talents', next);
  }

  function pickSchool(s) {
    setSchool(s);
    onChange('spellSchool', s);
  }

  function pickSpell(sp) {
    onChange('spell', { name: sp.name, school });
  }

  return (
    <>
      <Card
        title="Talents"
        subtitle="Choose exactly 2 Talents. They define how your hero fights, survives, and surprises."
      >
        <div className="tally">
          Selected: <span>{char.talents.length}</span> / 2
        </div>

        <div className="filter-row">
          {FILTER_CATS.map(cat => (
            <button
              key={cat}
              className={`f-btn ${filter === cat ? `active ${FILTER_KEYS[cat]}` : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="talent-grid">
          {visible.map(t => {
            const selected = char.talents.includes(t.id);
            const locked   = char.talents.length >= 2 && !selected;
            const color    = TALENT_CATEGORIES[t.cat];
            return (
              <div
                key={t.id}
                className={`t-card ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                onClick={() => toggleTalent(t.id)}
              >
                <span className="t-tag" style={{ color, borderColor: color }}>{t.cat}</span>
                <div className="t-name">
                  <span className="talent-cat-dot" style={{ background: color }} />
                  {t.name}
                </div>
                <div className="t-desc">{t.desc}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Spell picker — only shown when Spellcasting is selected */}
      {hasSpellcasting && (
        <Card
          title="Starting Spell"
          subtitle={
            hasCantrips
              ? "This spell will be memorized via Cantrips — it won't occupy an Inventory Slot."
              : 'This spell will occupy one Inventory Slot.'
          }
        >
          <div className="school-tabs">
            {Object.keys(SPELLS).map(s => (
              <button
                key={s}
                className={`s-tab ${school === s ? 'active' : ''}`}
                onClick={() => pickSchool(s)}
              >
                {s} ({SPELL_ABILITY[s]})
              </button>
            ))}
          </div>

          {char.abilities[SPELL_ABILITY[school]] < 0 && (
            <div className="spell-warn">
              ⚠ Your {SPELL_ABILITY[school]} is {char.abilities[SPELL_ABILITY[school]] >= 0 ? '+' : ''}{char.abilities[SPELL_ABILITY[school]]} — {school} spells may be difficult to cast effectively.
            </div>
          )}

          <div className="spell-grid">
            {SPELLS[school].map(sp => {
              const selected = char.spell?.name === sp.name && char.spell?.school === school;
              return (
                <div
                  key={sp.name}
                  className={`sp-item ${selected ? 'selected' : ''}`}
                  onClick={() => pickSpell(sp)}
                >
                  <div className="sp-tier">{sp.tier}</div>
                  <div className="sp-name">{sp.name}</div>
                  <div className="sp-desc">{sp.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}
