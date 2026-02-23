import React, { useRef } from 'react';
import { ABILITIES, ABILITY_CONDITIONS } from '../../data/abilities.js';
import { TALENTS } from '../../data/talents.js';
import { DICE_STEPS, EOS_QUESTIONS } from '../../constants.js';
import {
  fmt,
  calcHP,
  calcSupply,
  calcItemSlots,
  getChainSources,
} from '../../utils.js';

export default function StepSheet({ char, onRestart }) {
  const sheetRef = useRef(null);

  const hp      = calcHP(char.abilities, char.talents);
  const supply  = calcSupply(char.abilities, char.talents);
  const slots   = calcItemSlots(char.abilities);
  const sources = getChainSources(char.cart, char.spell, char.talents);

  const hasSpellcasting = char.talents.includes('spellcast');
  const hasCantrips     = char.talents.includes('cantrips');
  const spellInInventory = hasSpellcasting && !hasCantrips && char.spell;

  // Build inventory list
  const inventoryItems = [];
  if (spellInInventory) inventoryItems.push(char.spell.name + ' (Spell)');
  char.cart.forEach(i => inventoryItems.push(i.name));
  const invRows = Array.from({ length: Math.max(20, inventoryItems.length) }, (_, i) =>
    inventoryItems[i] || ''
  );

  // Build talent display strings
  const talentLines = char.talents.map(tid => {
    const t = TALENTS.find(x => x.id === tid);
    if (!t) return '';
    if (tid === 'spellcast' && char.spell) {
      return hasCantrips
        ? `${t.name} [Memorized: ${char.spell.name}]`
        : `${t.name} [Starting Spell: ${char.spell.name}]`;
    }
    return t.name;
  });

  // Chain summary lines
  const chainLines = sources.map(({ key, label }) => {
    const level = char.chains[key] || 0;
    return `${label}: ${DICE_STEPS[level]}`;
  });

  // Armor class display
  const armorItem = char.cart.find(i => i.armor);
  const shieldItem = char.cart.find(i => i.shield);
  let acDisplay = '—';
  if (armorItem) {
    const base = armorItem.name === 'Light Armor' ? 2
               : armorItem.name === 'Medium Armor' ? 4
               : 6;
    acDisplay = shieldItem ? `${base + 1} + INT` : `${base} + INT`;
  } else if (char.talents.includes('iron_skin')) {
    acDisplay = shieldItem ? `3 + INT` : `2 + INT`;
  } else if (shieldItem) {
    acDisplay = `1 + INT`;
  }

  // PDF export via jsPDF
  async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = 210; // A4 width mm
    const margin = 14;
    const col = W - margin * 2;
    let y = 0;

    // Helpers
    const darkBg  = [26,  15,  2];
    const gold     = [232, 184, 75];
    const parch    = [240, 230, 204];
    const parchDk  = [232, 216, 176];
    const brownBdr = [138, 96,  48];
    const inkColor = [26,  15,  2];
    const mutedBr  = [106, 72,  32];

    function fillRect(x, fy, w, h, color) {
      doc.setFillColor(...color);
      doc.rect(x, fy, w, h, 'F');
    }
    function strokeRect(x, fy, w, h, color, lw = 0.3) {
      doc.setDrawColor(...color);
      doc.setLineWidth(lw);
      doc.rect(x, fy, w, h, 'S');
    }
    function text(str, x, fy, opts = {}) {
      doc.text(str || '', x, fy, opts);
    }
    function cinzel(size, color = inkColor) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(size);
      doc.setTextColor(...color);
    }
    function crimson(size, color = inkColor, style = 'normal') {
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
    }

    // ── TOP BAR ────────────────────────────────────────────
    fillRect(0, 0, W, 12, darkBg);
    cinzel(11, gold);
    text('Dzintaru Dziesmas', margin, 8);
    cinzel(6, [158, 114, 40]);
    text('Character Sheet · v0.8', W - margin, 8, { align: 'right' });
    y = 16;

    // ── HEADER FIELDS: Name / Player ───────────────────────
    function fieldBox(label, value, x, fy, w, h = 10) {
      fillRect(x, fy, w, 5, parchDk);
      strokeRect(x, fy, w, h, brownBdr);
      doc.setDrawColor(...brownBdr);
      doc.setLineWidth(0.2);
      doc.line(x, fy + 5, x + w, fy + 5);
      cinzel(5, mutedBr);
      text(label.toUpperCase(), x + 1.5, fy + 3.8);
      crimson(8, inkColor);
      text(value || '', x + 1.5, fy + 9);
    }

    fieldBox('Name of Hero', char.name,       margin,           y, col * 0.6);
    fieldBox('Player',       '',               margin + col*0.6 + 2, y, col * 0.4 - 2);
    y += 13;
    fieldBox('Descriptor', char.descriptor,   margin,           y, col * 0.5);
    fieldBox('Age',        char.age || '',     margin + col*0.5 + 2, y, col * 0.15 - 2);
    fieldBox('XP',         '',                margin + col*0.65 + 2, y, col * 0.18 - 2);
    fieldBox('REP',        '',                margin + col*0.83 + 2, y, col * 0.17 - 2);
    y += 14;

    // ── ABILITY SCORES ─────────────────────────────────────
    const abW  = col / 5;
    const abH  = 22;
    const conds = ['EXHAUSTED', 'DAZED', 'AGITATED', 'HOLLOW', 'INSECURE'];
    ABILITIES.forEach((ab, i) => {
      const x = margin + i * abW;
      fillRect(x, y, abW - 1, 6, darkBg);
      cinzel(7, gold);
      text(ab.id, x + (abW - 1) / 2, y + 4.5, { align: 'center' });
      fillRect(x, y + 6, abW - 1, abH - 12, parch);
      strokeRect(x, y, abW - 1, abH - 6, brownBdr, 0.4);
      cinzel(14, inkColor);
      text(fmt(char.abilities[ab.id]), x + (abW - 1) / 2, y + 15, { align: 'center' });
      fillRect(x, y + abH - 6, abW - 1, 6, parchDk);
      doc.setDrawColor(...brownBdr); doc.setLineWidth(0.2);
      doc.line(x, y + abH - 6, x + abW - 1, y + abH - 6);
      cinzel(4.5, mutedBr);
      text(conds[i], x + (abW - 1) / 2, y + abH - 2.5, { align: 'center' });
    });
    y += abH + 3;

    // ── VITALS ─────────────────────────────────────────────
    const vitW = col / 3;
    const vitData = [
      { label: 'Hit Points',  value: String(hp),       formula: '10+STR+WIL' },
      { label: 'Armor Class', value: acDisplay,         formula: 'Armor + Shield' },
      { label: 'Supply',      value: String(supply),    formula: '5+INT' },
    ];
    vitData.forEach((v, i) => {
      const x = margin + i * vitW;
      fillRect(x, y, vitW - 1, 6, darkBg);
      cinzel(6, gold);
      text(v.label.toUpperCase(), x + (vitW - 1) / 2, y + 4.5, { align: 'center' });
      fillRect(x, y + 6, vitW - 1, 12, parch);
      strokeRect(x, y, vitW - 1, 22, brownBdr, 0.4);
      cinzel(12, inkColor);
      text(v.value, x + (vitW - 1) / 2, y + 14, { align: 'center' });
      fillRect(x, y + 18, vitW - 1, 4, parchDk);
      doc.line(x, y + 18, x + vitW - 1, y + 18);
      cinzel(4.5, mutedBr);
      text(v.formula, x + (vitW - 1) / 2, y + 21, { align: 'center' });
    });
    y += 25;

    // ── HERO DICE + CONDITIONS ─────────────────────────────
    const halfCol = col / 2 - 1;
    // Hero Dice
    fillRect(margin, y, halfCol, 6, darkBg);
    cinzel(6, gold);
    text('HERO DICE', margin + halfCol / 2, y + 4.5, { align: 'center' });
    fillRect(margin, y + 6, halfCol, 12, parch);
    strokeRect(margin, y, halfCol, 18, brownBdr, 0.4);
    const diceArr = ['d4', 'd6', 'd8', 'd10', 'd12'];
    diceArr.forEach((d, i) => {
      const dx = margin + 3 + i * (halfCol - 6) / 4;
      fillRect(dx, y + 8, 9, 8, parchDk);
      strokeRect(dx, y + 8, 9, 8, brownBdr, 0.3);
      cinzel(5.5, inkColor);
      text(d, dx + 4.5, y + 13.5, { align: 'center' });
    });
    // Conditions
    const cx = margin + halfCol + 2;
    fillRect(cx, y, halfCol, 6, darkBg);
    cinzel(6, gold);
    text('CONDITIONS', cx + halfCol / 2, y + 4.5, { align: 'center' });
    fillRect(cx, y + 6, halfCol, 12, parch);
    strokeRect(cx, y, halfCol, 18, brownBdr, 0.4);
    const conditions = ['Hindered', 'Lost Spirit', 'Inspired', 'Vulnerable'];
    conditions.forEach((c, i) => {
      const row = Math.floor(i / 2), col2 = i % 2;
      const condX = cx + 3 + col2 * halfCol / 2;
      const condY = y + 10 + row * 6;
      doc.setDrawColor(...brownBdr); doc.setLineWidth(0.25);
      doc.circle(condX + 2, condY, 1.5, 'S');
      crimson(6, inkColor);
      text(c, condX + 5, condY + 1.5);
    });
    y += 21;

    // ── HELPER: two-column section box ─────────────────────
    function sectionBox(title, lines, x, fy, w, lineH = 6.5) {
      const h = 6 + lines.length * lineH;
      fillRect(x, fy, w, 6, darkBg);
      cinzel(6, gold);
      text(title, x + 2, fy + 4.5);
      fillRect(x, fy + 6, w, h - 6, parch);
      strokeRect(x, fy, w, h, brownBdr, 0.4);
      lines.forEach((line, i) => {
        const ly = fy + 6 + (i + 1) * lineH - 1.5;
        doc.setDrawColor(...brownBdr); doc.setLineWidth(0.15);
        if (i < lines.length - 1) doc.line(x + 1, ly + 1.5, x + w - 1, ly + 1.5);
        crimson(7, inkColor);
        text(line || '', x + 2, ly);
      });
      return h;
    }

    // ── CHAINS + SKILLS ────────────────────────────────────
    const chainLines5 = [...chainLines, ...Array(Math.max(0, 5 - chainLines.length)).fill('')].slice(0, Math.max(5, chainLines.length));
    const skillLines5 = [...char.skills, ...Array(Math.max(0, 5 - char.skills.length)).fill('')].slice(0, Math.max(5, char.skills.length));
    const chainH = sectionBox('DICE CHAINS', chainLines5, margin, y, halfCol);
    const skillH = sectionBox('SKILLS', skillLines5, margin + halfCol + 2, y, halfCol);
    y += Math.max(chainH, skillH) + 3;

    // ── CONVICTION ─────────────────────────────────────────
    const convText = char.conviction ? `"${char.conviction}"` : '';
    fillRect(margin, y, col, 6, darkBg);
    cinzel(6, gold);
    text('CONVICTION', margin + 2, y + 4.5);
    fillRect(margin, y + 6, col, 10, parch);
    strokeRect(margin, y, col, 16, brownBdr, 0.4);
    crimson(8, inkColor, 'italic');
    text(convText, margin + 2, y + 12);
    y += 19;

    // ── POCKETS + TALENTS ──────────────────────────────────
    const talentLines4 = [...talentLines, '', '', ''].slice(0, Math.max(4, talentLines.length));
    sectionBox('POCKETS  —  really small items', ['', ''], margin, y, halfCol);
    const tH = sectionBox('TALENTS & OTHER NOTES', talentLines4, margin + halfCol + 2, y, halfCol);
    y += Math.max(22, tH) + 3;

    // ── INVENTORY ──────────────────────────────────────────
    const invTitle = `INVENTORY  —  Max Item Slots: ${slots}`;
    const inv20 = invRows.slice(0, 20);
    const invLineH = 5.5;
    const invH = 6 + Math.ceil(inv20.length / 2) * invLineH;
    fillRect(margin, y, col, 6, darkBg);
    cinzel(6, gold);
    text(invTitle, margin + 2, y + 4.5);
    fillRect(margin, y + 6, col, invH - 6, parch);
    strokeRect(margin, y, col, invH, brownBdr, 0.4);
    // mid divider
    doc.setDrawColor(...brownBdr); doc.setLineWidth(0.2);
    doc.line(margin + col / 2, y + 6, margin + col / 2, y + invH);
    inv20.forEach((item, i) => {
      const col2 = i % 2, row = Math.floor(i / 2);
      const ix = margin + col2 * col / 2 + 1;
      const iy = y + 6 + (row + 1) * invLineH - 1.5;
      // number box
      fillRect(ix, iy - invLineH + 2, 6, invLineH - 0.5, parchDk);
      cinzel(4.5, mutedBr);
      text(String(i + 1), ix + 3, iy - 0.8, { align: 'center' });
      doc.setDrawColor(...brownBdr); doc.setLineWidth(0.15);
      doc.rect(ix, iy - invLineH + 2, 6, invLineH - 0.5, 'S');
      if (row < Math.ceil(inv20.length / 2) - 1 || col2 === 0) {
        doc.line(ix + 6, iy + 1, ix + col / 2 - 2, iy + 1);
      }
      crimson(7, inkColor);
      text(item || '', ix + 7.5, iy);
    });
    y += invH + 3;

    // ── END OF SESSION ─────────────────────────────────────
    const eosLineH = 5;
    const eosH = 6 + EOS_QUESTIONS.length * eosLineH;
    fillRect(margin, y, col, 6, darkBg);
    cinzel(6, gold);
    text('END OF SESSION QUESTIONS', margin + 2, y + 4.5);
    fillRect(margin, y + 6, col, eosH - 6, parch);
    strokeRect(margin, y, col, eosH, brownBdr, 0.4);
    EOS_QUESTIONS.forEach((q, i) => {
      const qy = y + 6 + (i + 1) * eosLineH - 1.5;
      doc.setDrawColor(...brownBdr); doc.setLineWidth(0.25);
      doc.circle(margin + 4, qy - 1, 1.5, 'S');
      crimson(6.5, inkColor);
      text(q, margin + 8, qy);
      if (i < EOS_QUESTIONS.length - 1) {
        doc.setDrawColor(...brownBdr); doc.setLineWidth(0.15);
        doc.line(margin + 1, qy + 1.5, margin + col - 1, qy + 1.5);
      }
    });

    doc.save(`${char.name || 'hero'}_character_sheet.pdf`);
  }

  return (
    <>
      <div className="export-row">
        <button className="btn btn-primary" onClick={exportPDF}>⬇ Save as PDF</button>
        <button className="btn btn-ghost"   onClick={onRestart}>Start Over</button>
      </div>

      {/* Visual sheet preview */}
      <div id="sheet" ref={sheetRef}>
        <div className="sh-topbar">
          <span className="sh-game">Dzintaru Dziesmas</span>
          <span className="sh-ed">Character Sheet · v0.8</span>
        </div>
        <div className="sh-inner">

          {/* Name / Player */}
          <div className="sh-row">
            <div className="sh-f" style={{ flex: 2 }}>
              <div className="sh-fl">Name of Hero</div>
              <div className="sh-fv">{char.name}</div>
            </div>
            <div className="sh-f">
              <div className="sh-fl">Player</div>
              <div className="sh-fv"></div>
            </div>
          </div>

          {/* Descriptor / Age / XP / REP */}
          <div className="sh-row">
            <div className="sh-f" style={{ flex: 2 }}>
              <div className="sh-fl">Descriptor</div>
              <div className="sh-fv">{char.descriptor}</div>
            </div>
            <div className="sh-f">
              <div className="sh-fl">Age</div>
              <div className="sh-fv">{char.age}</div>
            </div>
            <div className="sh-f">
              <div className="sh-fl">XP</div>
              <div className="sh-fv"></div>
            </div>
            <div className="sh-f">
              <div className="sh-fl">REP</div>
              <div className="sh-fv"></div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="sh-abs">
            {ABILITIES.map(ab => (
              <div key={ab.id} className="sh-ab">
                <div className="sh-ab-n">{ab.id}</div>
                <div className="sh-ab-v">{fmt(char.abilities[ab.id])}</div>
                <div className="sh-ab-c">{ABILITY_CONDITIONS[ab.id]}</div>
              </div>
            ))}
          </div>

          {/* Vitals */}
          <div className="sh-vitals">
            <div className="sh-vit">
              <div className="sh-vit-n">Hit Points</div>
              <div className="sh-vit-v">{hp}</div>
              <div className="sh-vit-f">10+STR+WIL</div>
            </div>
            <div className="sh-vit">
              <div className="sh-vit-n">Armor Class</div>
              <div className="sh-vit-v">{acDisplay}</div>
              <div className="sh-vit-f">Armor + Shield</div>
            </div>
            <div className="sh-vit">
              <div className="sh-vit-n">Supply</div>
              <div className="sh-vit-v">{supply}</div>
              <div className="sh-vit-f">5+INT</div>
            </div>
          </div>

          {/* Hero Dice + Conditions */}
          <div className="sh-cols">
            <div className="sh-sec">
              <div className="sh-sec-t">Hero Dice</div>
              <div className="sh-dice">
                {['d4','d6','d8','d10','d12'].map(d => (
                  <div key={d} className="sh-die">{d}</div>
                ))}
              </div>
            </div>
            <div className="sh-sec">
              <div className="sh-sec-t">Conditions</div>
              <div className="sh-conds">
                {['Hindered','Inspired','Lost Spirit','Vulnerable'].map(c => (
                  <div key={c} className="sh-cond">
                    <div className="cond-c" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chains + Skills */}
          <div className="sh-cols">
            <div className="sh-sec">
              <div className="sh-sec-t">Dice Chains</div>
              <div className="sh-sec-b">
                {chainLines.length > 0
                  ? chainLines.map((l, i) => <div key={i} className="sh-line">{l}</div>)
                  : <div className="sh-line" style={{ color:'#8a6030', fontStyle:'italic' }}>No chains bolstered</div>
                }
                {Array.from({ length: Math.max(0, 5 - chainLines.length) }, (_, i) => (
                  <div key={`empty-${i}`} className="sh-line" />
                ))}
              </div>
            </div>
            <div className="sh-sec">
              <div className="sh-sec-t">Skills</div>
              <div className="sh-sec-b">
                {char.skills.map(s => <div key={s} className="sh-line">{s}</div>)}
                {Array.from({ length: Math.max(0, 5 - char.skills.length) }, (_, i) => (
                  <div key={`empty-${i}`} className="sh-line" />
                ))}
              </div>
            </div>
          </div>

          {/* Conviction */}
          <div className="sh-conv">
            <div className="sh-fl" style={{ background:'#1a0f02', color:'#e8b84b', fontFamily:"'Cinzel',serif", fontSize:'.6rem', letterSpacing:'.17em', padding:'4px 10px' }}>
              Conviction
            </div>
            <div className="sh-conv-b">
              {char.conviction ? `"${char.conviction}"` : ''}
            </div>
          </div>

          {/* Pockets + Talents */}
          <div className="sh-cols">
            <div className="sh-sec">
              <div className="sh-sec-t">
                Pockets{' '}
                <span style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', fontSize:'.75em', letterSpacing:0, textTransform:'none', fontWeight:400 }}>
                  — really small items
                </span>
              </div>
              <div className="sh-sec-b">
                <div className="sh-line" />
                <div className="sh-line" />
              </div>
            </div>
            <div className="sh-sec">
              <div className="sh-sec-t">Talents &amp; Other Notes</div>
              <div className="sh-sec-b">
                {talentLines.map((t, i) => <div key={i} className="sh-line">{t}</div>)}
                {Array.from({ length: Math.max(0, 4 - talentLines.length) }, (_, i) => (
                  <div key={`empty-${i}`} className="sh-line" />
                ))}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="sh-sec" style={{ marginBottom: '9px' }}>
            <div className="sh-sec-t">
              Inventory{' '}
              <span style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', fontSize:'.75em', letterSpacing:0, textTransform:'none', fontWeight:400 }}>
                — Max Item Slots: {slots}
              </span>
            </div>
            <div className="sh-inv-grid">
              {invRows.slice(0, 20).map((item, i) => (
                <div key={i} className="sh-inv-r">
                  <div className="sh-inv-n">{i + 1}</div>
                  <div className="sh-inv-i">{item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* End of Session */}
          <div className="sh-eos">
            <div className="sh-sec-t">End of Session Questions</div>
            {EOS_QUESTIONS.map(q => (
              <div key={q} className="sh-eos-q">
                <div className="eos-dot" />
                {q}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Roots note */}
      {char.roots && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-title" style={{ fontSize: '.9rem' }}>Roots</div>
          <div style={{ fontStyle:'italic', color:'var(--muted2)', marginTop:'6px', fontSize:'.95rem' }}>
            {char.roots}
          </div>
        </div>
      )}
    </>
  );
}
