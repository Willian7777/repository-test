/* ============================================================
   POE2 Craft Guide — app.js
   ============================================================ */

'use strict';

// ============================================================
// DATA STORE
// ============================================================
const DATA = { items: [], mods: [], currency: [], essences: [], runes: [] };

// ============================================================
// APPLICATION STATE
// ============================================================
const STATE = {
  itemType:   '',
  rarity:     'normal',
  ilvl:       84,
  prefixes:   [null, null, null],  // {id, tier, value, value2} | null
  suffixes:   [null, null, null],
  runes:      [null, null, null, null], // rune id or null (up to 4 sockets)
  quality:    { amount: 0, catalystType: null }, // quality % + catalyst type
  lang:       'pt-br',             // 'pt-br' | 'en'
  selectedCurrency: null,
  selectedEssence:  null,
  desiredMods:      [],
  history:          [],
  currencySpent:    {},
  activeTab:        'prefix',
  currencyCategory: 'standard',
  fortuneActive:    false,
};

// ============================================================
// I18N — TRANSLATIONS
// ============================================================
const I18N = {
  'pt-br': {
    'panel.item': 'Configurador do Item', 'panel.craft': 'Ações de Craft', 'panel.results': 'Planejador de Craft',
    'clear': 'Limpar', 'item.type': 'Tipo de Item', 'item.level': 'Item Level',
    'rarity': 'Raridade Atual', 'rarity.normal': 'Normal', 'rarity.magic': 'Mágico', 'rarity.rare': 'Raro',
    'quality': 'QUALIDADE', 'sockets': 'ENCAIXES (RUNAS)',
    'select.currency': 'Selecionar Moeda', 'apply': '▶ Aplicar Moeda', 'essence': 'Aplicar Essência',
    'history': 'Histórico', 'undo': '↩ Desfazer',
    'desired.mods': '1. Afixos Desejados', 'craft.routes': '2. Rotas de Craft', 'mod.pool': 'Pool de Afixos',
    'save.load': 'Salvar / Carregar', 'save.btn': 'Salvar', 'add.mod': '+ Adicionar Afixo',
    'no.item': 'Nenhum item selecionado', 'no.mods': 'Nenhum afixo desejado', 'no.actions': 'Nenhuma ação ainda',
    'no.saves': 'Nenhuma receita salva', 'no.pool': 'Selecione um tipo de item',
    'catalyst.label': 'Catalisador', 'empty.slot': '— Vazio —', 'empty.rune': '— Sem Runa —',
  },
  'en': {
    'panel.item': 'Item Configurator', 'panel.craft': 'Craft Actions', 'panel.results': 'Craft Planner',
    'clear': 'Clear', 'item.type': 'Item Type', 'item.level': 'Item Level',
    'rarity': 'Current Rarity', 'rarity.normal': 'Normal', 'rarity.magic': 'Magic', 'rarity.rare': 'Rare',
    'quality': 'QUALITY', 'sockets': 'SOCKETS (RUNES)',
    'select.currency': 'Select Currency', 'apply': '▶ Apply Currency', 'essence': 'Apply Essence',
    'history': 'History', 'undo': '↩ Undo',
    'desired.mods': '1. Desired Affixes', 'craft.routes': '2. Craft Routes', 'mod.pool': 'Affix Pool',
    'save.load': 'Save / Load Recipe', 'save.btn': 'Save', 'add.mod': '+ Add Affix',
    'no.item': 'No item selected', 'no.mods': 'No desired affixes defined', 'no.actions': 'No actions yet',
    'no.saves': 'No saved recipes', 'no.pool': 'Select an item type',
    'catalyst.label': 'Catalyst', 'empty.slot': '— Empty —', 'empty.rune': '— No Rune —',
  },
};
function t(key) { return I18N[STATE.lang]?.[key] ?? I18N['pt-br']?.[key] ?? key; }

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' && el.type !== 'range') el.placeholder = t(key);
    else el.textContent = t(key);
  });
  // Rarity buttons
  document.querySelectorAll('.rarity-btn').forEach(btn => {
    btn.textContent = t('rarity.' + btn.dataset.rarity);
  });
  // Panel headers
  const ph = document.querySelectorAll('.panel-header h2');
  if (ph[0]) ph[0].textContent = t('panel.item');
  if (ph[1]) ph[1].textContent = t('panel.craft');
  if (ph[2]) ph[2].textContent = t('panel.results');
}

// ============================================================
// ITEM IMAGE HELPERS
// ============================================================
const CDN_BASE    = 'https://cdn.poe2db.tw/image/';  // POE2 specific CDN
const CDN_POE2    = 'https://cdn.poe2db.tw/image/';

// Only these baseTypes have reliable auto-generated CDN paths (verified against poe2db.tw)
const AUTO_CDN_TYPES = new Set(['ring', 'amulet']);

function getItemImageUrl(item) {
  if (!item) return null;

  // Use explicit cdnPath if available (for items with code-based art names)
  if (item.cdnPath) return CDN_POE2 + item.cdnPath;

  // Auto-generate only for types where poe2db.tw CDN uses Basetypes/{DisplayName}.webp
  const base = item.baseType || item.id;
  if (!AUTO_CDN_TYPES.has(base)) return null;

  const clean = item.name.replace(/[''\u2019`\-]/g, '').replace(/\s+/g, ' ').trim();
  const camel = clean.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');

  const paths = {
    ring:   `Art/2DItems/Rings/Basetypes/${camel}.webp`,
    amulet: `Art/2DItems/Amulets/Basetypes/${camel}.webp`,
  };
  const p = paths[base];
  return p ? CDN_POE2 + p : null;
}

function getItemImageUrl(item) {
  if (!item) return null;
  // Use explicit cdnPath if available (for non-standard art names)
  if (item.cdnPath) return CDN_POE2 + item.cdnPath;

  // Auto-generate from name — POE2 uses Basetypes/ subdirectory
  const clean = item.name.replace(/[''’`\-]/g, '').replace(/\s+/g, ' ').trim();
  const camel = clean.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');

  const base = item.baseType || item.id;
  const paths = {
    ring:            `Art/2DItems/Rings/Basetypes/${camel}.webp`,
    amulet:          `Art/2DItems/Amulets/Basetypes/${camel}.webp`,
    belt:            `Art/2DItems/Belts/Basetypes/${camel}.webp`,
    helmet:          `Art/2DItems/Armours/Helmets/Basetypes/${camel}.webp`,
    gloves:          `Art/2DItems/Armours/Gloves/Basetypes/${camel}.webp`,
    boots:           `Art/2DItems/Armours/Boots/Basetypes/${camel}.webp`,
    body_armour:     `Art/2DItems/Armours/BodyArmours/Basetypes/${camel}.webp`,
    shield:          `Art/2DItems/Armours/Shields/Basetypes/${camel}.webp`,
    one_hand_weapon: `Art/2DItems/Weapons/OneHandWeapons/Basetypes/${camel}.webp`,
    two_hand_weapon: `Art/2DItems/Weapons/TwoHandWeapons/Basetypes/${camel}.webp`,
    bow:             `Art/2DItems/Weapons/TwoHandWeapons/Bows/Basetypes/${camel}.webp`,
    wand:            `Art/2DItems/Weapons/OneHandWeapons/Wands/Basetypes/${camel}.webp`,
    staff:           `Art/2DItems/Weapons/TwoHandWeapons/Staves/Basetypes/${camel}.webp`,
  };
  const p = paths[base];
  return p ? CDN_POE2 + p : null;
}

// ============================================================
// SOCKET HELPERS
// ============================================================
const SOCKETS_BY_BASE_TYPE = {
  ring: 0, amulet: 0, belt: 0,
  helmet: 2, gloves: 2, boots: 2, body_armour: 4, shield: 2,
  one_hand_weapon: 2, two_hand_weapon: 4, bow: 4, wand: 1, staff: 3,
};

function getMaxSockets() {
  const item = getItem(STATE.itemType);
  if (!item) return 0;
  return SOCKETS_BY_BASE_TYPE[item.baseType || item.id] || 0;
}

function getRune(id) { return DATA.runes.find(r => r.id === id); }

// ============================================================
// UTILITY HELPERS
// ============================================================
const getMod      = id => DATA.mods.find(m => m.id === id);
const getItem     = id => DATA.items.find(i => i.id === id);
const getCurrency = id => DATA.currency.find(c => c.id === id);
const getEssence  = id => DATA.essences.find(e => e.id === id);

// Retorna o baseType do item atual (ex: "amulet" para "gold_amulet")
function getBaseType() {
  const item = getItem(STATE.itemType);
  return item ? (item.baseType || STATE.itemType) : STATE.itemType;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cloneState() {
  return {
    itemType:      STATE.itemType,
    rarity:        STATE.rarity,
    ilvl:          STATE.ilvl,
    prefixes:      STATE.prefixes.map(p => p ? { ...p } : null),
    suffixes:      STATE.suffixes.map(s => s ? { ...s } : null),
    desiredMods:   [...STATE.desiredMods],
    currencySpent: { ...STATE.currencySpent },
    fortuneActive: STATE.fortuneActive,
    quality:       { ...STATE.quality },
  };
}

function restoreState(snapshot) {
  STATE.itemType      = snapshot.itemType;
  STATE.rarity        = snapshot.rarity;
  STATE.ilvl          = snapshot.ilvl;
  STATE.prefixes      = snapshot.prefixes.map(p => p ? { ...p } : null);
  STATE.suffixes      = snapshot.suffixes.map(s => s ? { ...s } : null);
  STATE.desiredMods   = [...snapshot.desiredMods];
  STATE.currencySpent = { ...snapshot.currencySpent };
  STATE.fortuneActive = snapshot.fortuneActive || false;
  STATE.quality       = snapshot.quality ? { ...snapshot.quality } : {};
}

function rarityLabel(r) {
  return r === 'normal' ? 'Normal' : r === 'magic' ? 'Mágico' : 'Raro';
}

function formatModValue(mod, slot) {
  const { value, value2 } = slot;
  if (mod.hasTwoValues) {
    return mod.displayName
      .replace('#', value)
      .replace('#', value2);
  }
  return mod.displayName.replace('#', value);
}

function getModRangeForIlvl(mod, ilvl) {
  const validTiers = mod.tiers.filter(t => ilvl >= t.minIlvl);
  if (!validTiers.length) return null;
  const best = validTiers[0]; // tier 1 is always index 0
  const worst = validTiers[validTiers.length - 1];
  if (mod.hasTwoValues) {
    return `(${worst.minVal}-${worst.maxVal}) a (${best.minVal2}-${best.maxVal2}) [${best.label}]`;
  }
  return `${worst.minVal}–${best.maxVal} [${best.label}]`;
}

function getTierLabelForSlot(mod, slot) {
  const t = mod.tiers.find(x => x.tier === slot.tier);
  return t ? t.label : '';
}

// ============================================================
// SLOT MANAGEMENT
// ============================================================
function getMaxSlots() {
  if (STATE.rarity === 'normal') return { prefix: 0, suffix: 0 };
  if (STATE.rarity === 'magic')  return { prefix: 1, suffix: 1 };
  return { prefix: 3, suffix: 3 };
}

function countFilled(slots) {
  return slots.filter(Boolean).length;
}

function getUsedGroups(type) {
  const slots = type === 'prefix' ? STATE.prefixes : STATE.suffixes;
  return slots.filter(Boolean).map(s => getMod(s.id)?.group).filter(Boolean);
}

function compactSlots() {
  STATE.prefixes = [...STATE.prefixes.filter(Boolean), null, null, null].slice(0, 3);
  STATE.suffixes = [...STATE.suffixes.filter(Boolean), null, null, null].slice(0, 3);
}

// ============================================================
// MOD POOL & PROBABILITY ENGINE
// ============================================================
function getPoolForType(type, excludeGroups) {
  if (!STATE.itemType) return [];
  const baseType = getBaseType();
  return DATA.mods.filter(mod =>
    mod.type === type &&
    mod.itemTypes.includes(baseType) &&
    !excludeGroups.includes(mod.group) &&
    mod.tiers.some(t => STATE.ilvl >= t.minIlvl)
  );
}

function getAvailablePool(type) {
  return getPoolForType(type, getUsedGroups(type));
}

function getModWeight(mod) {
  return mod.tiers.filter(t => STATE.ilvl >= t.minIlvl).reduce((s, t) => s + t.weight, 0);
}

function calculateProbabilities(pool) {
  const total = pool.reduce((s, m) => s + getModWeight(m), 0);
  return pool
    .map(mod => ({ ...mod, probability: total > 0 ? (getModWeight(mod) / total) * 100 : 0 }))
    .sort((a, b) => b.probability - a.probability);
}

// ============================================================
// ROLLING ENGINE
// ============================================================
function rollWeightedMod(pool) {
  const total = pool.reduce((s, m) => s + getModWeight(m), 0);
  let rand = Math.random() * total;
  for (const mod of pool) {
    rand -= getModWeight(mod);
    if (rand <= 0) return buildSlotEntry(mod);
  }
  return buildSlotEntry(pool[pool.length - 1]);
}

function buildSlotEntry(mod) {
  const valid = mod.tiers.filter(t => STATE.ilvl >= t.minIlvl);
  const tierTotal = valid.reduce((s, t) => s + t.weight, 0);
  let tr = Math.random() * tierTotal;
  let chosenTier = valid[valid.length - 1];
  for (const t of valid) { tr -= t.weight; if (tr <= 0) { chosenTier = t; break; } }
  return {
    id:     mod.id,
    tier:   chosenTier.tier,
    value:  randInt(chosenTier.minVal,  chosenTier.maxVal),
    value2: mod.hasTwoValues ? randInt(chosenTier.minVal2, chosenTier.maxVal2) : null,
  };
}

function rollNMods(prefixCount, suffixCount, startPrefixGroups = [], startSuffixGroups = []) {
  const prefixes = [];
  const suffixes = [];
  const usedP = [...startPrefixGroups];
  const usedS = [...startSuffixGroups];

  for (let i = 0; i < prefixCount; i++) {
    const pool = getPoolForType('prefix', usedP);
    if (!pool.length) break;
    const rolled = rollWeightedMod(pool);
    prefixes.push(rolled);
    const g = getMod(rolled.id)?.group;
    if (g) usedP.push(g);
  }
  for (let i = 0; i < suffixCount; i++) {
    const pool = getPoolForType('suffix', usedS);
    if (!pool.length) break;
    const rolled = rollWeightedMod(pool);
    suffixes.push(rolled);
    const g = getMod(rolled.id)?.group;
    if (g) usedS.push(g);
  }
  return { prefixes, suffixes };
}

function applyModsToState(prefixes, suffixes) {
  STATE.prefixes = [null, null, null];
  STATE.suffixes = [null, null, null];
  prefixes.forEach((m, i) => { if (i < 3) STATE.prefixes[i] = m; });
  suffixes.forEach((m, i) => { if (i < 3) STATE.suffixes[i] = m; });
}

function getRandomDistribution(total, maxPer = 3) {
  const minPre = Math.max(1, total - maxPer);
  const maxPre = Math.min(maxPer, total - 1);
  const pre = randInt(minPre, maxPre);
  return { prefixCount: pre, suffixCount: total - pre };
}

// ============================================================
// CURRENCY ENGINE
// ============================================================
function applyCurrency(currencyId) {
  const currency = getCurrency(currencyId);
  if (!currency) return;

  if (!currency.allowedRarities.includes(STATE.rarity)) {
    showNotification(`Esta moeda não pode ser usada em itens ${rarityLabel(STATE.rarity)}.`, 'danger');
    return;
  }

  if (currency.requiresOpenSlot) {
    const max = getMaxSlots();
    const openPre = max.prefix - countFilled(STATE.prefixes);
    const openSuf = max.suffix - countFilled(STATE.suffixes);
    if (openPre <= 0 && openSuf <= 0) {
      showNotification('Item não tem slots vazios para adicionar um afixo.', 'danger');
      return;
    }
  }

  saveToHistory(currency.name);

  switch (currency.action) {
    case 'convert_to_magic': {
      STATE.rarity = 'magic';
      const count = Math.random() < 0.5 ? 1 : 2;
      if (count === 1) {
        const isPrefix = Math.random() < 0.5;
        const { prefixes, suffixes } = rollNMods(isPrefix ? 1 : 0, isPrefix ? 0 : 1);
        applyModsToState(prefixes, suffixes);
      } else {
        const { prefixes, suffixes } = rollNMods(1, 1);
        applyModsToState(prefixes, suffixes);
      }
      break;
    }

    case 'add_mod': {
      const max = getMaxSlots();
      const openPre = max.prefix - countFilled(STATE.prefixes);
      const openSuf = max.suffix - countFilled(STATE.suffixes);
      let type;
      if (openPre > 0 && openSuf > 0) type = Math.random() < 0.5 ? 'prefix' : 'suffix';
      else if (openPre > 0) type = 'prefix';
      else type = 'suffix';

      const pool = getAvailablePool(type);
      if (!pool.length) { showNotification('Nenhum afixo disponível para adicionar.', 'danger'); STATE.history.pop(); return; }

      const rolled = rollWeightedMod(pool);
      const slots = type === 'prefix' ? STATE.prefixes : STATE.suffixes;
      const idx = slots.findIndex(s => !s);
      if (idx >= 0) slots[idx] = rolled;
      if (currency.resultRarity) STATE.rarity = currency.resultRarity;
      break;
    }

    case 'reroll_all': {
      if (STATE.rarity === 'magic') {
        const count = Math.random() < 0.5 ? 1 : 2;
        const { prefixes, suffixes } = count === 1
          ? rollNMods(Math.random() < 0.5 ? 1 : 0, Math.random() < 0.5 ? 0 : 1)
          : rollNMods(1, 1);
        applyModsToState(prefixes, suffixes);
      } else {
        const total = randInt(currency.minMods, currency.maxMods);
        const { prefixCount, suffixCount } = getRandomDistribution(total);
        const { prefixes, suffixes } = rollNMods(prefixCount, suffixCount);
        applyModsToState(prefixes, suffixes);
      }
      break;
    }

    case 'upgrade_to_rare': {
      STATE.rarity = 'rare';
      const usedPre = getUsedGroups('prefix');
      const usedSuf = getUsedGroups('suffix');
      const filledPre = countFilled(STATE.prefixes);
      const filledSuf = countFilled(STATE.suffixes);
      const canPre = filledPre < 3;
      const canSuf = filledSuf < 3;
      if (!canPre && !canSuf) break;
      const type = canPre && canSuf ? (Math.random() < 0.5 ? 'prefix' : 'suffix') : (canPre ? 'prefix' : 'suffix');
      const pool = getPoolForType(type, type === 'prefix' ? usedPre : usedSuf);
      if (pool.length) {
        const rolled = rollWeightedMod(pool);
        const slots = type === 'prefix' ? STATE.prefixes : STATE.suffixes;
        const idx = slots.findIndex(s => !s);
        if (idx >= 0) slots[idx] = rolled;
      }
      break;
    }

    case 'convert_to_rare': {
      STATE.rarity = 'rare';
      const total = randInt(currency.minMods, currency.maxMods);
      const { prefixCount, suffixCount } = getRandomDistribution(total);
      const { prefixes, suffixes } = rollNMods(prefixCount, suffixCount);
      applyModsToState(prefixes, suffixes);
      break;
    }

    case 'remove_mod': {
      const all = [
        ...STATE.prefixes.map((m, i) => m ? { arr: 'prefix', idx: i } : null),
        ...STATE.suffixes.map((m, i) => m ? { arr: 'suffix', idx: i } : null),
      ].filter(Boolean);
      if (!all.length) { showNotification('Item não tem afixos para remover.', 'danger'); STATE.history.pop(); return; }
      const chosen = all[randInt(0, all.length - 1)];
      if (chosen.arr === 'prefix') STATE.prefixes[chosen.idx] = null;
      else STATE.suffixes[chosen.idx] = null;
      compactSlots();
      const remaining = countFilled(STATE.prefixes) + countFilled(STATE.suffixes);
      if (remaining === 0) STATE.rarity = 'normal';
      break;
    }

    case 'reroll_values': {
      const reroll = slots => slots.map(slot => {
        if (!slot) return null;
        const mod = getMod(slot.id);
        if (!mod) return slot;
        const valid = mod.tiers.filter(t => STATE.ilvl >= t.minIlvl);
        const t = valid.find(x => x.tier === slot.tier) || valid[valid.length - 1];
        if (!t) return slot;
        return {
          ...slot,
          value:  randInt(t.minVal,  t.maxVal),
          value2: mod.hasTwoValues ? randInt(t.minVal2, t.maxVal2) : null,
        };
      });
      STATE.prefixes = reroll(STATE.prefixes);
      STATE.suffixes = reroll(STATE.suffixes);
      break;
    }

    case 'remove_all': {
      STATE.rarity   = 'normal';
      STATE.prefixes = [null, null, null];
      STATE.suffixes = [null, null, null];
      break;
    }

    case 'upgrade_mod_tier': {
      const allSlots = [
        ...STATE.prefixes.map((m, i) => m ? { arr: 'prefix', idx: i } : null),
        ...STATE.suffixes.map((m, i) => m ? { arr: 'suffix', idx: i } : null),
      ].filter(Boolean);
      const upgradeable = allSlots.filter(({ arr, idx }) => {
        const slot = arr === 'prefix' ? STATE.prefixes[idx] : STATE.suffixes[idx];
        const mod = getMod(slot.id);
        if (!mod) return false;
        const valid = mod.tiers.filter(t => STATE.ilvl >= t.minIlvl);
        const ci = valid.findIndex(t => t.tier === slot.tier);
        return ci > 0; // tier 1 é index 0 (melhor), ci > 0 significa que pode melhorar
      });
      if (!upgradeable.length) {
        showNotification('Nenhum afixo pode ser melhorado — todos já estão no tier máximo.', 'danger');
        STATE.history.pop(); return;
      }
      const chosen = upgradeable[randInt(0, upgradeable.length - 1)];
      const slotArr = chosen.arr === 'prefix' ? STATE.prefixes : STATE.suffixes;
      const slot = slotArr[chosen.idx];
      const mod = getMod(slot.id);
      const valid = mod.tiers.filter(t => STATE.ilvl >= t.minIlvl);
      const ci = valid.findIndex(t => t.tier === slot.tier);
      const nextTier = valid[ci - 1];
      slotArr[chosen.idx] = {
        ...slot,
        tier:   nextTier.tier,
        value:  randInt(nextTier.minVal,  nextTier.maxVal),
        value2: mod.hasTwoValues ? randInt(nextTier.minVal2, nextTier.maxVal2) : null,
      };
      break;
    }

    case 'reroll_two_mods': {
      // Omen of Dominance — garante exatamente 1 prefix + 1 suffix
      const { prefixes, suffixes } = rollNMods(1, 1);
      applyModsToState(prefixes, suffixes);
      break;
    }

    case 'fortune_buff': {
      STATE.fortuneActive = true;
      showNotification('Bênção da Fortuna ativa! A próxima moeda tem 33% de chance de ser aplicada novamente de graça.', 'success');
      STATE.currencySpent[currencyId] = (STATE.currencySpent[currencyId] || 0) + 1;
      renderAll();
      return; // não precisa de mais processamento
    }

    case 'add_quality': {
      const item = getItem(STATE.itemType);
      if (!item || !currency.applicableCategories?.includes(item.category)) {
        showNotification(`${currency.name} só pode ser usada em acessórios (Anel, Amuleto, Cinto).`, 'danger');
        STATE.history.pop(); return;
      }
      const qt = currency.qualityType;
      STATE.quality[qt] = Math.min(100, (STATE.quality[qt] || 0) + 20);
      showNotification(
        `${currency.name} aplicada! +20% Qualidade ${currency.qualityDescription}. ` +
        `Total ${qt}: ${STATE.quality[qt]}%. Pesos de mods compatíveis aumentados.`,
        'success'
      );
      STATE.currencySpent[currencyId] = (STATE.currencySpent[currencyId] || 0) + 1;
      renderAll();
      return;
    }

    case 'corrupt': {
      const corruptMods = ['Imune a Sangramento (Corrupção)', 'Imune a Maldição (Corrupção)',
        '+1 ao Nível de Gemas de Suporte (Corrupção)', 'Habilidades causam 1 Dano de Raio extra (Corrupção)',
        '+2 ao Nível de Gemas de Área (Corrupção)', 'Projéteis perfuram 1 alvo adicional (Corrupção)',
        'Ataques têm 10% de chance de causar Cegueira (Corrupção)'];
      const roll = Math.random();
      if (roll < 0.25) {
        // Adiciona mod de corrupção
        showNotification(`Corrompido! Mod adicionado: "${corruptMods[randInt(0, corruptMods.length - 1)]}"`, 'success');
      } else if (roll < 0.5) {
        // Remove um afixo aleatório
        const allCorrupt = [
          ...STATE.prefixes.map((m, i) => m ? { arr: 'prefix', idx: i } : null),
          ...STATE.suffixes.map((m, i) => m ? { arr: 'suffix', idx: i } : null),
        ].filter(Boolean);
        if (allCorrupt.length) {
          const c2 = allCorrupt[randInt(0, allCorrupt.length - 1)];
          if (c2.arr === 'prefix') STATE.prefixes[c2.idx] = null;
          else STATE.suffixes[c2.idx] = null;
          compactSlots();
        }
        showNotification('Corrompido! Um afixo foi removido pelo processo de corrupção.', 'danger');
      } else if (roll < 0.75) {
        // Rerolha valores
        const reroll = slots => slots.map(slot => {
          if (!slot) return null;
          const m = getMod(slot.id); if (!m) return slot;
          const tv = m.tiers.filter(t => STATE.ilvl >= t.minIlvl);
          const t2 = tv.find(x => x.tier === slot.tier) || tv[tv.length - 1];
          if (!t2) return slot;
          return { ...slot, value: randInt(t2.minVal, t2.maxVal), value2: m.hasTwoValues ? randInt(t2.minVal2, t2.maxVal2) : null };
        });
        STATE.prefixes = reroll(STATE.prefixes);
        STATE.suffixes = reroll(STATE.suffixes);
        showNotification('Corrompido! Valores dos afixos foram rerolhados pela corrupção.', 'warning');
      } else {
        showNotification('Corrompido! Nenhuma mudança nos afixos (item apenas marcado como corrompido).', 'info');
      }
      break;
    }
  }

  STATE.currencySpent[currencyId] = (STATE.currencySpent[currencyId] || 0) + 1;

  // Omen of Fortune — 33% de chance de reaplicar a mesma moeda de graça
  if (STATE.fortuneActive && currency.action !== 'fortune_buff') {
    STATE.fortuneActive = false;
    if (Math.random() < 0.333) {
      showNotification('Bênção da Fortuna ativou! Moeda aplicada novamente de graça!', 'success');
      applyCurrency(currencyId);
      return;
    }
  }

  renderAll();
}

// ============================================================
// ESSENCE ENGINE
// ============================================================
function applyEssence(essenceId) {
  const essence = getEssence(essenceId);
  if (!essence) return;
  if (!STATE.itemType) { showNotification('Selecione um tipo de item primeiro.', 'danger'); return; }

  const baseType = getBaseType();
  const guaranteed = essence.guaranteedByItemType[baseType];
  if (!guaranteed) {
    showNotification(`Esta essência não pode ser usada em ${getItem(STATE.itemType)?.name}.`, 'danger');
    return;
  }

  // Essences require Normal item (or scour first)
  if (STATE.rarity !== 'normal') {
    showNotification('Essências requerem um item Normal. Use Orb of Scouring primeiro.', 'danger');
    return;
  }

  saveToHistory(`${essence.name}`);

  STATE.rarity = 'rare';

  // Build guaranteed mod slot entry
  const guaranteedMod = getMod(guaranteed.modId);
  let guaranteedSlot = null;
  if (guaranteedMod) {
    const tier = guaranteedMod.tiers.find(t => t.tier === guaranteed.tier) || guaranteedMod.tiers[0];
    guaranteedSlot = {
      id:     guaranteedMod.id,
      tier:   tier.tier,
      value:  randInt(tier.minVal,  tier.maxVal),
      value2: guaranteedMod.hasTwoValues ? randInt(tier.minVal2, tier.maxVal2) : null,
    };
  }

  // Roll 3-5 total mods (guaranteed + random)
  const total = randInt(3, 5);
  const { prefixCount, suffixCount } = getRandomDistribution(total);

  // Place guaranteed mod first, fill rest randomly
  const isGuaranteedPrefix = guaranteedMod?.type === 'prefix';
  const guaranteedGroups = guaranteedMod ? [guaranteedMod.group] : [];

  const remainingPre = Math.max(0, prefixCount - (isGuaranteedPrefix ? 1 : 0));
  const remainingSuf = Math.max(0, suffixCount - (!isGuaranteedPrefix ? 1 : 0));

  const { prefixes, suffixes } = rollNMods(
    remainingPre, remainingSuf,
    isGuaranteedPrefix ? guaranteedGroups : [],
    !isGuaranteedPrefix ? guaranteedGroups : []
  );

  if (isGuaranteedPrefix) prefixes.unshift(guaranteedSlot);
  else suffixes.unshift(guaranteedSlot);

  applyModsToState(prefixes, suffixes);

  STATE.currencySpent[essenceId] = (STATE.currencySpent[essenceId] || 0) + 1;
  showNotification(`${essence.name} aplicada! Mod garantido: ${guaranteedMod?.displayName}`, 'success');
  renderAll();
}

// ============================================================
// HISTORY
// ============================================================
function saveToHistory(actionLabel) {
  STATE.history.push({ label: actionLabel, snapshot: cloneState() });
  if (STATE.history.length > 30) STATE.history.shift();
}

function undoLastAction() {
  if (!STATE.history.length) return;
  const last = STATE.history.pop();
  restoreState(last.snapshot);
  renderAll();
  showNotification(`Ação desfeita: ${last.label}`, 'info');
}

// ============================================================
// CRAFT PATH GENERATOR — Multi-caminho
// ============================================================
function estimateSingleProb(mod) {
  if (!mod) return 0;
  const pool = calculateProbabilities(getPoolForType(mod.type, []));
  const entry = pool.find(m => m.id === mod.id);
  return entry ? entry.probability.toFixed(1) : '?';
}

function estimateCombinedProb(desired) {
  if (!desired.length) return 0;
  let combined = 1;
  const usedPre = [], usedSuf = [];
  for (const mod of desired) {
    const pool = calculateProbabilities(getPoolForType(mod.type, mod.type === 'prefix' ? usedPre : usedSuf));
    const entry = pool.find(m => m.id === mod.id);
    combined *= entry ? entry.probability / 100 : 0;
    if (mod.type === 'prefix') usedPre.push(mod.group);
    else usedSuf.push(mod.group);
  }
  return (combined * 100).toFixed(2);
}

function estimateAnnulProb(desired) {
  const all = [...STATE.prefixes, ...STATE.suffixes].filter(Boolean);
  const desiredOnItem = desired.filter(m => {
    const arr = m.type === 'prefix' ? STATE.prefixes : STATE.suffixes;
    return arr.some(s => s?.id === m.id);
  });
  const undesired = all.length - desiredOnItem.length;
  if (all.length === 0) return 0;
  return ((undesired / all.length) * 100).toFixed(0);
}

function estimateAvgAttempts(prob) {
  const p = parseFloat(prob);
  if (!p || p <= 0) return '?';
  return Math.round(100 / p);
}

// Retorna array de { id, name, badge, badgeColor, costLabel, steps[], available }
function generateAllCraftPaths() {
  if (!STATE.itemType || !STATE.desiredMods.length) return null;

  const desired    = STATE.desiredMods.map(getMod).filter(Boolean);
  const desiredPre = desired.filter(m => m.type === 'prefix');
  const desiredSuf = desired.filter(m => m.type === 'suffix');
  const combProb   = estimateCombinedProb(desired);
  const avgChaos   = estimateAvgAttempts(combProb);

  const currentPre = STATE.prefixes.filter(Boolean).map(s => getMod(s.id)).filter(Boolean);
  const currentSuf = STATE.suffixes.filter(Boolean).map(s => getMod(s.id)).filter(Boolean);

  // Mods do item que batem com o desejado
  const matchedDesired = desired.filter(m => {
    const arr = m.type === 'prefix' ? STATE.prefixes : STATE.suffixes;
    return arr.some(s => s?.id === m.id);
  });
  const hasAll = matchedDesired.length === desired.length;

  const baseType = getBaseType();

  // Essências disponíveis para mods desejados
  const essenceOptions = DATA.essences.filter(e => {
    if (e.category === 'ritual') return false; // Soul Cores tratados separado
    const g = e.guaranteedByItemType[baseType];
    return g && desired.some(m => m.id === g.modId);
  });
  const soulCoreOptions = DATA.essences.filter(e => {
    if (e.category !== 'ritual') return false;
    const g = e.guaranteedByItemType[baseType];
    return g && desired.some(m => m.id === g.modId);
  });

  const paths = [];

  // ── CAMINHO 0: Item já perfeito ────────────────────────────────────────────
  if (hasAll) {
    const lowValues = desired.some(m => {
      const slot = (m.type === 'prefix' ? STATE.prefixes : STATE.suffixes).find(s => s?.id === m.id);
      if (!slot) return false;
      const tier = m.tiers.find(t => t.tier === slot.tier);
      if (!tier) return false;
      const range = tier.maxVal - tier.minVal;
      return range > 0 && slot.value < tier.minVal + range * 0.6;
    });
    paths.push({
      id: 'already_done',
      name: '✓ Item Completo',
      badge: 'Feito',
      badgeColor: '#60b060',
      costLabel: 'Sem custo',
      available: true,
      steps: [
        { num: 1, text: '🎉 Item já possui todos os afixos desejados!', type: 'step-high', subtext: '' },
        ...(lowValues ? [{ num: 2, text: 'Valores abaixo do ideal detectados. Use <strong>Divine Orb</strong> (padrão) ou <strong>Omen of Refreshment</strong> (Ritual) para rerolhar os números.', type: 'step-info', subtext: 'Ambos mantêm os afixos e apenas ajustam os valores numéricos.' }] : []),
      ]
    });
    return paths;
  }

  // ── CAMINHO A: Alteration / Aug / Regal (1-2 mods desejados) ──────────────
  if (desired.length <= 2 && desiredPre.length <= 1 && desiredSuf.length <= 1) {
    const pA = [];
    let sn = 1;
    const add = (text, type, sub = '') => pA.push({ num: sn++, text, type, subtext: sub });
    if (STATE.rarity !== 'normal') add('Use <strong>Orb of Scouring</strong> para limpar o item (Normal).', 'step-medium');
    add('Use <strong>Orb of Transmutation</strong> para transformar em Mágico.', 'step-medium');
    add(`Use <strong>Orb of Alteration</strong> repetidamente até conseguir o(s) afixo(s) desejado(s).`, 'step-medium',
      `Chance por rolagem: ~${combProb}% | Média: ~${avgChaos} Alterations`);
    if (desired.length === 2)
      add('Se caiu só 1 afixo desejado, use <strong>Orb of Augmentation</strong> para adicionar o segundo.', 'step-info',
        'Aug só funciona se houver slot livre no item Mágico.');
    add('Use <strong>Regal Orb</strong> para evoluir para Raro (+1 mod aleatório) quando tiver os mods desejados.', 'step-medium');
    add('Use <strong>Exalted Orb</strong> para completar os slots restantes do item Raro.', 'step-info');
    add('Use <strong>Divine Orb</strong> para otimizar os valores numéricos dos afixos.', 'step-info');
    paths.push({
      id: 'alt_aug_regal', name: 'Alt → Aug → Regal', badge: 'Econômico', badgeColor: '#60b060',
      costLabel: `~${avgChaos} Alterations`, available: true, steps: pA
    });
  }

  // ── CAMINHO B: Spam de Chaos (3+ mods ou item Raro) ────────────────────────
  {
    const pB = [];
    let sn = 1;
    const add = (text, type, sub = '') => pB.push({ num: sn++, text, type, subtext: sub });
    if (STATE.rarity === 'normal') add('Use <strong>Orb of Alchemy</strong> para criar um item Raro.', 'step-medium');
    add(`Spam <strong>Chaos Orb</strong> até acertar os afixos desejados.`, 'step-medium',
      `Chance por rolagem: ~${combProb}% | Média: ~${avgChaos} Chaos Orbs`);
    add('Quando acertar o melhor afixo desejado, pare e analise o restante.', 'step-info');
    if (desired.length >= 2)
      add('Se o item tiver pelo menos 1 desejado e slots vazios, use <strong>Exalted Orb</strong> para completar.', 'step-info');
    add('Use <strong>Divine Orb</strong> para maximizar os valores numéricos dos afixos.', 'step-info');
    paths.push({
      id: 'chaos_spam', name: 'Spam de Chaos', badge: desired.length >= 3 ? 'Caótico' : 'Padrão', badgeColor: '#d4924a',
      costLabel: `~${avgChaos} Chaos`, available: true, steps: pB
    });
  }

  // ── CAMINHO C: Via Essência + Completar ────────────────────────────────────
  if (essenceOptions.length) {
    const pC = [];
    let sn = 1;
    const add = (text, type, sub = '') => pC.push({ num: sn++, text, type, subtext: sub });
    const ess = essenceOptions[0];
    const g = ess.guaranteedByItemType[baseType];
    const gMod = getMod(g.modId);
    const remainDesired = desired.filter(m => m.id !== gMod?.id);
    const remainProb = remainDesired.length ? estimateCombinedProb(remainDesired) : '100';
    const remainAvg = estimateAvgAttempts(remainProb);

    if (STATE.rarity !== 'normal') add('Use <strong>Orb of Scouring</strong> para limpar o item (Normal).', 'step-medium');
    add(`Use <strong>${ess.name}</strong> — garante "${gMod?.displayName}" no item.`, 'step-high',
      `Essências sempre produzem item Raro com o afixo garantido + 3-5 mods aleatórios.`);
    if (remainDesired.length === 0) {
      add('Todos os afixos desejados garantidos pela essência. Repita se os mods extras incomodarem.', 'step-info');
    } else {
      add(`Repita a essência até que os mods extras também incluam: ${remainDesired.map(m => `"${m.displayName}"`).join(', ')}`, 'step-medium',
        `Chance dos extras desejados aparacer: ~${remainProb}% | Média: ~${remainAvg} Essências`);
      add('Quando o item tiver o(s) afixo(s) garantido(s) + pelo menos 1 extra desejado, use <strong>Exalted Orb</strong> para completar.', 'step-info');
    }
    add('Use <strong>Divine Orb</strong> para otimizar os valores numéricos dos afixos.', 'step-info');
    paths.push({
      id: 'essence', name: `Via ${ess.name}`, badge: 'Garantido', badgeColor: '#5da85d',
      costLabel: `~${remainAvg} Essências`, available: true, steps: pC
    });
  }

  // ── CAMINHO D: Via Soul Core (Ritual) ─────────────────────────────────────
  if (soulCoreOptions.length) {
    const pD = [];
    let sn = 1;
    const add = (text, type, sub = '') => pD.push({ num: sn++, text, type, subtext: sub });
    const sc = soulCoreOptions[0];
    const g = sc.guaranteedByItemType[baseType];
    const gMod = getMod(g.modId);
    const tierLabel = g.tier === 1 ? 'T1' : `T${g.tier}`;

    if (STATE.rarity !== 'normal') add('Use <strong>Orb of Scouring</strong> para limpar o item (Normal).', 'step-medium');
    add(`[Ritual] Use <strong>${sc.name}</strong> — garante "${gMod?.displayName}" (${tierLabel}) no item.`, 'step-high',
      `Soul Cores funcionam como Essências. Obtidos em encontros de Ritual.`);
    add(`Repita o Soul Core até acertar os mods extras desejados junto com o garantido.`, 'step-medium',
      `Após acertar, use Exalted Orb para preencher slots vazios restantes.`);
    add('Use <strong>Omen of Refreshment</strong> (Ritual) ou <strong>Divine Orb</strong> para otimizar os valores.', 'step-info');
    paths.push({
      id: 'soul_core', name: `Soul Core (Ritual)`, badge: 'Ritual', badgeColor: '#d060b0',
      costLabel: 'Soul Core + Exalteds', available: true, steps: pD
    });
  }

  // ── CAMINHO E: Ritual — Whittling + Regal ────────────────────────────────
  if (desired.length <= 2 && desiredPre.length <= 1 && desiredSuf.length <= 1) {
    const pE = [];
    let sn = 1;
    const add = (text, type, sub = '') => pE.push({ num: sn++, text, type, subtext: sub });
    if (STATE.rarity !== 'normal') add('Use <strong>Orb of Scouring</strong> para limpar o item.', 'step-medium');
    add('Transmute → Alteration até conseguir pelo menos 1 afixo desejado.', 'step-medium',
      `Chance de acertar o primeiro desejado: ~${estimateSingleProb(desired[0])}%`);
    add(`[Ritual] Use <strong>Omen of Whittling</strong> para remover o afixo indesejado do item Mágico.`, 'step-high',
      'Whittling remove 1 mod aleatório de itens Mágicos — ideal para limpar o "segundo mod ruim".');
    if (desired.length === 2)
      add('Use <strong>Orb of Augmentation</strong> para adicionar o segundo afixo desejado (se slot livre).', 'step-info');
    add('Use <strong>Regal Orb</strong> para evoluir para Raro.', 'step-medium');
    add('Complete os slots com <strong>Exalted Orb</strong>.', 'step-info');
    paths.push({
      id: 'whittling', name: 'Alt + Whittling (Ritual)', badge: 'Ritual', badgeColor: '#d060b0',
      costLabel: 'Alt + Omen + Regal', available: true, steps: pE
    });
  }

  // ── CAMINHO F: Omen of Amelioration — para quem tem tier baixo ────────────
  {
    const lowTierMods = matchedDesired.filter(m => {
      const slot = (m.type === 'prefix' ? STATE.prefixes : STATE.suffixes).find(s => s?.id === m.id);
      if (!slot) return false;
      return slot.tier > 1;
    });
    if (lowTierMods.length) {
      const pF = [];
      let sn = 1;
      const add = (text, type, sub = '') => pF.push({ num: sn++, text, type, subtext: sub });
      add(`O item já tem ${lowTierMods.map(m => `"${m.displayName}"`).join(', ')} mas em tier baixo.`, 'step-info');
      add(`[Ritual] Use <strong>Omen of Amelioration</strong> para melhorar 1 afixo aleatório ao próximo tier.`, 'step-high',
        `Pode acertar um dos afixos desejados com tier baixo. Há ${lowTierMods.length} candidato(s).`);
      add('Repita Amelioration até todos os afixos desejados estarem em T1 ou T2.', 'step-medium');
      add('Use <strong>Divine Orb</strong> para maximizar os valores dentro do tier.', 'step-info');
      paths.push({
        id: 'amelioration', name: 'Amelioration (Ritual)', badge: 'Tier Up', badgeColor: '#90d040',
        costLabel: 'Omens + Divine', available: true, steps: pF
      });
    }
  }

  // ── CAMINHO G: Catalyst / Qualidade (Delirium ou Breach) — apenas acessórios
  {
    const item = getItem(STATE.itemType);
    if (item?.category === 'jewellery') {
      const qualityDesiredType = (() => {
        if (desired.some(m => ['jewellery_fire_damage', 'weapon_fire_damage'].includes(m.id))) return 'fire';
        if (desired.some(m => ['jewellery_cold_damage', 'weapon_cold_damage'].includes(m.id))) return 'cold';
        if (desired.some(m => ['jewellery_lightning_damage', 'weapon_lightning_damage'].includes(m.id))) return 'lightning';
        if (desired.some(m => ['jewellery_phys_damage', 'weapon_phys_damage', 'jewellery_life', 'armour_life'].includes(m.id))) return 'physical';
        if (desired.some(m => m.group?.includes('Damage'))) return 'attack';
        if (desired.some(m => m.group?.includes('Res'))) return 'resistance';
        return null;
      })();

      if (qualityDesiredType) {
        const catNames = { fire: "Xoph's Catalyst (Breach)", cold: "Tul's Catalyst (Breach)",
          lightning: "Esh's Catalyst (Breach)", physical: "Uul-Netol's Catalyst (Breach)",
          attack: 'Distilled Guilt (Delirium)', resistance: 'Distilled Despair (Delirium)',
          elemental: 'Distilled Fear (Delirium)' };
        const catName = catNames[qualityDesiredType] || 'Catalyst/Distilled compatível';
        const pG = [];
        let sn = 1;
        const add = (text, type, sub = '') => pG.push({ num: sn++, text, type, subtext: sub });
        add(`Aplique 20% de Qualidade com <strong>${catName}</strong> no acessório.`, 'step-high',
          'Qualidade aumenta o peso dos mods compatíveis, aumentando a chance de rolar os desejados.');
        add('Com qualidade aplicada, use <strong>Orb of Alteration</strong> ou <strong>Chaos Orb</strong> normalmente.', 'step-medium',
          `A qualidade eleva a probabilidade em ~20-30% para mods do tipo ${qualityDesiredType}.`);
        add('Repita até conseguir os afixos desejados — a qualidade persiste entre rolagens.', 'step-info');
        add('Use <strong>Divine Orb</strong> para otimizar os valores.', 'step-info');
        paths.push({
          id: 'quality_craft', name: `Qualidade + Craft (${qualityDesiredType === 'fire' ? 'Breach' : 'Delirium'})`,
          badge: 'Mecânica', badgeColor: qualityDesiredType === 'fire' ? '#d04020' : '#9050c0',
          costLabel: 'Catalyst/Distilled + Alt/Chaos', available: true, steps: pG
        });
      }
    }
  }

  // ── CAMINHO H: Annul + Exalted (item raro com alguns desejados) ─────────────
  if (STATE.rarity === 'rare' && matchedDesired.length > 0 && matchedDesired.length < desired.length) {
    const missing = desired.filter(m => !matchedDesired.includes(m));
    const openPre = 3 - currentPre.length;
    const openSuf = 3 - currentSuf.length;
    const annulProb = estimateAnnulProb(desired);
    const pH = [];
    let sn = 1;
    const add = (text, type, sub = '') => pH.push({ num: sn++, text, type, subtext: sub });

    add(`Item já possui ${matchedDesired.length}/${desired.length} afixo(s) desejado(s)!`, 'step-high',
      `Falta: ${missing.map(m => `"${m.displayName}"`).join(', ')}`);
    if (openPre > 0 || openSuf > 0) {
      add(`Use <strong>Exalted Orb</strong> para adicionar afixo em slot vazio.`, 'step-high',
        `Há ${openPre + openSuf} slot(s) livre(s). Chance de acertar o desejado: ~${estimateSingleProb(missing[0])}%`);
      if (missing.length > openPre + openSuf)
        add('Se o Exalted não acertar o desejado, use <strong>Annulment</strong> no indesejado e tente novamente.', 'step-danger',
          `Chance de remover um mod INDESEJADO (seguro): ~${annulProb}%`);
    } else {
      add(`Use <strong>Orb of Annulment</strong> para remover 1 afixo indesejado e abrir slot.`, 'step-danger',
        `⚠ RISCO: Chance de remover mod indesejado (desejado): ~${annulProb}% | Slots cheios!`);
      add('Após abrir slot, use <strong>Exalted Orb</strong> para adicionar o afixo em falta.', 'step-info');
    }
    add('Use <strong>Divine Orb</strong> para maximizar os valores.', 'step-info');
    paths.push({
      id: 'annul_exalt', name: 'Annul + Exalt (Completar)', badge: 'Arriscado', badgeColor: '#c85050',
      costLabel: 'Annulment + Exalted', available: true, steps: pH
    });
  }

  if (!paths.length) {
    return [{
      id: 'generic', name: 'Rota Genérica', badge: 'Padrão', badgeColor: '#888',
      costLabel: 'Variável', available: true,
      steps: [{ num: 1, text: 'Selecione um tipo de item e afixos desejados para ver rotas detalhadas.', type: 'step-info', subtext: '' }]
    }];
  }
  return paths;
}

// ============================================================
// SAVE / LOAD BUILDS
// ============================================================
const LS_KEY = 'poe2craftguide_builds';

function loadBuildsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function saveBuildsToStorage(builds) {
  localStorage.setItem(LS_KEY, JSON.stringify(builds));
}

function saveBuild(name) {
  if (!name.trim()) { showNotification('Digite um nome para a receita.', 'danger'); return; }
  const builds = loadBuildsFromStorage();
  builds.unshift({
    name: name.trim(),
    date: new Date().toLocaleDateString('pt-BR'),
    itemType: STATE.itemType,
    rarity: STATE.rarity,
    ilvl: STATE.ilvl,
    prefixes: STATE.prefixes.map(p => p ? { ...p } : null),
    suffixes: STATE.suffixes.map(s => s ? { ...s } : null),
    desiredMods: [...STATE.desiredMods],
  });
  if (builds.length > 20) builds.pop();
  saveBuildsToStorage(builds);
  showNotification(`Receita "${name.trim()}" salva!`, 'success');
  renderSavedBuilds();
}

function loadBuild(index) {
  const builds = loadBuildsFromStorage();
  const b = builds[index];
  if (!b) return;
  STATE.itemType    = b.itemType   || '';
  STATE.rarity      = b.rarity     || 'normal';
  STATE.ilvl        = b.ilvl       || 84;
  STATE.prefixes    = (b.prefixes  || [null,null,null]).map(p => p ? { ...p } : null);
  STATE.suffixes    = (b.suffixes  || [null,null,null]).map(s => s ? { ...s } : null);
  STATE.desiredMods = b.desiredMods ? [...b.desiredMods] : [];
  STATE.history     = [];
  STATE.currencySpent = {};
  if (window._syncItemPicker) window._syncItemPicker();
  renderAll();
  showNotification(`Receita "${b.name}" carregada!`, 'success');
}

function deleteBuild(index) {
  const builds = loadBuildsFromStorage();
  const name = builds[index]?.name;
  builds.splice(index, 1);
  saveBuildsToStorage(builds);
  showNotification(`Receita "${name}" removida.`, 'info');
  renderSavedBuilds();
}

// ============================================================
// NOTIFICATION
// ============================================================
let notifTimer = null;
function showNotification(msg, type = 'default') {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.className = `notification show ${type}`;
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => { el.className = 'notification'; }, 3200);
}

// ============================================================
// RENDER — ITEM PANEL (LEFT)
// ============================================================
function renderItemPanel() {
  // Sync rarity buttons
  document.querySelectorAll('.rarity-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.rarity === STATE.rarity);
  });
  document.getElementById('input-ilvl').value = STATE.ilvl;
  const typeSelect = document.getElementById('select-item-type');
  if (typeSelect.value !== STATE.itemType) typeSelect.value = STATE.itemType;

  renderItemImage();
  renderQualitySection();
  renderItemCard();
  renderModSlots('prefix');
  renderModSlots('suffix');
  renderRuneSection();
}

function renderItemImage() {
  const wrap = document.getElementById('item-image-wrap');
  const img  = document.getElementById('item-image');
  const ph   = document.getElementById('item-image-placeholder');
  if (!wrap) return;

  const item = getItem(STATE.itemType);
  const url  = getItemImageUrl(item);

  if (url) {
    img.src = url;
    img.alt = item.name;
    img.style.display = 'block';
    img.onerror = () => { img.style.display = 'none'; ph.style.display = 'block'; };
    ph.style.display = 'none';
  } else {
    img.style.display = 'none';
    ph.style.display = 'block';
  }
}

function renderQualitySection() {
  const slider  = document.getElementById('input-quality');
  const display = document.getElementById('quality-pct-display');
  const catSel  = document.getElementById('select-catalyst');
  if (!slider) return;

  slider.value = STATE.quality.amount;
  if (display) display.textContent = `${STATE.quality.amount}%`;

  const item = getItem(STATE.itemType);
  const isJewellery = item?.category === 'jewellery';
  if (catSel) {
    catSel.style.display = isJewellery ? 'block' : 'none';
    if (catSel.value !== (STATE.quality.catalystType || '')) {
      catSel.value = STATE.quality.catalystType || '';
    }
  }
}

function renderRuneSection() {
  const section = document.getElementById('rune-section');
  const slots   = document.getElementById('rune-slots');
  const counter = document.getElementById('rune-counter');
  if (!section || !slots) return;

  const maxSockets = getMaxSockets();
  section.style.display = maxSockets > 0 ? 'block' : 'none';
  if (maxSockets === 0) return;

  const filledRunes = STATE.runes.slice(0, maxSockets).filter(Boolean).length;
  if (counter) counter.textContent = `${filledRunes} / ${maxSockets}`;

  slots.innerHTML = '';
  const item = getItem(STATE.itemType);
  const baseType = item?.baseType || item?.id || '';

  for (let i = 0; i < maxSockets; i++) {
    const currentRune = STATE.runes[i] || null;
    const wrapDiv = document.createElement('div');
    wrapDiv.className = 'mod-slot rune-slot';

    const idx = document.createElement('span');
    idx.className = 'mod-slot-index';
    idx.textContent = i + 1;

    const sel = document.createElement('select');
    sel.dataset.runeIndex = i;
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = t('empty.rune');
    sel.appendChild(emptyOpt);

    // Filter runes applicable to this item base type
    DATA.runes.filter(r => r.applicableBaseTypes.includes(baseType)).forEach(rune => {
      const opt = document.createElement('option');
      opt.value = rune.id;
      const effectKey = STATE.lang === 'en' ? rune.effectEn : rune.effect;
      opt.textContent = `${rune.name} — ${effectKey}`;
      if (currentRune === rune.id) opt.selected = true;
      sel.appendChild(opt);
    });

    if (currentRune) sel.classList.add('has-value');

    sel.addEventListener('change', e => {
      STATE.runes[i] = e.target.value || null;
      renderRuneSection();
      renderItemCard();
    });

    wrapDiv.appendChild(idx);
    wrapDiv.appendChild(sel);
    slots.appendChild(wrapDiv);
  }
}

function renderItemCard() {
  const card = document.getElementById('item-card');
  const nameEl = document.getElementById('item-card-name');
  const typeEl = document.getElementById('item-card-type');
  const sep    = document.getElementById('item-card-separator');
  const modsEl = document.getElementById('item-card-mods');

  card.className = `item-card rarity-${STATE.rarity}`;

  const item = getItem(STATE.itemType);
  if (!item) {
    nameEl.textContent = 'Nenhum item selecionado';
    typeEl.textContent = '';
    sep.style.display = 'none';
    modsEl.innerHTML = '';
    return;
  }

  nameEl.textContent = `${item.name} [ilvl ${STATE.ilvl}]`;
  typeEl.textContent = rarityLabel(STATE.rarity);
  sep.style.display = 'block';

  modsEl.innerHTML = '';

  // Quality line
  if (STATE.quality.amount > 0) {
    const qDiv = document.createElement('div');
    qDiv.className = 'item-card-quality';
    const catalyst = STATE.quality.catalystType
      ? ` (${STATE.quality.catalystType})`
      : '';
    qDiv.textContent = `Qualidade: ${STATE.quality.amount}%${catalyst}`;
    modsEl.appendChild(qDiv);
  }

  // Implicit
  if (item.implicit) {
    const implDiv = document.createElement('div');
    implDiv.className = 'item-card-implicit';
    implDiv.textContent = item.implicit;
    modsEl.appendChild(implDiv);
    const implSep = document.createElement('div');
    implSep.className = 'item-card-implicit-sep';
    modsEl.appendChild(implSep);
  }

  const allSlots = [
    ...STATE.prefixes.map(s => s ? { slot: s, type: 'prefix' } : null),
    ...STATE.suffixes.map(s => s ? { slot: s, type: 'suffix' } : null),
  ].filter(Boolean);

  if (!allSlots.length) {
    const noMods = document.createElement('span');
    noMods.style.cssText = 'font-size:0.75rem;color:var(--text-muted);font-style:italic';
    noMods.textContent = 'Sem afixos';
    modsEl.appendChild(noMods);
    return;
  }

  allSlots.forEach(({ slot, type }) => {
    const mod = getMod(slot.id);
    if (!mod) return;
    const isDesired = STATE.desiredMods.includes(slot.id);
    const div = document.createElement('div');
    div.className = `item-card-mod-entry is-${type}${isDesired ? ' is-desired' : ''}`;
    const tierTag = getTierLabelForSlot(mod, slot);
    div.innerHTML = `${formatModValue(mod, slot)} <span class="mod-tier-tag">[${tierTag}]</span>`;
    modsEl.appendChild(div);
  });

  // Runes in card
  const maxSockets = getMaxSockets();
  const filledRunes = STATE.runes.slice(0, maxSockets).filter(Boolean);
  if (maxSockets > 0) {
    const runeSep = document.createElement('div');
    runeSep.className = 'item-card-rune-sep';
    modsEl.appendChild(runeSep);

    // Socket dots indicator
    const dotsRow = document.createElement('div');
    dotsRow.className = 'socket-dots';
    for (let i = 0; i < maxSockets; i++) {
      const dot = document.createElement('div');
      dot.className = `socket-dot${STATE.runes[i] ? ' filled' : ''}`;
      dotsRow.appendChild(dot);
    }
    modsEl.appendChild(dotsRow);

    filledRunes.forEach(runeId => {
      const rune = getRune(runeId);
      if (!rune) return;
      const div = document.createElement('div');
      div.className = 'item-card-rune';
      const effectKey = STATE.lang === 'en' ? rune.effectEn : rune.effect;
      div.textContent = `[${rune.name}] ${effectKey.replace('#', rune.value).replace('#', rune.value2 || '')}`;
      modsEl.appendChild(div);
    });

    if (!filledRunes.length) {
      const emptyRune = document.createElement('span');
      emptyRune.style.cssText = 'font-size:0.68rem;color:var(--text-hint);font-style:italic';
      emptyRune.textContent = `${maxSockets} encaixe(s) disponível(is)`;
      modsEl.appendChild(emptyRune);
    }
  }
}

function renderModSlots(type) {
  const containerId = type === 'prefix' ? 'prefix-slots' : 'suffix-slots';
  const counterId   = type === 'prefix' ? 'prefix-counter' : 'suffix-counter';
  const container   = document.getElementById(containerId);
  const counter     = document.getElementById(counterId);
  const slots       = type === 'prefix' ? STATE.prefixes : STATE.suffixes;
  const maxSlots    = getMaxSlots()[type];

  counter.textContent = `${countFilled(slots)} / ${maxSlots}`;
  container.innerHTML = '';

  for (let i = 0; i < maxSlots; i++) {
    const currentSlot = slots[i];

    // Build pool for this dropdown
    const usedGroups = slots
      .filter((s, idx) => s && idx !== i)
      .map(s => getMod(s?.id)?.group)
      .filter(Boolean);

    const pool = getPoolForType(type, usedGroups);
    pool.sort((a, b) => a.displayName.localeCompare(b.displayName));

    const wrapDiv = document.createElement('div');
    wrapDiv.className = 'mod-slot';

    const indexSpan = document.createElement('span');
    indexSpan.className = 'mod-slot-index';
    indexSpan.textContent = i + 1;

    const sel = document.createElement('select');
    sel.dataset.slotType = type;
    sel.dataset.slotIndex = i;

    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = '— Vazio —';
    sel.appendChild(emptyOpt);

    // Each mod → optgroup, each tier → option (value = "modId|tierNum")
    pool.forEach(mod => {
      const validTiers = mod.tiers.filter(t => STATE.ilvl >= t.minIlvl);
      if (!validTiers.length) return;

      const group = document.createElement('optgroup');
      group.label = mod.displayName.replace(/#/g, '…');

      validTiers.forEach(tier => {
        const opt = document.createElement('option');
        opt.value = `${mod.id}|${tier.tier}`;
        const valRange = mod.hasTwoValues
          ? `(${tier.minVal}-${tier.maxVal}) a (${tier.minVal2}-${tier.maxVal2})`
          : `${tier.minVal}–${tier.maxVal}`;
        opt.textContent = `${tier.label}  ${valRange}`;
        if (currentSlot?.id === mod.id && currentSlot?.tier === tier.tier) opt.selected = true;
        group.appendChild(opt);
      });

      sel.appendChild(group);
    });

    // Show currently selected mod if outside pool
    if (currentSlot && !pool.find(m => m.id === currentSlot.id)) {
      const mod = getMod(currentSlot.id);
      if (mod) {
        const t = mod.tiers.find(x => x.tier === currentSlot.tier) || mod.tiers[0];
        const opt = document.createElement('option');
        opt.value = `${mod.id}|${t.tier}`;
        opt.textContent = `${mod.displayName} [${t.label}] [fora do pool atual]`;
        opt.selected = true;
        sel.appendChild(opt);
      }
    }

    if (currentSlot) {
      sel.classList.add('has-value');
      if (STATE.desiredMods.includes(currentSlot.id)) sel.classList.add('is-desired');
    }

    sel.addEventListener('change', e => {
      const rawVal = e.target.value || null;
      const slotArr = type === 'prefix' ? STATE.prefixes : STATE.suffixes;
      if (rawVal) {
        const [modId, tierStr] = rawVal.split('|');
        const mod  = getMod(modId);
        const tierNum = parseInt(tierStr, 10);
        const tier = mod.tiers.find(t => t.tier === tierNum)
                  || mod.tiers.filter(t => STATE.ilvl >= t.minIlvl)[0]
                  || mod.tiers[mod.tiers.length - 1];
        slotArr[i] = {
          id:     modId,
          tier:   tier.tier,
          value:  randInt(tier.minVal, tier.maxVal),
          value2: mod.hasTwoValues ? randInt(tier.minVal2, tier.maxVal2) : null,
        };
      } else {
        slotArr[i] = null;
        compactSlots();
      }
      renderAll();
    });

    wrapDiv.appendChild(indexSpan);
    wrapDiv.appendChild(sel);
    container.appendChild(wrapDiv);
  }

  if (maxSlots === 0) {
    container.innerHTML = '<p class="hint-text">Selecione uma raridade com slots disponíveis</p>';
  }
}

// ============================================================
// RENDER — CRAFT PANEL (CENTER)
// ============================================================
function renderCraftPanel() {
  renderCurrencyGrid();
  renderCurrencyInfo();
  renderApplyButton();
  renderEssenceSelect();
  renderHistory();
}

function renderCurrencyGrid() {
  const grid = document.getElementById('currency-grid');
  const activeCat = STATE.currencyCategory;
  const filtered = DATA.currency.filter(c => (c.category || 'standard') === activeCat);

  // Update category tab active state
  document.querySelectorAll('.cat-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === activeCat);
  });

  grid.innerHTML = '';
  filtered.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'currency-btn';
    btn.dataset.currencyId = c.id;
    if (!c.allowedRarities.includes(STATE.rarity)) btn.classList.add('disabled-currency');
    if (STATE.selectedCurrency === c.id) btn.classList.add('selected');

    const sym = document.createElement('div');
    sym.className = 'currency-symbol';
    if (c.cdnPath) {
      const baseUrl = c.cdnBase || CDN_POE2;
      const imgEl = document.createElement('img');
      imgEl.src = baseUrl + c.cdnPath;
      imgEl.alt = c.shortName;
      imgEl.className = 'currency-img';
      imgEl.onerror = () => {
        imgEl.style.display = 'none';
        const fb = document.createElement('span');
        fb.className = 'currency-img-fallback';
        fb.style.background = c.color;
        fb.textContent = c.symbol;
        sym.appendChild(fb);
      };
      sym.style.background = 'transparent';
      sym.appendChild(imgEl);
    } else {
      sym.style.background = c.color;
      sym.textContent = c.symbol;
    }

    const name = document.createElement('span');
    name.className = 'currency-name';
    name.textContent = c.shortName;

    btn.appendChild(sym);
    btn.appendChild(name);
    btn.addEventListener('click', () => {
      STATE.selectedCurrency = STATE.selectedCurrency === c.id ? null : c.id;
      renderCraftPanel();
    });
    grid.appendChild(btn);
  });
}

function renderCurrencyInfo() {
  const box = document.getElementById('currency-info-box');
  const c = getCurrency(STATE.selectedCurrency);
  if (!c) {
    box.innerHTML = '<p class="hint-text">Selecione uma moeda para ver os detalhes</p>';
    return;
  }
  const canUse = c.allowedRarities.includes(STATE.rarity);
  const allowedText = c.allowedRarities.map(rarityLabel).join(', ');
  box.innerHTML = `
    <div class="currency-info-name" style="color:${c.color}">${c.name}</div>
    <div class="currency-info-desc">${c.description}</div>
    <span class="currency-info-restriction ${canUse ? 'ok' : 'fail'}">
      ${canUse ? '✓' : '✗'} Requer item: ${allowedText}
    </span>
  `;
}

function renderApplyButton() {
  const btn = document.getElementById('btn-apply');
  const c   = getCurrency(STATE.selectedCurrency);
  const canApply = c && c.allowedRarities.includes(STATE.rarity) && !!STATE.itemType;
  btn.disabled = !canApply;
}

function renderEssenceSelect() {
  const sel  = document.getElementById('select-essence');
  const info = document.getElementById('essence-info-box');
  const btn  = document.getElementById('btn-apply-essence');

  // Rebuild options only when needed
  sel.innerHTML = '<option value="">— Nenhuma Essência —</option>';
  const baseType = getBaseType();
  DATA.essences.forEach(e => {
    const available = STATE.itemType && e.guaranteedByItemType[baseType];
    if (!STATE.itemType || available) {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = e.name;
      if (STATE.selectedEssence === e.id) opt.selected = true;
      sel.appendChild(opt);
    }
  });

  const ess = getEssence(STATE.selectedEssence);
  if (!ess || !STATE.itemType) {
    info.textContent = '';
    btn.disabled = true;
    return;
  }

  const g = ess.guaranteedByItemType[baseType];
  if (g) {
    const mod = getMod(g.modId);
    info.textContent = `Garante: ${mod?.displayName || g.modId} (T${g.tier})`;
  } else {
    info.textContent = `Não disponível para ${getItem(STATE.itemType)?.name}`;
  }

  btn.disabled = !(STATE.rarity === 'normal' && STATE.itemType && ess && ess.guaranteedByItemType[baseType]);
}

function renderHistory() {
  const undoBtn = document.getElementById('btn-undo');
  undoBtn.disabled = STATE.history.length === 0;

  // Spent currency tags
  const spentEl = document.getElementById('currency-spent');
  spentEl.innerHTML = '';
  Object.entries(STATE.currencySpent).forEach(([id, count]) => {
    const c = getCurrency(id) || getEssence(id);
    if (!c || count === 0) return;
    const tag = document.createElement('span');
    tag.className = 'spent-tag';
    tag.textContent = `${c.shortName || c.name}: ${count}x`;
    spentEl.appendChild(tag);
  });

  const listEl = document.getElementById('history-list');
  listEl.innerHTML = '';
  if (!STATE.history.length) {
    listEl.innerHTML = '<p class="hint-text">Nenhuma ação ainda</p>';
    return;
  }
  STATE.history.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = `history-entry${i === STATE.history.length - 1 ? ' latest' : ''}`;
    div.innerHTML = `<span class="h-number">${i + 1}</span><span class="h-action">${entry.label}</span>`;
    listEl.appendChild(div);
  });
}

// ============================================================
// RENDER — RESULTS PANEL (RIGHT)
// ============================================================
function renderResultsPanel() {
  renderDesiredMods();
  renderCraftPaths();
  renderProbabilityList();
  renderSavedBuilds();
}

function renderDesiredMods() {
  const listEl = document.getElementById('desired-list');
  listEl.innerHTML = '';

  if (!STATE.desiredMods.length) {
    listEl.innerHTML = '<p class="hint-text">Nenhum afixo desejado definido</p>';
  } else {
    STATE.desiredMods.forEach(id => {
      const mod = getMod(id);
      if (!mod) return;
      const entry = document.createElement('div');
      entry.className = 'desired-entry';
      entry.innerHTML = `
        <span class="desired-type-tag ${mod.type === 'prefix' ? 'prefix-label' : 'suffix-label'}">${mod.type}</span>
        <span class="desired-name">${mod.displayName}</span>
        <button class="btn-remove-desired" data-id="${id}" title="Remover">×</button>
      `;
      entry.querySelector('.btn-remove-desired').addEventListener('click', () => {
        STATE.desiredMods = STATE.desiredMods.filter(x => x !== id);
        renderResultsPanel();
      });
      listEl.appendChild(entry);
    });
  }

  // Rebuild "add desired" dropdown
  const addRow    = document.getElementById('desired-add-row');
  const addSelect = document.getElementById('select-add-desired');
  addSelect.innerHTML = '<option value="">— Selecionar afixo —</option>';

  if (STATE.itemType) {
    const baseType = getBaseType();
    const all = DATA.mods.filter(m =>
      m.itemTypes.includes(baseType) &&
      m.tiers.some(t => STATE.ilvl >= t.minIlvl) &&
      !STATE.desiredMods.includes(m.id)
    );
    all.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'prefix' ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
    all.forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      opt.textContent = `[${mod.type === 'prefix' ? 'PRE' : 'SUF'}] ${mod.displayName}`;
      addSelect.appendChild(opt);
    });
  }

  // Show/hide add row
  const showAdd = addRow.style.display !== 'none';
  if (showAdd) addRow.style.display = STATE.itemType ? 'block' : 'none';
}

function renderCraftPaths() {
  const content = document.getElementById('craft-paths-content');
  const paths = generateAllCraftPaths();

  if (!paths) {
    content.innerHTML = '<p class="hint-text">Selecione afixos desejados para ver as rotas</p>';
    return;
  }

  content.innerHTML = '';
  paths.forEach((path, idx) => {
    const card = document.createElement('div');
    card.className = `craft-path-card${idx === 0 ? ' expanded' : ''}`;

    const header = document.createElement('div');
    header.className = 'craft-path-header';
    header.innerHTML = `
      <div class="craft-path-title">
        <span class="craft-path-badge" style="background:${path.badgeColor}">${path.badge}</span>
        <strong>${path.name}</strong>
      </div>
      <div class="craft-path-meta">
        <span class="craft-path-cost">${path.costLabel}</span>
        <span class="craft-path-toggle">${idx === 0 ? '▲' : '▼'}</span>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'craft-path-body';
    if (idx !== 0) body.style.display = 'none';

    path.steps.forEach(s => {
      const div = document.createElement('div');
      div.className = `craft-step ${s.type}`;
      div.innerHTML = `
        <div class="craft-step-num">${s.num}</div>
        <div>
          <div class="craft-step-text">${s.text}</div>
          ${s.subtext ? `<div class="craft-step-prob">${s.subtext}</div>` : ''}
        </div>
      `;
      body.appendChild(div);
    });

    header.addEventListener('click', () => {
      const expanded = card.classList.contains('expanded');
      // Fechar todos
      content.querySelectorAll('.craft-path-card').forEach(c => {
        c.classList.remove('expanded');
        c.querySelector('.craft-path-body').style.display = 'none';
        c.querySelector('.craft-path-toggle').textContent = '▼';
      });
      if (!expanded) {
        card.classList.add('expanded');
        body.style.display = 'block';
        header.querySelector('.craft-path-toggle').textContent = '▲';
      }
    });

    card.appendChild(header);
    card.appendChild(body);
    content.appendChild(card);
  });
}

function renderProbabilityList() {
  const list  = document.getElementById('probability-list');
  const tab   = STATE.activeTab;

  if (!STATE.itemType) {
    list.innerHTML = '<p class="hint-text">Selecione um tipo de item para ver o pool de afixos</p>';
    return;
  }

  // Show full pool (without excluding current mods), highlight present/desired
  const fullPool = getPoolForType(tab, []);
  const withProbs = calculateProbabilities(fullPool);
  const presentIds = [...STATE.prefixes, ...STATE.suffixes].filter(Boolean).map(s => s.id);

  list.innerHTML = '';
  withProbs.forEach(mod => {
    const isPresent = presentIds.includes(mod.id);
    const isDesired = STATE.desiredMods.includes(mod.id);
    const range = getModRangeForIlvl(mod, STATE.ilvl) || '';

    const entry = document.createElement('div');
    entry.className = `prob-entry${isDesired ? ' is-desired' : ''}${isPresent ? ' is-present' : ''}`;

    const pct = mod.probability;
    entry.innerHTML = `
      <div class="prob-entry-name">${mod.displayName}</div>
      <div class="prob-entry-range">${range}</div>
      <div class="prob-entry-pct">${pct.toFixed(1)}%</div>
      <div class="prob-bar-wrap" style="grid-row:3"><div class="prob-bar" style="width:${Math.min(pct * 3, 100)}%"></div></div>
    `;
    list.appendChild(entry);
  });

  if (!withProbs.length) {
    list.innerHTML = '<p class="hint-text">Nenhum afixo disponível para o ilvl atual</p>';
  }
}

function renderSavedBuilds() {
  const container = document.getElementById('saved-builds-list');
  const builds    = loadBuildsFromStorage();

  container.innerHTML = '';
  if (!builds.length) {
    container.innerHTML = '<p class="hint-text">Nenhuma receita salva</p>';
    return;
  }

  builds.forEach((b, i) => {
    const entry = document.createElement('div');
    entry.className = 'saved-build-entry';
    entry.innerHTML = `
      <span class="saved-build-name" title="${b.name}">${b.name}</span>
      <span class="saved-build-info">${b.itemType || '?'} ${b.date}</span>
      <button class="btn-load-build"   data-index="${i}">Carregar</button>
      <button class="btn-delete-build" data-index="${i}">✕</button>
    `;
    entry.querySelector('.btn-load-build').addEventListener('click',   () => loadBuild(i));
    entry.querySelector('.btn-delete-build').addEventListener('click', () => deleteBuild(i));
    container.appendChild(entry);
  });
}

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  renderItemPanel();
  renderCraftPanel();
  renderResultsPanel();
}

// ============================================================
// INITIALIZATION
// ============================================================
async function loadAllData() {
  try {
    const [items, mods, currency, essences, runes] = await Promise.all([
      fetch('data/items.json').then(r => r.json()),
      fetch('data/mods.json').then(r => r.json()),
      fetch('data/currency.json').then(r => r.json()),
      fetch('data/essences.json').then(r => r.json()),
      fetch('data/runes.json').then(r => r.json()),
    ]);
    DATA.items    = items;
    DATA.mods     = mods;
    DATA.currency = currency;
    DATA.essences = essences;
    DATA.runes    = runes;
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showNotification('Erro ao carregar dados JSON. Use um servidor local (ex: Live Server).', 'danger');
    throw err;
  }
}

function populateItemTypeSelect() {
  // Also populate hidden <select> for backward compat
  const sel = document.getElementById('select-item-type');

  const baseTypeLabels = {
    ring:            'Anéis',     amulet:      'Amuletos',
    belt:            'Cintos',    helmet:      'Capacetes',
    gloves:          'Luvas',     boots:       'Botas',
    body_armour:     'Peitorais', shield:      'Escudos',
    bow:             'Arcos',     one_hand_weapon: 'Armas 1M',
    two_hand_weapon: 'Armas 2M',  wand:        'Varinhas',
    staff:           'Cajados',
  };
  const baseTypeOrder = ['ring','amulet','belt','helmet','gloves','boots','body_armour','shield','bow','one_hand_weapon','two_hand_weapon','wand','staff'];

  const grouped = {};
  DATA.items.forEach(item => {
    const key = item.baseType || item.id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  // Populate hidden select
  baseTypeOrder.forEach(bt => {
    if (!grouped[bt]) return;
    const optGroup = document.createElement('optgroup');
    optGroup.label = baseTypeLabels[bt] || bt;
    grouped[bt].forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      optGroup.appendChild(opt);
    });
    sel.appendChild(optGroup);
  });

  // Init visual picker
  initItemPicker(grouped, baseTypeOrder, baseTypeLabels);
}

function initItemPicker(grouped, order, labels) {
  const searchInput = document.getElementById('input-item-search');
  const dropdown    = document.getElementById('item-picker-dropdown');
  if (!searchInput || !dropdown) return;

  let highlightIndex = -1;
  let visibleOptions = [];

  function getItemUrl(item) { return getItemImageUrl(item); }

  function renderDropdown(query = '') {
    dropdown.innerHTML = '';
    visibleOptions = [];
    const q = query.toLowerCase().trim();

    order.forEach(bt => {
      const items = (grouped[bt] || []).filter(item =>
        !q || item.name.toLowerCase().includes(q)
      );
      if (!items.length) return;

      const groupLabel = document.createElement('div');
      groupLabel.className = 'item-picker-group-label';
      groupLabel.textContent = labels[bt] || bt;
      dropdown.appendChild(groupLabel);

      items.forEach(item => {
        const opt = document.createElement('div');
        opt.className = `item-picker-option${STATE.itemType === item.id ? ' selected' : ''}`;
        opt.dataset.itemId = item.id;

        const imgWrap = document.createElement('div');
        imgWrap.className = 'item-picker-img-wrap';

        const url = getItemUrl(item);
        if (url) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = item.name;
          img.className = 'item-picker-img';
          img.onerror = () => { img.style.display='none'; ph.style.display='block'; };
          const ph = document.createElement('span');
          ph.className = 'item-picker-img-placeholder';
          ph.textContent = '◈';
          ph.style.display = 'none';
          imgWrap.appendChild(img);
          imgWrap.appendChild(ph);
        } else {
          const ph = document.createElement('span');
          ph.className = 'item-picker-img-placeholder';
          ph.textContent = '◈';
          imgWrap.appendChild(ph);
        }

        const nameEl = document.createElement('span');
        nameEl.className = 'item-picker-name';
        nameEl.textContent = item.name;

        opt.appendChild(imgWrap);
        opt.appendChild(nameEl);

        if (item.implicit) {
          const imp = document.createElement('span');
          imp.className = 'item-picker-implicit';
          imp.textContent = item.implicit;
          opt.appendChild(imp);
        }

        opt.addEventListener('mousedown', e => {
          e.preventDefault();
          selectItem(item);
        });

        dropdown.appendChild(opt);
        visibleOptions.push({ el: opt, item });
      });
    });

    if (!visibleOptions.length) {
      const noRes = document.createElement('div');
      noRes.className = 'item-picker-no-results';
      noRes.textContent = 'Nenhum item encontrado';
      dropdown.appendChild(noRes);
    }

    highlightIndex = -1;
    dropdown.style.display = 'block';
  }

  function selectItem(item) {
    STATE.itemType = item.id;
    STATE.prefixes = [null,null,null];
    STATE.suffixes = [null,null,null];
    STATE.runes    = [null,null,null,null];
    STATE.selectedEssence = null;
    searchInput.value = item.name;
    document.getElementById('select-item-type').value = item.id;
    closeDropdown();
    renderAll();
  }

  function closeDropdown() {
    dropdown.style.display = 'none';
    visibleOptions = [];
    highlightIndex = -1;
  }

  searchInput.addEventListener('focus', () => renderDropdown(searchInput.value));
  searchInput.addEventListener('input', () => renderDropdown(searchInput.value));
  searchInput.addEventListener('blur', () => { setTimeout(closeDropdown, 150); });

  searchInput.addEventListener('keydown', e => {
    if (dropdown.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, visibleOptions.length - 1);
      visibleOptions.forEach((o, i) => o.el.classList.toggle('highlighted', i === highlightIndex));
      visibleOptions[highlightIndex]?.el.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
      visibleOptions.forEach((o, i) => o.el.classList.toggle('highlighted', i === highlightIndex));
      visibleOptions[highlightIndex]?.el.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && visibleOptions[highlightIndex]) {
        selectItem(visibleOptions[highlightIndex].item);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  // Sync search input when item is loaded from build
  window._syncItemPicker = () => {
    const item = getItem(STATE.itemType);
    searchInput.value = item ? item.name : '';
  };
}

function initEventListeners() {
  // Item type — handled by visual picker, but keep select in sync
  document.getElementById('select-item-type').addEventListener('change', e => {
    if (!e.target.value) return; // picker handles selection
    STATE.itemType = e.target.value;
    STATE.prefixes = [null, null, null];
    STATE.suffixes = [null, null, null];
    STATE.runes    = [null, null, null, null];
    STATE.selectedEssence = null;
    renderAll();
  });

  // Item level
  document.getElementById('input-ilvl').addEventListener('change', e => {
    const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
    STATE.ilvl = val;
    e.target.value = val;
    renderAll();
  });

  // Rarity buttons
  document.querySelectorAll('.rarity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newRarity = btn.dataset.rarity;
      if (newRarity === STATE.rarity) return;
      const maxOld = getMaxSlots();
      STATE.rarity = newRarity;
      const maxNew = getMaxSlots();
      // Trim slots if downgrading
      if (maxNew.prefix < maxOld.prefix) {
        STATE.prefixes = [...STATE.prefixes.filter(Boolean).slice(0, maxNew.prefix), null, null, null].slice(0, 3);
      }
      if (maxNew.suffix < maxOld.suffix) {
        STATE.suffixes = [...STATE.suffixes.filter(Boolean).slice(0, maxNew.suffix), null, null, null].slice(0, 3);
      }
      renderAll();
    });
  });

  // Clear item
  document.getElementById('btn-clear-item').addEventListener('click', () => {
    STATE.itemType   = '';
    STATE.rarity     = 'normal';
    STATE.ilvl       = 84;
    STATE.prefixes   = [null, null, null];
    STATE.suffixes   = [null, null, null];
    STATE.runes      = [null, null, null, null];
    STATE.desiredMods = [];
    STATE.quality    = { amount: 0, catalystType: null };
    document.getElementById('select-item-type').value = '';
    const si = document.getElementById('input-item-search');
    if (si) si.value = '';
    renderAll();
  });

  // Apply currency
  document.getElementById('btn-apply').addEventListener('click', () => {
    if (STATE.selectedCurrency) applyCurrency(STATE.selectedCurrency);
  });

  // Undo
  document.getElementById('btn-undo').addEventListener('click', undoLastAction);

  // Essence select
  document.getElementById('select-essence').addEventListener('change', e => {
    STATE.selectedEssence = e.target.value || null;
    renderEssenceSelect();
  });

  // Apply essence
  document.getElementById('btn-apply-essence').addEventListener('click', () => {
    if (STATE.selectedEssence) applyEssence(STATE.selectedEssence);
  });

  // Add desired mod toggle
  document.getElementById('btn-toggle-desired-add').addEventListener('click', () => {
    const row = document.getElementById('desired-add-row');
    row.style.display = row.style.display === 'none' ? 'block' : 'none';
    if (row.style.display === 'block') renderDesiredMods();
  });

  // Add desired mod select
  document.getElementById('select-add-desired').addEventListener('change', e => {
    const id = e.target.value;
    if (id && !STATE.desiredMods.includes(id)) {
      STATE.desiredMods.push(id);
      e.target.value = '';
      renderResultsPanel();
    }
  });

  // Currency category tabs
  document.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.currencyCategory = btn.dataset.cat;
      STATE.selectedCurrency = null;
      renderCraftPanel();
    });
  });

  // Probability tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderProbabilityList();
    });
  });

  // Save build
  document.getElementById('btn-save-build').addEventListener('click', () => {
    const name = document.getElementById('input-build-name').value;
    saveBuild(name);
    document.getElementById('input-build-name').value = '';
  });
  document.getElementById('input-build-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-save-build').click();
  });

  // Language toggle
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.lang = btn.dataset.lang;
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b === btn));
      applyI18n();
      renderAll();
    });
  });

  // Quality slider
  const qualitySlider = document.getElementById('input-quality');
  if (qualitySlider) {
    qualitySlider.addEventListener('input', e => {
      STATE.quality.amount = parseInt(e.target.value) || 0;
      const disp = document.getElementById('quality-pct-display');
      if (disp) disp.textContent = `${STATE.quality.amount}%`;
      renderItemCard();
    });
  }

  // Catalyst selector
  const catalystSel = document.getElementById('select-catalyst');
  if (catalystSel) {
    catalystSel.addEventListener('change', e => {
      STATE.quality.catalystType = e.target.value || null;
      renderItemCard();
    });
  }
}

// ============================================================
// ENTRY POINT
// ============================================================
(async () => {
  await loadAllData();
  populateItemTypeSelect();
  initEventListeners();
  applyI18n();
  renderAll();
})();
