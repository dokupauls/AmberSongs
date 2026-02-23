import React from 'react';
import Card from '../shared/Card.jsx';
import { AGES } from '../../data/ages.js';
import { DICE_STEPS } from '../../constants.js';
import { getChainSources, calcLinksLeft } from '../../utils.js';

export default function StepChains({ char, onChange }) {
  const ageCfg  = AGES[char.age];
  const sources = getChainSources(char.cart, char.spell, char.talents);
  const linksLeft = calcLinksLeft(char.chains, ageCfg);

  function adjust(key, delta) {
    const cur  = char.chains[key] || 0;
    const next = cur + delta;
    if (next < 0 || next > 4) return;
    if (delta > 0 && linksLeft <= 0) return;
    onChange('chains', { ...char.chains, [key]: next });
  }

  return (
    <Card
      title="Dice Chains"
      subtitle={`All chains start at d4. Each Link advances one chain by one step. You have ${ageCfg.links} Links to spend.`}
    >
      {sources.length === 0 ? (
        <div className="no-chains">
          Your hero has no weapons, spells, or talent-based chains to bolster.
          <br />Go back to Equipment to add some gear, or check your Talents.
        </div>
      ) : (
        <>
          <div className="links-bar">
            <span className="links-lbl">Links Remaining</span>
            <span className="links-cnt">{linksLeft}</span>
          </div>

          {sources.map(({ key, label }) => {
            const level = char.chains[key] || 0;
            return (
              <div key={key} className="chain-item">
                <div className="chain-name">{label}</div>
                <div className="die-row">
                  {DICE_STEPS.map((die, i) => (
                    <div
                      key={die}
                      className={`die-pip ${i < level ? 'unlocked' : ''} ${i === level ? 'current' : ''}`}
                    >
                      {die}
                    </div>
                  ))}
                </div>
                <div className="chain-ctrl">
                  <button
                    className="ch-btn"
                    onClick={() => adjust(key, -1)}
                    disabled={level <= 0}
                  >−</button>
                  <button
                    className="ch-btn"
                    onClick={() => adjust(key, 1)}
                    disabled={level >= 4 || linksLeft <= 0}
                  >+</button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </Card>
  );
}
