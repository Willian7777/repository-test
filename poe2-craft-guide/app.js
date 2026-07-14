/* ============================================================
   POE2 Craft Guide — app.js
   ============================================================ */

'use strict';

// ============================================================
// DATA STORE
// ============================================================
const DATA = { items: [], mods: [], currency: [], essences: [] };

// ============================================================
// APPLICATION STATE
// ============================================================
const STATE = {
  itemType:   '',
  rarity:     'normal',
  ilvl:       84,
  prefixes:   [null, null, null],  // {id, tier, value, value2} | null
  suffixes:   [null, null, null],
  selectedCurrency: null,
  selectedEssence:  null,
  desiredMods:      [],            // array of mod ids
  history:          [],            // array of cloned states
  currencySpent:    {},            // {currencyId: count}
  activeTab:        'prefix',
};

// ============================================================
// UTILITY HELPERS
// ============================================================
const getMod      = id => DATA.mods.find(m => m.id === id);
const getItem     = id => DATA.items.find(i => i.id === id);
const getCurrency = id => DATA.currency.find(c => c.id === id);
const getEssence  = id => DATA.essences.find(e => e.id === id);

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
  return DATA.mods.filter(mod =>
    mod.type === type &&
    mod.itemTypes.includes(STATE.itemType) &&
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
  }

  STATE.currencySpent[currencyId] = (STATE.currencySpent[currencyId] || 0) + 1;
  renderAll();
}

// ============================================================
// ESSENCE ENGINE
// ============================================================
function applyEssence(essenceId) {
  const essence = getEssence(essenceId);
  if (!essence) return;
  if (!STATE.itemType) { showNotification('Selecione um tipo de item primeiro.', 'danger'); return; }

  const guaranteed = essence.guaranteedByItemType[STATE.itemType];
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
// CRAFT PATH GENERATOR
// ============================================================
function generateCraftPath() {
  if (!STATE.itemType || !STATE.desiredMods.length) return null;

  const desired     = STATE.desiredMods.map(getMod).filter(Boolean);
  const desiredPre  = desired.filter(m => m.type === 'prefix');
  const desiredSuf  = desired.filter(m => m.type === 'suffix');

  const currentPre  = STATE.prefixes.filter(Boolean).map(s => getMod(s.id)).filter(Boolean);
  const currentSuf  = STATE.suffixes.filter(Boolean).map(s => getMod(s.id)).filter(Boolean);

  const hasAll = desired.every(m => {
    const arr = m.type === 'prefix' ? STATE.prefixes : STATE.suffixes;
    return arr.some(s => s?.id === m.id);
  });

  const steps = [];
  let stepNum = 1;

  const addStep = (text, type = 'medium', subtext = '') => {
    steps.push({ num: stepNum++, text, type, subtext });
  };

  // Already has all desired mods?
  if (hasAll) {
    addStep('Parabéns! Item já possui todos os afixos desejados.', 'step-high');
    const hasLowValues = desired.some(m => {
      const slot = (m.type === 'prefix' ? STATE.prefixes : STATE.suffixes).find(s => s?.id === m.id);
      if (!slot) return false;
      const tier = m.tiers.find(t => t.tier === slot.tier);
      if (!tier) return false;
      const range = tier.maxVal - tier.minVal;
      return range > 0 && slot.value < tier.minVal + range * 0.6;
    });
    if (hasLowValues) {
      addStep('Valores abaixo do ideal detectados. Use Divine Orb para rerolhar os valores numéricos.', 'step-info',
        'Divine Orb mantém os afixos, apenas rerolha os números dentro do range do tier.');
    }
    return steps;
  }

  // Check essence options
  const essenceOptions = DATA.essences.filter(e => {
    const g = e.guaranteedByItemType[STATE.itemType];
    return g && desired.some(m => m.id === g.modId);
  });

  if (essenceOptions.length) {
    const ess = essenceOptions[0];
    const g = ess.guaranteedByItemType[STATE.itemType];
    const mod = getMod(g.modId);
    addStep(
      `Use <strong>${ess.name}</strong> para garantir "${mod?.displayName}" no item.`,
      'step-high',
      `Essências requerem item Normal. Use Orb of Scouring se necessário antes.`
    );
  }

  // Strategy based on rarity and desired count
  if (STATE.rarity === 'normal') {
    if (desired.length > 2 || desiredPre.length > 1 || desiredSuf.length > 1) {
      addStep(
        'Use <strong>Orb of Alchemy</strong> para criar um item Raro com 4–6 afixos aleatórios.',
        'step-medium',
        `Chance por tentativa de rolar os afixos desejados: ~${estimateCombinedProb(desired)}%`
      );
      addStep(
        'Se os afixos não forem desejados, use <strong>Chaos Orb</strong> para rerolhar tudo.',
        'step-medium',
        'Repita até conseguir a combinação desejada.'
      );
    } else if (desired.length <= 2) {
      addStep(
        'Use <strong>Orb of Transmutation</strong> para criar um item Mágico com 1–2 afixos.',
        'step-medium',
        'O item Mágico pode ter apenas 1 prefix + 1 suffix.'
      );
      if (desired.length === 2) {
        addStep(
          'Se o item ficou com apenas 1 afixo desejado, use <strong>Orb of Augmentation</strong> para adicionar mais 1.',
          'step-info',
          'Augmentation só pode ser usado se houver slot vazio.'
        );
      }
      addStep(
        'Se os afixos não forem os desejados, use <strong>Orb of Alteration</strong> para rerolhar.',
        'step-medium',
        `Chance de acertar por tentativa: ~${estimateCombinedProb(desired)}%`
      );
    }
  } else if (STATE.rarity === 'magic') {
    const matchPre = currentPre.filter(m => desiredPre.some(d => d.id === m.id));
    const matchSuf = currentSuf.filter(m => desiredSuf.some(d => d.id === m.id));

    if (!matchPre.length && !matchSuf.length) {
      addStep('Use <strong>Orb of Alteration</strong> para rerolhar os afixos do item Mágico.', 'step-medium',
        `Chance de acertar por tentativa: ~${estimateCombinedProb(desired)}%`);
    } else {
      const missing = desired.filter(m => {
        const arr = m.type === 'prefix' ? currentPre : currentSuf;
        return !arr.some(c => c.id === m.id);
      });
      if (missing.length > 0) {
        const openPre = 1 - currentPre.length;
        const openSuf = 1 - currentSuf.length;
        const canAug = openPre > 0 || openSuf > 0;
        if (canAug) {
          addStep('Use <strong>Orb of Augmentation</strong> para adicionar o afixo em falta.', 'step-high',
            `Chance de rolar "${missing[0]?.displayName}": ~${estimateSingleProb(missing[0])}%`);
        } else {
          addStep('Use <strong>Regal Orb</strong> para evoluir para Raro e adicionar mais 1 afixo.', 'step-medium');
          addStep('Em seguida, use <strong>Exalted Orb</strong> para completar os afixos restantes.', 'step-info',
            'Exalted Orb adiciona 1 afixo aleatório em slots vazios de itens Raros.');
        }
      }
    }
  } else if (STATE.rarity === 'rare') {
    const matchPre = currentPre.filter(m => desiredPre.some(d => d.id === m.id));
    const matchSuf = currentSuf.filter(m => desiredSuf.some(d => d.id === m.id));
    const allMatch = desired.filter(m => {
      const arr = m.type === 'prefix' ? currentPre : currentSuf;
      return arr.some(c => c.id === m.id);
    });

    if (!allMatch.length) {
      addStep('Use <strong>Chaos Orb</strong> para rerolhar todos os afixos do item Raro.', 'step-medium',
        `Chance de acertar por tentativa: ~${estimateCombinedProb(desired)}%`);
      addStep('Repita os Chaos Orbs até conseguir o máximo de afixos desejados.', 'step-medium');
    } else if (allMatch.length < desired.length) {
      const hasPre = matchPre.length > 0;
      const hasSuf = matchSuf.length > 0;
      const missingItems = desired.filter(m => {
        const arr = m.type === 'prefix' ? currentPre : currentSuf;
        return !arr.some(c => c.id === m.id);
      });
      const missingNames = missingItems.map(m => `"${m.displayName}"`).join(', ');

      const openPre = 3 - currentPre.length;
      const openSuf = 3 - currentSuf.length;

      if (openPre > 0 || openSuf > 0) {
        addStep(`Use <strong>Exalted Orb</strong> para adicionar um afixo em slot vazio.`, 'step-high',
          `Faltam: ${missingNames}`);
        if (missingItems.length > 1 && (openPre + openSuf) >= missingItems.length) {
          addStep('Repita com mais Exalted Orbs para preencher os slots restantes.', 'step-info');
        }
      } else {
        // No open slots — need to Annul
        addStep(
          `<strong>Orb of Annulment</strong>: remova 1 afixo indesejado para abrir um slot.`,
          'step-danger',
          `⚠ RISCO: há ${(currentPre.length + currentSuf.length)} afixos no item, probabilidade de acertar um indesejado: ~${estimateAnnulProb(desired)}%`
        );
        addStep('Se conseguir remover o afixo indesejado, use <strong>Exalted Orb</strong> para adicionar os afixos em falta.', 'step-info');
      }
    }
  }

  if (steps.length === 0) {
    addStep('Continue a aplicar moedas de craft conforme o estado do item.', 'step-info');
  }

  return steps;
}

function estimateSingleProb(mod) {
  if (!mod) return 0;
  const pool = calculateProbabilities(getPoolForType(mod.type, []));
  const entry = pool.find(m => m.id === mod.id);
  return entry ? entry.probability.toFixed(1) : '?';
}

function estimateCombinedProb(desired) {
  if (!desired.length) return 0;
  let combined = 1;
  const usedPre = [];
  const usedSuf = [];
  for (const mod of desired) {
    const pool = calculateProbabilities(getPoolForType(mod.type, mod.type === 'prefix' ? usedPre : usedSuf));
    const entry = pool.find(m => m.id === mod.id);
    const prob = entry ? entry.probability / 100 : 0;
    combined *= prob;
    const g = mod.group;
    if (mod.type === 'prefix') usedPre.push(g);
    else usedSuf.push(g);
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

  // Sync ilvl
  document.getElementById('input-ilvl').value = STATE.ilvl;

  // Sync item type select
  const typeSelect = document.getElementById('select-item-type');
  if (typeSelect.value !== STATE.itemType) typeSelect.value = STATE.itemType;

  renderItemCard();
  renderModSlots('prefix');
  renderModSlots('suffix');
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
  const allSlots = [
    ...STATE.prefixes.map(s => s ? { slot: s, type: 'prefix' } : null),
    ...STATE.suffixes.map(s => s ? { slot: s, type: 'suffix' } : null),
  ].filter(Boolean);

  if (!allSlots.length) {
    modsEl.innerHTML = '<span style="font-size:0.75rem;color:var(--text-muted);font-style:italic">Sem afixos</span>';
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

    pool.forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      const range = getModRangeForIlvl(mod, STATE.ilvl);
      opt.textContent = `${mod.displayName}${range ? ` (${range})` : ''}`;
      if (currentSlot?.id === mod.id) opt.selected = true;
      sel.appendChild(opt);
    });

    // Also show currently selected mod even if not in pool (e.g. after item type change)
    if (currentSlot && !pool.find(m => m.id === currentSlot.id)) {
      const mod = getMod(currentSlot.id);
      if (mod) {
        const opt = document.createElement('option');
        opt.value = mod.id;
        opt.textContent = `${mod.displayName} [fora do pool atual]`;
        opt.selected = true;
        sel.appendChild(opt);
      }
    }

    if (currentSlot) {
      sel.classList.add('has-value');
      if (STATE.desiredMods.includes(currentSlot.id)) sel.classList.add('is-desired');
    }

    sel.addEventListener('change', e => {
      const newId = e.target.value || null;
      const slotArr = type === 'prefix' ? STATE.prefixes : STATE.suffixes;
      if (newId) {
        const mod = getMod(newId);
        const tier = mod.tiers.filter(t => STATE.ilvl >= t.minIlvl)[0] || mod.tiers[mod.tiers.length - 1];
        slotArr[i] = {
          id:     newId,
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
  if (grid.children.length === DATA.currency.length) {
    // Just update disabled states
    DATA.currency.forEach(c => {
      const btn = grid.querySelector(`[data-currency-id="${c.id}"]`);
      if (!btn) return;
      const disabled = !c.allowedRarities.includes(STATE.rarity);
      btn.classList.toggle('disabled-currency', disabled);
      btn.classList.toggle('selected', STATE.selectedCurrency === c.id);
    });
    return;
  }

  grid.innerHTML = '';
  DATA.currency.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'currency-btn';
    btn.dataset.currencyId = c.id;
    if (!c.allowedRarities.includes(STATE.rarity)) btn.classList.add('disabled-currency');
    if (STATE.selectedCurrency === c.id) btn.classList.add('selected');

    const sym = document.createElement('div');
    sym.className = 'currency-symbol';
    sym.style.background = c.color;
    sym.textContent = c.symbol;

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
  DATA.essences.forEach(e => {
    const available = STATE.itemType && e.guaranteedByItemType[STATE.itemType];
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

  const g = ess.guaranteedByItemType[STATE.itemType];
  if (g) {
    const mod = getMod(g.modId);
    info.textContent = `Garante: ${mod?.displayName || g.modId} (T${g.tier})`;
  } else {
    info.textContent = `Não disponível para ${getItem(STATE.itemType)?.name}`;
  }

  btn.disabled = !(STATE.rarity === 'normal' && STATE.itemType && ess && ess.guaranteedByItemType[STATE.itemType]);
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
  renderCraftPath();
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
    const all = DATA.mods.filter(m =>
      m.itemTypes.includes(STATE.itemType) &&
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

function renderCraftPath() {
  const content = document.getElementById('craft-path-content');
  const steps = generateCraftPath();

  if (!steps) {
    content.innerHTML = '<p class="hint-text">Selecione afixos desejados para ver sugestões</p>';
    return;
  }

  content.innerHTML = '';
  steps.forEach(s => {
    const div = document.createElement('div');
    div.className = `craft-step ${s.type}`;
    div.innerHTML = `
      <div class="craft-step-num">${s.num}</div>
      <div>
        <div class="craft-step-text">${s.text}</div>
        ${s.subtext ? `<div class="craft-step-prob">${s.subtext}</div>` : ''}
      </div>
    `;
    content.appendChild(div);
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
    const [items, mods, currency, essences] = await Promise.all([
      fetch('data/items.json').then(r => r.json()),
      fetch('data/mods.json').then(r => r.json()),
      fetch('data/currency.json').then(r => r.json()),
      fetch('data/essences.json').then(r => r.json()),
    ]);
    DATA.items    = items;
    DATA.mods     = mods;
    DATA.currency = currency;
    DATA.essences = essences;
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showNotification('Erro ao carregar dados JSON. Use um servidor local (ex: Live Server).', 'danger');
    throw err;
  }
}

function populateItemTypeSelect() {
  const sel = document.getElementById('select-item-type');
  const groups = { jewellery: 'Joias', armour: 'Armaduras', weapon: 'Armas' };
  const grouped = {};
  DATA.items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });
  Object.entries(groups).forEach(([cat, label]) => {
    if (!grouped[cat]) return;
    const optGroup = document.createElement('optgroup');
    optGroup.label = label;
    grouped[cat].forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      optGroup.appendChild(opt);
    });
    sel.appendChild(optGroup);
  });
}

function initEventListeners() {
  // Item type
  document.getElementById('select-item-type').addEventListener('change', e => {
    STATE.itemType = e.target.value;
    STATE.prefixes = [null, null, null];
    STATE.suffixes = [null, null, null];
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
    STATE.desiredMods = [];
    document.getElementById('select-item-type').value = '';
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
}

// ============================================================
// ENTRY POINT
// ============================================================
(async () => {
  await loadAllData();
  populateItemTypeSelect();
  initEventListeners();
  renderAll();
})();
