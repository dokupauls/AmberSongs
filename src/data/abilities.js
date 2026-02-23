export const ABILITIES = [
  { id: 'STR', full: 'Strength',  desc: 'Melee attacks, HP, Item Slots' },
  { id: 'DEX', full: 'Dexterity', desc: 'Ranged attacks' },
  { id: 'INT', full: 'Intellect', desc: 'Supply, Arcane Spells' },
  { id: 'WIL', full: 'Willpower', desc: 'HP, Primal Magic' },
  { id: 'CHA', full: 'Charisma',  desc: 'Divine Miracles' },
];

export const ABILITY_CONDITIONS = {
  STR: 'EXHAUSTED',
  DEX: 'DAZED',
  INT: 'AGITATED',
  WIL: 'HOLLOW',
  CHA: 'INSECURE',
};
