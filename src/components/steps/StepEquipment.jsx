import React, { useState } from 'react';
import Card from '../shared/Card.jsx';
import { EQUIPMENT } from '../../data/equipment.js';
import { calcTotalSpent } from '../../utils.js';

const CATEGORIES = Object.keys(EQUIPMENT);

export default function StepEquipment({ char, onChange }) {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);

  const totalSpent = calcTotalSpent(char.cart);
  const goldLeft   = char.gold - totalSpent;
  const items      = EQUIPMENT[activeCat];

  function rollGold() {
    const rolled = Math.floor(Math.random() * 20 + 1)
                 + Math.floor(Math.random() * 20 + 1)
                 + Math.floor(Math.random() * 20 + 1);
    onChange('gold', rolled);
    // prune cart if new gold is lower
    let running = 0;
    const pruned = char.cart.filter(i => {
      if (running + i.cost <= rolled) { running += i.cost; return true; }
      return false;
    });
    onChange('cart', pruned);
  }

  function setGold(val) {
    const g = Math.max(0, parseInt(val) || 0);
    onChange('gold', g);
    let running = 0;
    const pruned = char.cart.filter(i => {
      if (running + i.cost <= g) { running += i.cost; return true; }
      return false;
    });
    onChange('cart', pruned);
  }

  function addItem(item) {
    if (goldLeft < item.cost) return;
    onChange('cart', [...char.cart, item]);
  }

  function removeItem(index) {
    onChange('cart', char.cart.filter((_, i) => i !== index));
  }

  return (
    <Card
      title="Equipment"
      subtitle="Roll or enter your starting gold, then outfit your hero."
    >
      {/* Gold panel */}
      <div className="gold-panel">
        <span style={{ fontSize: '1.4rem' }}>⚙</span>
        <label className="pts-lbl" style={{ whiteSpace: 'nowrap' }}>Starting Gold</label>
        <input
          type="number"
          className="gold-inp"
          min="0"
          value={char.gold || ''}
          placeholder="0"
          onChange={e => setGold(e.target.value)}
        />
        <button className="btn-roll" onClick={rollGold}>Roll 3d20</button>
        <span className="gold-remaining">
          Remaining: <span>{goldLeft}</span> gp
        </span>
      </div>

      {/* Category tabs */}
      <div className="eq-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`ec-btn ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item table */}
      <div className="eq-wrap">
        <table className="eq-tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th>Properties</th>
              <th>Slots</th>
              <th>Cost</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const cantAfford = goldLeft < item.cost;
              return (
                <tr key={item.name}>
                  <td><div className="eq-n">{item.name}</div></td>
                  <td><div className="eq-p">{item.props}</div></td>
                  <td>{item.slots}</td>
                  <td className="eq-c">{item.cost} gp</td>
                  <td>
                    <button
                      className="eq-add"
                      disabled={cantAfford}
                      onClick={() => addItem(item)}
                    >
                      + Add
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cart */}
      {char.cart.length > 0 && (
        <div className="cart">
          <div className="cart-ttl">Inventory</div>
          {char.cart.map((item, i) => (
            <div key={i} className="cart-item">
              <span className="ci-name">{item.name}</span>
              <span className="ci-cost">{item.cost} gp</span>
              <button className="ci-rm" onClick={() => removeItem(i)}>✕</button>
            </div>
          ))}
          <div className="cart-sum">
            <span>Total Spent</span>
            <span>{totalSpent} / {char.gold} gp</span>
          </div>
        </div>
      )}

      {char.gold > 0 && char.cart.length === 0 && (
        <div className="info-box">Browse the categories above and add items to your inventory.</div>
      )}
      {char.gold === 0 && (
        <div className="warn-box">Enter your starting gold to begin shopping.</div>
      )}
    </Card>
  );
}
