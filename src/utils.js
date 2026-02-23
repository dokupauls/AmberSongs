import { TALENTS } from './data/talents.js';
import { DICE_STEPS } from './constants.js';

export const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);

export function calcHP(abilities, talents) {
  return 10 + abilities.STR + abilities.WIL + (talents.includes('tough') ? 5 : 0);
}

export function calcSupply(abilities, talents) {
  return (talents.includes('resourceful') ? 10 : 5) + abilities.INT;
}

export function calcItemSlots(abilities) {
  return 15 + abilities.STR;
}

export function calcPointsLeft(abilities, ageCfg) {
  if (!ageCfg) return 0;
  const spent = Object.values(abilities).reduce((a, v) => a + (v - -2), 0);
  return ageCfg.points - spent;
}

export function calcLinksLeft(chains, ageCfg) {
  if (!ageCfg) return 0;
  const used = Object.values(chains).reduce((a, v) => a + v, 0);
  return ageCfg.links - used;
}

export function calcTotalSpent(cart) {
  return cart.reduce((a, i) => a + i.cost, 0);
}

// Build the list of chain sources for a given character state
export function getChainSources(cart, spell, talents) {
  const sources = [];
  cart.forEach((item) => {
    if (item.weapon) sources.push({ key: item.name, label: item.name });
    if (item.shield) sources.push({ key: item.name + '-shield', label: item.name + ' (Shield)' });
  });
  if (spell) {
    sources.push({ key: 'spell-' + spell.name, label: spell.name + ' (Spell)' });
  }
  talents.forEach((tid) => {
    const t = TALENTS.find((x) => x.id === tid);
    if (t && t.chain) sources.push({ key: tid, label: t.chainName });
  });
  return sources;
}

// Sync chain state to match current sources (prune old, keep existing levels)
export function syncChains(chains, cart, spell, talents) {
  const sources = getChainSources(cart, spell, talents);
  const synced = {};
  sources.forEach((s) => {
    synced[s.key] = chains[s.key] || 0;
  });
  return synced;
}

export { DICE_STEPS };
