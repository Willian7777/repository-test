/**
 * ════════════════════════════════════════════════════════
 *  CONTROLE FINANCEIRO — WILL & SÁ
 *  Google Apps Script — Formulário de Lançamentos
 * ════════════════════════════════════════════════════════
 *
 *  COMO INSTALAR:
 *  1. Importe o arquivo .xlsx no Google Drive
 *  2. Abra como Google Sheets
 *  3. Vá em: Extensões → Apps Script
 *  4. Apague tudo que estiver no editor
 *  5. Cole TODO o conteúdo deste arquivo
 *  6. Clique em 💾 Salvar (ou Ctrl+S)
 *  7. Feche a aba do Apps Script
 *  8. Recarregue a planilha (F5)
 *  9. Um novo menu "💰 Controle" aparece na barra de menus
 *  10. Clique em 💰 Controle → 📝 Novo Lançamento
 *
 *  Na primeira vez, o Google vai pedir autorização — clique em
 *  "Permitir" para que o script acesse a planilha.
 */

// ═══ Menu customizado ═══
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💰 Controle')
    .addItem('📝 Novo Lançamento', 'abrirFormulario')
    .addSeparator()
    .addItem('📊 Visão do Período (C1 vs Mês)', 'mostrarResumo')
    .addItem('📅 Resumo Anual', 'mostrarResumoAnual')
    .addItem('📈 Criar Gráficos no Dashboard', 'criarGraficos')
    .addSeparator()
    .addItem('✈️ Planejamento de Viagem', 'abrirPlanejamentoViagem')
    .addItem('�️ Dicas do Destino', 'verDicasDestino')
    .addItem('�🛒 Compras & Metas', 'abrirComprasMetas')
    .addSeparator()
    .addItem('🗂️ Gerenciar Categorias', 'gerenciarCategorias')
    .addItem('🗑️ Limpar Lançamentos do Mês', 'resetMes')
    .addSeparator()
    .addItem('🔄 Corrigir Status (migração)', 'corrigirStatus')
    .addItem('🏠 Ir para Dashboard', 'irParaDashboard')
    .addToUi();
}

function irParaDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName('Dashboard');
  if (dash) { ss.setActiveSheet(dash); dash.setActiveCell(dash.getRange('A1')); }
}

function abrirPlanejamentoViagem() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var wv = ss.getSheetByName('Planejamento Viagem');
  if (wv) {
    ss.setActiveSheet(wv);
    wv.setActiveCell(wv.getRange('C4'));
  } else {
    SpreadsheetApp.getUi().alert(
      '⚠️ Aba não encontrada',
      'Importe o arquivo controle-financeiro-final.xlsx atualizado para ter a aba "Planejamento Viagem".',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

function abrirComprasMetas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var wm = ss.getSheetByName('Compras & Metas');
  if (wm) {
    ss.setActiveSheet(wm);
    wm.setActiveCell(wm.getRange('E4'));
  } else {
    SpreadsheetApp.getUi().alert(
      '⚠️ Aba não encontrada',
      'Importe o arquivo controle-financeiro-final.xlsx atualizado para ter a aba "Compras & Metas".',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

// ═══ Dicas do Destino (Nominatim + Overpass + Wikipedia) ═══
function verDicasDestino() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var wv   = ss.getSheetByName('Planejamento Viagem');
  var cidade = '';

  // Tenta ler da célula E5 da aba Planejamento Viagem
  if (wv) {
    cidade = String(wv.getRange('E5').getValue()).trim();
  }

  // Se não encontrou, pede ao usuário
  if (!cidade) {
    var ui   = SpreadsheetApp.getUi();
    var resp = ui.prompt('🗺️ Dicas do Destino',
                         'Informe a cidade de destino (ex: Florianópolis, SC):',
                         ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return;
    cidade = resp.getResponseText().trim();
  }
  if (!cidade) return;

  // Mostrar loading
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:\'Segoe UI\',sans-serif;padding:20px;text-align:center">' +
    '<div style="font-size:40px">🔍</div>' +
    '<p style="color:#555;margin-top:12px">Buscando dicas para <b>' + cidade + '</b>...</p>' +
    '<p style="color:#999;font-size:12px">Aguarde alguns segundos</p></div>'
  ).setWidth(440).setHeight(200).setTitle('Carregando...');
  SpreadsheetApp.getUi().showSidebar(html);

  // Buscar dados
  try {
    var dados = _buscarDicasDestino(cidade);
    _mostrarSidebarDicas(cidade, dados);
  } catch (e) {
    _mostrarSidebarDicas(cidade, null, e.message);
  }
}

function _buscarDicasDestino(cidade) {
  var opts = { muteHttpExceptions: true, headers: { 'User-Agent': 'ControleFinanceiro/1.0' } };

  // 1) Geocode com Nominatim
  var geoUrl  = 'https://nominatim.openstreetmap.org/search?q=' +
                encodeURIComponent(cidade + ', Brasil') +
                '&format=json&limit=1&addressdetails=1';
  var geoResp = UrlFetchApp.fetch(geoUrl, opts);
  var geoData = JSON.parse(geoResp.getContentText());
  if (!geoData || geoData.length === 0) throw new Error('Cidade não encontrada: ' + cidade);

  var lat      = parseFloat(geoData[0].lat);
  var lon      = parseFloat(geoData[0].lon);
  var nomeCidade = geoData[0].display_name.split(',')[0];

  // 2) Wikipedia (resumo em PT)
  var wikiUrl  = 'https://pt.wikipedia.org/api/rest_v1/page/summary/' +
                 encodeURIComponent(nomeCidade);
  var wikiResp = UrlFetchApp.fetch(wikiUrl, opts);
  var wikiText = '';
  if (wikiResp.getResponseCode() === 200) {
    var wikiData = JSON.parse(wikiResp.getContentText());
    wikiText = wikiData.extract ? wikiData.extract.substring(0, 350) + '...' : '';
  }

  // 3) Overpass API — hotéis, restaurantes, atrações num raio de 10km
  var radius = 10000; // 10km
  var overpassQuery =
    '[out:json][timeout:20];' +
    '(' +
      'node["tourism"~"hotel|hostel|guest_house|motel"](around:' + radius + ',' + lat + ',' + lon + ');' +
      'node["amenity"="restaurant"](around:' + radius + ',' + lat + ',' + lon + ');' +
      'node["tourism"~"attraction|museum|viewpoint|theme_park|zoo"](around:' + radius + ',' + lat + ',' + lon + ');' +
      'node["amenity"~"cafe|bar"](around:' + radius + ',' + lat + ',' + lon + ');' +
    ');' +
    'out body 60;';

  var overpassUrl  = 'https://overpass-api.de/api/interpreter';
  var overpassResp = UrlFetchApp.fetch(overpassUrl, {
    method: 'post', payload: 'data=' + encodeURIComponent(overpassQuery),
    muteHttpExceptions: true
  });

  var hoteis = [], restaurantes = [], atracoes = [];

  if (overpassResp.getResponseCode() === 200) {
    var elements = JSON.parse(overpassResp.getContentText()).elements || [];

    elements.forEach(function(el) {
      var tags = el.tags || {};
      var nome = tags.name || tags['name:pt'] || '';
      if (!nome) return;

      var tourism  = tags.tourism || '';
      var amenity  = tags.amenity || '';
      var rating   = tags['stars'] ? '⭐'.repeat(Math.min(parseInt(tags['stars']), 5)) : '';
      var cuisine  = tags.cuisine ? ' (' + tags.cuisine.replace(/_/g,' ') + ')' : '';

      if (tourism.match(/hotel|hostel|guest_house|motel/)) {
        if (hoteis.length < 6) hoteis.push({ nome: nome, detalhe: rating });
      } else if (amenity === 'restaurant') {
        if (restaurantes.length < 6) restaurantes.push({ nome: nome, detalhe: cuisine });
      } else if (amenity === 'cafe') {
        if (restaurantes.length < 6) restaurantes.push({ nome: nome + ' ☕', detalhe: '' });
      } else if (tourism.match(/attraction|museum|viewpoint|theme_park|zoo/)) {
        var tipo = tourism === 'museum' ? '🏛️' :
                   tourism === 'viewpoint' ? '🔭' :
                   tourism === 'theme_park' ? '🎢' : '📍';
        if (atracoes.length < 6) atracoes.push({ nome: nome, detalhe: tipo });
      }
    });
  }

  return {
    lat: lat, lon: lon,
    nomeCidade: nomeCidade,
    wikiText: wikiText,
    hoteis: hoteis,
    restaurantes: restaurantes,
    atracoes: atracoes
  };
}

function _mostrarSidebarDicas(cidade, dados, erro) {
  var enc = encodeURIComponent;
  var gmBase = 'https://www.google.com/maps/search/';

  var h = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
  h += '*{box-sizing:border-box;margin:0;padding:0}';
  h += 'body{font-family:"Segoe UI",sans-serif;font-size:13px;background:#F4F6F8;color:#1B2A4A}';
  h += '.hero{background:#1B2A4A;color:#FFF;padding:16px;text-align:center}';
  h += '.hero h2{font-size:18px;margin-bottom:4px}';
  h += '.hero p{font-size:11px;color:#AAA;line-height:1.4}';
  h += '.card{background:#FFF;border-radius:10px;margin:10px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,.08)}';
  h += '.card h3{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#555;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #EEE}';
  h += '.item{padding:5px 0;border-bottom:1px solid #F5F5F5;display:flex;justify-content:space-between;align-items:center}';
  h += '.item:last-child{border-bottom:none}';
  h += '.item .nome{font-size:12px;color:#1B2A4A;flex:1}';
  h += '.item .det{font-size:10px;color:#999;margin-left:6px}';
  h += '.empty{font-size:11px;color:#AAA;font-style:italic;padding:4px 0}';
  h += '.btn{display:block;background:#4285F4;color:#FFF;text-decoration:none;text-align:center;';
  h += 'padding:8px;border-radius:8px;font-size:11px;font-weight:700;margin-top:6px}';
  h += '.btn:hover{background:#3367D6}';
  h += '.btn.green{background:#27AE60}.btn.orange{background:#E67E22}.btn.purple{background:#8E44AD}';
  h += '.wiki{font-size:11px;color:#555;line-height:1.5;padding:4px 0}';
  h += '.links{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}';
  h += '.links a{flex:1;min-width:100px;font-size:10px}';
  h += '.erro{padding:20px;text-align:center;color:#E74C3C}';
  h += '</style></head><body>';

  if (erro) {
    h += '<div class="hero"><h2>⚠️ Erro na busca</h2></div>';
    h += '<div class="card"><p class="erro">' + erro + '</p>';
    h += '<p style="font-size:11px;color:#888;text-align:center;margin-top:8px">Verifique a cidade e tente novamente.</p></div>';
    h += '</body></html>';
    SpreadsheetApp.getUi().showSidebar(
      HtmlService.createHtmlOutput(h).setWidth(440).setTitle('Dicas: ' + cidade));
    return;
  }

  // Hero
  h += '<div class="hero">';
  h += '<h2>📍 ' + dados.nomeCidade + '</h2>';
  if (dados.wikiText) h += '<p>' + dados.wikiText + '</p>';
  h += '</div>';

  // Links Google Maps
  h += '<div class="card">';
  h += '<h3>🔗 Pesquisar no Google Maps</h3>';
  h += '<div class="links">';
  h += '<a class="btn" href="' + gmBase + enc('hoteis em ' + dados.nomeCidade) + '" target="_blank">🏨 Hotéis</a>';
  h += '<a class="btn green" href="' + gmBase + enc('restaurantes em ' + dados.nomeCidade) + '" target="_blank">🍽️ Restaurantes</a>';
  h += '<a class="btn orange" href="' + gmBase + enc('pontos turisticos em ' + dados.nomeCidade) + '" target="_blank">🏛️ Atrações</a>';
  h += '<a class="btn purple" href="' + gmBase + enc('o que fazer em ' + dados.nomeCidade) + '" target="_blank">📍 O que fazer</a>';
  h += '</div></div>';

  // Hotéis
  h += '<div class="card"><h3>🏨 Hotéis e Pousadas</h3>';
  if (dados.hoteis.length > 0) {
    dados.hoteis.forEach(function(i) {
      h += '<div class="item"><span class="nome">' + i.nome + '</span><span class="det">' + i.detalhe + '</span></div>';
    });
  } else {
    h += '<p class="empty">Nenhum dado OSM disponível — use o link Google Maps acima</p>';
  }
  h += '<a class="btn" style="margin-top:8px" href="' + gmBase + enc('hoteis pousadas ' + dados.nomeCidade) + '" target="_blank">Ver mais no Maps →</a>';
  h += '</div>';

  // Restaurantes
  h += '<div class="card"><h3>🍽️ Gastronomia</h3>';
  if (dados.restaurantes.length > 0) {
    dados.restaurantes.forEach(function(i) {
      h += '<div class="item"><span class="nome">' + i.nome + '</span><span class="det">' + i.detalhe + '</span></div>';
    });
  } else {
    h += '<p class="empty">Nenhum dado OSM disponível — use o link Google Maps acima</p>';
  }
  h += '<a class="btn green" style="margin-top:8px" href="' + gmBase + enc('restaurantes ' + dados.nomeCidade) + '" target="_blank">Ver mais no Maps →</a>';
  h += '</div>';

  // Atrações
  h += '<div class="card"><h3>🏛️ Pontos Turísticos</h3>';
  if (dados.atracoes.length > 0) {
    dados.atracoes.forEach(function(i) {
      h += '<div class="item"><span class="nome">' + i.detalhe + ' ' + i.nome + '</span></div>';
    });
  } else {
    h += '<p class="empty">Nenhum dado OSM disponível — use o link Google Maps acima</p>';
  }
  h += '<a class="btn orange" style="margin-top:8px" href="' + gmBase + enc('pontos turisticos ' + dados.nomeCidade) + '" target="_blank">Ver mais no Maps →</a>';
  h += '</div>';

  // Coordenadas / mapa
  h += '<div class="card"><h3>🗺️ Ver no Mapa</h3>';
  h += '<a class="btn" href="https://www.google.com/maps/@' + dados.lat + ',' + dados.lon + ',13z" target="_blank">Abrir mapa de ' + dados.nomeCidade + '</a>';
  h += '<a class="btn green" style="margin-top:6px" href="https://www.google.com/maps/dir//' + enc(dados.nomeCidade) + '" target="_blank">🧭 Como chegar</a>';
  h += '</div>';

  h += '<div style="text-align:center;font-size:10px;color:#AAA;padding:8px">Dados: OpenStreetMap · Wikipedia · Google Maps</div>';
  h += '</body></html>';

  SpreadsheetApp.getUi().showSidebar(
    HtmlService.createHtmlOutput(h).setWidth(440).setTitle('🗺️ Dicas: ' + dados.nomeCidade));
}

// ═══ Correção de Status (migração de dados antigos) ═══
function corrigirStatus() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Lancamentos');
  if (!sheet) { ui.alert('Aba "Lancamentos" não encontrada!'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('Nenhum lançamento encontrado.'); return; }

  var resp = ui.alert(
    '🔄 Corrigir Status',
    'Isso vai converter os status antigos para o novo padrão:\n\n' +
    '• "Pendente" em Receitas  → "A Receber"\n' +
    '• "Pendente" em Despesas  → "A Pagar"\n\n' +
    'Deseja continuar?',
    ui.ButtonSet.YES_NO
  );
  if (resp !== ui.Button.YES) return;

  var dados = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  var corrigidos = 0;

  for (var i = 0; i < dados.length; i++) {
    var tipo   = String(dados[i][0]).trim();
    var status = String(dados[i][7]).trim();

    if (status === 'Pendente') {
      var novoStatus = tipo === 'Receita' ? 'A Receber' : 'A Pagar';
      sheet.getRange(i + 2, 8).setValue(novoStatus);
      corrigidos++;
    }
  }

  SpreadsheetApp.flush();

  if (corrigidos === 0) {
    ui.alert('✅ Nenhum status "Pendente" encontrado. Dados já estão no novo formato!');
  } else {
    ui.alert('✅ ' + corrigidos + ' registro(s) corrigido(s) com sucesso!\n\nSeu dashboard já reflete os novos status.');
  }
}

// ═══ Visão do Período: Ciclo 1 atual vs Mês completo ═══
function mostrarResumo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName('Dashboard');
  var sheet = ss.getSheetByName('Lancamentos');
  if (!dash || !sheet) {
    SpreadsheetApp.getUi().alert('Abas Dashboard ou Lancamentos não encontradas!');
    return;
  }

  var mes  = Number(dash.getRange('B2').getValue()) || (new Date().getMonth() + 1);
  var ano  = Number(dash.getRange('E2').getValue()) || new Date().getFullYear();
  var meses = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var nomeMes = meses[mes] || mes;

  // Calcular totais diretamente dos lançamentos para garantir precisão
  var lastRow = sheet.getLastRow();
  var recC1 = 0, recC2 = 0, despC1 = 0, despC2 = 0;
  var recC1pend = 0, recC2pend = 0, despC1pend = 0, despC2pend = 0;

  if (lastRow >= 2) {
    var dados = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    // Colunas: [0]Tipo [1]Data [2]Desc [3]Cat [4]Resp [5]Ciclo [6]Valor [7]Status
    for (var i = 0; i < dados.length; i++) {
      var row = dados[i];
      var dt = row[1];
      if (!(dt instanceof Date)) continue;
      if ((dt.getMonth() + 1) !== mes || dt.getFullYear() !== ano) continue;

      var tipo   = String(row[0]).trim();
      var ciclo  = Number(row[5]);
      var valor  = Number(row[6]) || 0;
      var status = String(row[7]).trim();
      var pend   = (status === 'A Pagar' || status === 'A Receber');

      if (tipo === 'Receita') {
        if (ciclo === 1) { recC1 += valor;  if (pend) recC1pend  += valor; }
        else             { recC2 += valor;  if (pend) recC2pend  += valor; }
      } else {
        if (ciclo === 1) { despC1 += valor; if (pend) despC1pend += valor; }
        else             { despC2 += valor; if (pend) despC2pend += valor; }
      }
    }
  }

  var saldoC1    = recC1 - despC1;
  var saldoMes   = (recC1 + recC2) - (despC1 + despC2);
  var recTotal   = recC1 + recC2;
  var despTotal  = despC1 + despC2;
  var pendTotal  = recC1pend + recC2pend;   // receitas ainda a receber
  var apagarTotal = despC1pend + despC2pend; // despesas ainda a pagar

  function fmt(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function cor(v) { return v >= 0 ? '#27AE60' : '#E74C3C'; }
  function pcnt(part, total) { return total > 0 ? (part/total*100).toFixed(0)+'%' : '—'; }

  var h = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
  h += '*{box-sizing:border-box;margin:0;padding:0}';
  h += 'body{font-family:"Google Sans","Segoe UI",sans-serif;padding:16px;background:#F4F6F8;color:#1B2A4A;font-size:13px}';
  h += 'h2{font-size:16px;text-align:center;margin-bottom:4px}';
  h += '.sub{text-align:center;color:#888;font-size:12px;margin-bottom:16px}';
  h += '.card{background:#FFF;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.08)}';
  h += '.card h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5F6368;margin-bottom:10px;border-bottom:1px solid #F0F0F0;padding-bottom:6px}';
  h += '.row{display:flex;justify-content:space-between;align-items:center;padding:4px 0}';
  h += '.lbl{color:#555}';
  h += '.val{font-weight:700;font-size:13px}';
  h += '.saldo{font-size:20px;font-weight:800;text-align:center;padding:10px 0 4px}';
  h += '.tag{display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;vertical-align:middle}';
  h += '.tag-c1{background:#E3F2FD;color:#1976D2}';
  h += '.tag-mes{background:#EDE7F6;color:#6A1B9A}';
  h += '.divider{height:1px;background:#EEE;margin:8px 0}';
  h += '.pend{color:#E67E22;font-size:11px;font-weight:600}';
  h += '.footer{text-align:center;color:#AAA;font-size:11px;margin-top:8px}';
  h += '</style></head><body>';
  h += '<h2>📅 ' + nomeMes + ' / ' + ano + '</h2>';
  h += '<div class="sub">Visão por ciclo de pagamento</div>';

  // ── CARD CICLO 1 ──
  h += '<div class="card">';
  h += '<h3>⏱ Atual — Ciclo 1 <span class="tag tag-c1">até dia 15</span></h3>';
  h += '<div class="row"><span class="lbl">📥 Receitas</span><span class="val" style="color:#27AE60">' + fmt(recC1) + '</span></div>';
  if (recC1pend > 0) h += '<div class="row"><span class="pend">   ↳ a receber</span><span class="pend">' + fmt(recC1pend) + '</span></div>';
  h += '<div class="row"><span class="lbl">📤 Despesas</span><span class="val" style="color:#E74C3C">' + fmt(despC1) + '</span></div>';
  if (despC1pend > 0) h += '<div class="row"><span class="pend">   ↳ a pagar</span><span class="pend">' + fmt(despC1pend) + '</span></div>';
  h += '<div class="divider"></div>';
  h += '<div class="saldo" style="color:' + cor(saldoC1) + '">' + fmt(saldoC1) + '</div>';
  h += '<div style="text-align:center;font-size:11px;color:#888">saldo do ciclo 1</div>';
  h += '</div>';

  // ── CARD MÊS COMPLETO ──
  h += '<div class="card">';
  h += '<h3>📆 Mês Completo — C1 + C2 <span class="tag tag-mes">projeção</span></h3>';
  h += '<div class="row"><span class="lbl">📥 Total Receitas</span><span class="val" style="color:#27AE60">' + fmt(recTotal) + '</span></div>';
  h += '<div class="row"><span class="lbl">   C1 / C2</span><span class="val" style="color:#888">' + fmt(recC1) + ' / ' + fmt(recC2) + '</span></div>';
  if (pendTotal > 0) h += '<div class="row"><span class="pend">   ↳ a receber (total)</span><span class="pend">' + fmt(pendTotal) + '</span></div>';
  h += '<div class="divider"></div>';
  h += '<div class="row"><span class="lbl">📤 Total Despesas</span><span class="val" style="color:#E74C3C">' + fmt(despTotal) + '</span></div>';
  h += '<div class="row"><span class="lbl">   C1 / C2</span><span class="val" style="color:#888">' + fmt(despC1) + ' / ' + fmt(despC2) + '</span></div>';
  if (apagarTotal > 0) h += '<div class="row"><span class="pend">   ↳ a pagar (total)</span><span class="pend">' + fmt(apagarTotal) + '</span></div>';
  h += '<div class="divider"></div>';
  h += '<div class="saldo" style="color:' + cor(saldoMes) + '">' + fmt(saldoMes) + '</div>';
  h += '<div style="text-align:center;font-size:11px;color:#888">saldo projetado do mês (' + pcnt(saldoMes, recTotal) + ' da receita)</div>';
  h += '</div>';

  // ── CARD INDICADORES ──
  h += '<div class="card">';
  h += '<h3>📊 Indicadores</h3>';
  h += '<div class="row"><span class="lbl">% gasto / receita (C1)</span><span class="val">' + pcnt(despC1, recC1) + '</span></div>';
  h += '<div class="row"><span class="lbl">% gasto / receita (mês)</span><span class="val">' + pcnt(despTotal, recTotal) + '</span></div>';
  h += '<div class="row"><span class="lbl">% economizado (mês)</span><span class="val" style="color:' + cor(saldoMes) + '">' + pcnt(saldoMes, recTotal) + '</span></div>';
  h += '</div>';

  h += '<div class="footer">Mês/ano selecionado no Dashboard: B2 / B3</div>';
  h += '</body></html>';

  var out = HtmlService.createHtmlOutput(h)
    .setWidth(360).setHeight(640).setTitle('Visão do Período');
  SpreadsheetApp.getUi().showSidebar(out);
}

function resetMes() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName('Dashboard');
  var sheet = ss.getSheetByName('Lancamentos');
  if (!sheet) { ui.alert('Aba "Lancamentos" não encontrada!'); return; }

  // Pegar mês e ano selecionados no Dashboard
  var mes = dash ? dash.getRange('B2').getValue() : new Date().getMonth() + 1;
  var ano = dash ? dash.getRange('E2').getValue() : new Date().getFullYear();
  var meses = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var nomeMes = meses[mes] || mes;

  // Confirmar com o usuário
  var resp = ui.alert(
    '🗑️ Limpar Lançamentos',
    'Isso vai APAGAR todos os lançamentos de ' + nomeMes + '/' + ano + '.\n\n' +
    'Essa ação não pode ser desfeita.\n\nDeseja continuar?',
    ui.ButtonSet.YES_NO
  );
  if (resp !== ui.Button.YES) return;

  // Encontrar e deletar linhas do mês/ano selecionado
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('Nenhum lançamento encontrado.'); return; }

  var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  var rowsToDelete = [];

  for (var i = data.length - 1; i >= 0; i--) {
    var dt = data[i][1]; // coluna B = Data
    if (dt instanceof Date) {
      if ((dt.getMonth() + 1) === mes && dt.getFullYear() === ano) {
        rowsToDelete.push(i + 2); // +2 porque dados começam na linha 2
      }
    }
  }

  if (rowsToDelete.length === 0) {
    ui.alert('Nenhum lançamento encontrado em ' + nomeMes + '/' + ano + '.');
    return;
  }

  // Deletar de baixo pra cima para não deslocar índices
  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }

  SpreadsheetApp.flush();
  ui.alert('✅ ' + rowsToDelete.length + ' lançamento(s) de ' + nomeMes + '/' + ano + ' removido(s).');
}

// ═══ Resumo Anual ═══
function mostrarResumoAnual() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Lancamentos');
  var dash  = ss.getSheetByName('Dashboard');
  if (!sheet) { SpreadsheetApp.getUi().alert('Aba "Lancamentos" não encontrada!'); return; }

  var ano = dash ? Number(dash.getRange('E2').getValue()) : new Date().getFullYear();
  if (!ano || isNaN(ano)) ano = new Date().getFullYear();

  var meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var mesesFull = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // Inicializar acumuladores por mês
  var rec  = new Array(13).fill(0);
  var desp = new Array(13).fill(0);

  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var dados = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    for (var i = 0; i < dados.length; i++) {
      var row = dados[i];
      var dt  = row[1];
      if (!(dt instanceof Date)) continue;
      if (dt.getFullYear() !== ano) continue;
      var m     = dt.getMonth() + 1;
      var tipo  = String(row[0]).trim();
      var valor = Number(row[6]) || 0;
      if (tipo === 'Receita') rec[m]  += valor;
      else                    desp[m] += valor;
    }
  }

  // Totais anuais
  var totalRec = 0, totalDesp = 0;
  for (var m = 1; m <= 12; m++) { totalRec += rec[m]; totalDesp += desp[m]; }
  var totalSaldo = totalRec - totalDesp;

  // Mês com maior gasto e maior receita
  var melhorMes = 0, melhorVal = -Infinity;
  var piorMes   = 0, piorVal   = Infinity;
  for (var m = 1; m <= 12; m++) {
    var saldo = rec[m] - desp[m];
    if (rec[m] > 0 || desp[m] > 0) {
      if (saldo > melhorVal) { melhorVal = saldo; melhorMes = m; }
      if (saldo < piorVal)  { piorVal   = saldo; piorMes   = m; }
    }
  }

  function fmt(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function cor(v) { return v >= 0 ? '#27AE60' : '#E74C3C'; }
  function bar(perc, color) {
    var w = Math.min(Math.abs(perc), 100);
    return '<div style="height:6px;background:#EEE;border-radius:3px;margin-top:3px">'
         + '<div style="width:' + w + '%;height:100%;background:' + color + ';border-radius:3px"></div></div>';
  }

  var maxDesp = Math.max.apply(null, desp.slice(1)) || 1;
  var maxRec  = Math.max.apply(null, rec.slice(1))  || 1;

  var h = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
  h += '*{box-sizing:border-box;margin:0;padding:0}';
  h += 'body{font-family:"Google Sans","Segoe UI",sans-serif;padding:14px;background:#F4F6F8;color:#1B2A4A;font-size:12px}';
  h += 'h2{font-size:15px;text-align:center;margin-bottom:3px}';
  h += '.sub{text-align:center;color:#888;font-size:11px;margin-bottom:12px}';
  h += '.card{background:#FFF;border-radius:10px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.07)}';
  h += '.card h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5F6368;margin-bottom:8px;border-bottom:1px solid #F0F0F0;padding-bottom:5px}';
  h += 'table{width:100%;border-collapse:collapse}';
  h += 'th{font-size:10px;color:#888;font-weight:600;text-align:right;padding:2px 4px}';
  h += 'th:first-child{text-align:left}';
  h += 'td{padding:4px 4px;font-size:11px;text-align:right;border-bottom:1px solid #F7F7F7}';
  h += 'td:first-child{text-align:left;font-weight:600}';
  h += 'tr.vazio td{color:#CCC;font-style:italic}';
  h += 'tr.total td{font-weight:800;font-size:12px;border-top:2px solid #DDD;padding-top:6px}';
  h += '.kpi-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}';
  h += '.kpi{background:#FFF;border-radius:8px;padding:10px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06)}';
  h += '.kpi .v{font-size:13px;font-weight:800;margin-top:4px}';
  h += '.kpi .l{font-size:10px;color:#888}';
  h += '.destaque{font-size:10px;color:#888;text-align:center;margin-top:6px}';
  h += '.ano-sel{display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:10px}';
  h += '.ano-sel button{border:none;background:#E3F2FD;color:#1976D2;font-weight:700;border-radius:6px;padding:3px 10px;cursor:pointer;font-size:13px}';
  h += '.ano-sel span{font-size:16px;font-weight:800}';
  h += '</style></head><body>';
  h += '<h2>📅 Resumo Anual</h2>';
  h += '<div class="sub">Ano base: ' + ano + ' (selecionado no Dashboard)</div>';

  // KPIs anuais
  h += '<div class="kpi-grid">';
  h += '<div class="kpi"><div class="l">Total Receitas</div><div class="v" style="color:#27AE60">' + fmt(totalRec) + '</div></div>';
  h += '<div class="kpi"><div class="l">Total Despesas</div><div class="v" style="color:#E74C3C">' + fmt(totalDesp) + '</div></div>';
  h += '<div class="kpi"><div class="l">Saldo do Ano</div><div class="v" style="color:' + cor(totalSaldo) + '">' + fmt(totalSaldo) + '</div></div>';
  h += '</div><br>';

  // Destaques
  if (melhorMes > 0) {
    h += '<div class="destaque">🏆 Melhor mês: <b>' + mesesFull[melhorMes] + '</b> (' + fmt(melhorVal) + ' de saldo) &nbsp;|&nbsp; ';
    h += '⚠️ Pior mês: <b>' + mesesFull[piorMes] + '</b> (' + fmt(piorVal) + ' de saldo)</div><br>';
  }

  // Tabela mensal
  h += '<div class="card">';
  h += '<h3>Mês a mês</h3>';
  h += '<table><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Saldo</th></tr></thead><tbody>';

  for (var m = 1; m <= 12; m++) {
    var saldo = rec[m] - desp[m];
    var vazio = rec[m] === 0 && desp[m] === 0;
    h += '<tr' + (vazio ? ' class="vazio"' : '') + '>';
    h += '<td>' + meses[m] + '</td>';
    if (vazio) {
      h += '<td colspan="3" style="text-align:center">—</td>';
    } else {
      h += '<td style="color:#27AE60">' + fmt(rec[m])  + bar(rec[m]/maxRec*100, '#27AE60') + '</td>';
      h += '<td style="color:#E74C3C">' + fmt(desp[m]) + bar(desp[m]/maxDesp*100, '#E74C3C') + '</td>';
      h += '<td style="color:' + cor(saldo) + ';font-weight:700">' + fmt(saldo) + '</td>';
    }
    h += '</tr>';
  }

  h += '<tr class="total">';
  h += '<td>TOTAL</td>';
  h += '<td style="color:#27AE60">' + fmt(totalRec) + '</td>';
  h += '<td style="color:#E74C3C">' + fmt(totalDesp) + '</td>';
  h += '<td style="color:' + cor(totalSaldo) + '">' + fmt(totalSaldo) + '</td>';
  h += '</tr>';
  h += '</tbody></table></div>';

  // Taxa de economia
  var txEcon = totalRec > 0 ? (totalSaldo / totalRec * 100).toFixed(1) : 0;
  var mediaRec  = totalRec  / 12;
  var mediaDesp = totalDesp / 12;
  h += '<div class="kpi-grid">';
  h += '<div class="kpi"><div class="l">Média mensal Receita</div><div class="v" style="color:#27AE60">' + fmt(mediaRec) + '</div></div>';
  h += '<div class="kpi"><div class="l">Média mensal Despesa</div><div class="v" style="color:#E74C3C">' + fmt(mediaDesp) + '</div></div>';
  h += '<div class="kpi"><div class="l">Taxa de economia</div><div class="v" style="color:' + cor(totalSaldo) + '">' + txEcon + '%</div></div>';
  h += '</div>';

  h += '</body></html>';

  var out = HtmlService.createHtmlOutput(h)
    .setWidth(480).setHeight(680).setTitle('Resumo Anual ' + ano);
  SpreadsheetApp.getUi().showSidebar(out);
}

// ═══ Gerenciador de Categorias ═══
function gerenciarCategorias() {
  var cats = obterCategorias();
  var catsJson = JSON.stringify(cats);

  var h = '';
  h += '<!DOCTYPE html><html><head><style>';
  h += '*{box-sizing:border-box;margin:0;padding:0}';
  h += 'body{font-family:"Google Sans","Segoe UI",sans-serif;padding:20px;background:#FAFBFC;color:#1B2A4A}';
  h += 'h2{font-size:18px;margin-bottom:16px;text-align:center}';
  h += '.list{max-height:300px;overflow-y:auto;border:1px solid #E0E0E0;border-radius:8px;margin-bottom:16px;background:#FFF}';
  h += '.item{display:flex;align-items:center;padding:10px 14px;border-bottom:1px solid #F0F0F0}';
  h += '.item:last-child{border-bottom:none}';
  h += '.item .nome{flex:1;font-size:14px}';
  h += '.btns{display:flex;gap:4px}';
  h += '.edt{background:#E3F2FD;color:#2980B9;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-weight:700;font-size:12px}';
  h += '.edt:hover{background:#2980B9;color:#FFF}';
  h += '.del{background:#FFEBEE;color:#E74C3C;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-weight:700;font-size:12px}';
  h += '.del:hover{background:#E74C3C;color:#FFF}';
  h += '.add-row{display:flex;gap:8px}';
  h += '.add-row input{flex:1;padding:10px 12px;border:2px solid #E0E0E0;border-radius:8px;font-size:14px}';
  h += '.add-row input:focus{border-color:#2980B9;outline:none}';
  h += '.btn-add{padding:10px 16px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:#27AE60;color:#FFF}';
  h += '.btn-add:hover{background:#1E8449}';
  h += '.toast{position:fixed;top:12px;left:12px;right:12px;padding:10px;border-radius:8px;text-align:center;font-weight:600;display:none;font-size:13px;background:#E8F5E9;color:#1E8449;border:1px solid #A5D6A7}';
  h += '.empty{text-align:center;padding:20px;color:#999;font-style:italic}';
  h += '</style></head><body>';
  h += '<h2>Gerenciar Categorias</h2>';
  h += '<div id="toast" class="toast"></div>';
  h += '<div class="add-row">';
  h += '<input type="text" id="nova" placeholder="Nome da nova categoria...">';
  h += '<button class="btn-add" onclick="adicionar()">+ Adicionar</button>';
  h += '</div><br>';
  h += '<div class="list" id="lista"></div>';
  h += '<scr' + 'ipt>';
  h += 'var cats=' + catsJson + ';';
  h += 'function render(){';
  h += '  var el=document.getElementById("lista");';
  h += '  if(cats.length===0){el.innerHTML="<div class=empty>Nenhuma categoria</div>";return;}';
  h += '  var html="";';
  h += '  for(var i=0;i<cats.length;i++){';
  h += '    html+="<div class=item><span class=nome>"+cats[i]+"</span>";';
  h += '    html+="<div class=btns>";';
  h += '    html+="<button class=edt data-i="+i+">Editar</button>";';
  h += '    html+="<button class=del data-i="+i+">Excluir</button>";';
  h += '    html+="</div></div>";';
  h += '  }';
  h += '  el.innerHTML=html;';
  h += '  el.querySelectorAll(".edt").forEach(function(b){b.addEventListener("click",function(){editar(parseInt(this.dataset.i));});});';
  h += '  el.querySelectorAll(".del").forEach(function(b){b.addEventListener("click",function(){remover(parseInt(this.dataset.i));});});';
  h += '}';
  h += 'render();';
  h += 'function toast(msg){var el=document.getElementById("toast");el.textContent=msg;el.style.display="block";setTimeout(function(){el.style.display="none"},2500);}';
  h += 'function adicionar(){';
  h += '  var nome=document.getElementById("nova").value.trim();';
  h += '  if(!nome){alert("Digite o nome da categoria");return;}';
  h += '  if(cats.indexOf(nome)>=0){alert("Categoria ja existe");return;}';
  h += '  google.script.run.withSuccessHandler(function(){';
  h += '    cats.push(nome);render();document.getElementById("nova").value="";toast(nome+" adicionada");';
  h += '  }).withFailureHandler(function(e){alert("Erro: "+e.message);}).adicionarCategoria(nome);';
  h += '}';
  h += 'function remover(i){';
  h += '  var nome=cats[i];';
  h += '  if(!confirm("Excluir a categoria "+nome+"?"))return;';
  h += '  google.script.run.withSuccessHandler(function(){';
  h += '    cats.splice(i,1);render();toast(nome+" removida");';
  h += '  }).withFailureHandler(function(e){alert("Erro: "+e.message);}).removerCategoria(nome);';
  h += '}';
  h += 'function editar(i){';
  h += '  var antigo=cats[i];';
  h += '  var novo=prompt("Novo nome para: "+antigo,antigo);';
  h += '  if(!novo||!novo.trim()||novo.trim()===antigo)return;';
  h += '  novo=novo.trim();';
  h += '  if(cats.indexOf(novo)>=0){alert("Ja existe uma categoria com esse nome");return;}';
  h += '  google.script.run.withSuccessHandler(function(){';
  h += '    cats[i]=novo;render();toast(antigo+" renomeada para "+novo);';
  h += '  }).withFailureHandler(function(e){alert("Erro: "+e.message);}).renomearCategoria(antigo,novo);';
  h += '}';
  h += 'document.getElementById("nova").addEventListener("keydown",function(e){if(e.key==="Enter")adicionar();});';
  h += '</scr' + 'ipt></body></html>';

  var output = HtmlService.createHtmlOutput(h)
    .setWidth(400).setHeight(500).setTitle('Gerenciar Categorias');
  SpreadsheetApp.getUi().showSidebar(output);
}

function adicionarCategoria(nome) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = ss.getSheetByName('Config');
  if (!cfg) throw new Error('Aba Config não encontrada');
  var last = cfg.getLastRow();
  cfg.getRange(last + 1, 1).setValue(nome);
  SpreadsheetApp.flush();
}

function removerCategoria(nome) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = ss.getSheetByName('Config');
  if (!cfg) throw new Error('Aba Config não encontrada');
  var last = cfg.getLastRow();
  for (var i = last; i >= 2; i--) {
    if (cfg.getRange(i, 1).getValue() === nome) {
      cfg.deleteRow(i);
      SpreadsheetApp.flush();
      return;
    }
  }
  throw new Error('Categoria "' + nome + '" não encontrada');
}

function renomearCategoria(antigo, novo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = ss.getSheetByName('Config');
  if (!cfg) throw new Error('Aba Config não encontrada');
  var last = cfg.getLastRow();
  for (var i = 2; i <= last; i++) {
    if (cfg.getRange(i, 1).getValue() === antigo) {
      cfg.getRange(i, 1).setValue(novo);
      SpreadsheetApp.flush();
      return;
    }
  }
  throw new Error('Categoria "' + antigo + '" não encontrada');
}

function obterCategorias() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = ss.getSheetByName('Config');
  if (!cfg) return [];
  var last = cfg.getLastRow();
  if (last < 2) return [];
  return cfg.getRange('A2:A' + last).getValues()
    .map(function(r) { return r[0]; })
    .filter(function(v) { return v !== '' && v !== null; });
}

function adicionarLancamento(dados) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Lancamentos');
  if (!sheet) throw new Error('Aba "Lancamentos" não encontrada!');

  var dataObj = new Date(dados.data + 'T12:00:00');
  var valor = parseFloat(dados.valor);
  if (isNaN(valor) || valor <= 0) throw new Error('Valor inválido');

  sheet.appendRow([
    dados.tipo,
    dataObj,
    dados.descricao,
    dados.categoria,
    dados.responsavel,
    parseInt(dados.ciclo),
    valor,
    dados.status
  ]);

  // Formatar a nova linha
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 2).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(lastRow, 7).setNumberFormat('#,##0.00');

  SpreadsheetApp.flush();
  return 'OK';
}

// ═══════════════════════════════════════════════════════
//  GRÁFICOS NATIVOS — criados diretamente no Google Sheets
// ═══════════════════════════════════════════════════════
function criarGraficos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName('Dashboard');
  if (!dash) { SpreadsheetApp.getUi().alert('Aba "Dashboard" não encontrada!'); return; }

  // Remove gráficos existentes para recriar
  var charts = dash.getCharts();
  for (var i = 0; i < charts.length; i++) { dash.removeChart(charts[i]); }

  // Forçar cálculo de TODAS as fórmulas
  SpreadsheetApp.flush();

  // ── Ler valores CALCULADOS (não fórmulas) ──
  var recC1  = Number(dash.getRange('P1').getValue()) || 0;
  var recC2  = Number(dash.getRange('Q1').getValue()) || 0;
  var despC1 = Number(dash.getRange('R1').getValue()) || 0;
  var despC2 = Number(dash.getRange('P2').getValue()) || 0;

  // Escrever dados do gráfico de barras como VALORES (colunas M-O, fora da tela)
  dash.getRange('M1').setValue('');
  dash.getRange('N1').setValue('Receitas');
  dash.getRange('O1').setValue('Despesas');
  dash.getRange('M2').setValue('Ciclo 1');
  dash.getRange('N2').setValue(recC1);
  dash.getRange('O2').setValue(despC1);
  dash.getRange('M3').setValue('Ciclo 2');
  dash.getRange('N3').setValue(recC2);
  dash.getRange('O3').setValue(despC2);
  dash.getRange('N2:O3').setNumberFormat('#,##0.00');
  dash.getRange('M1:O3').setFontColor('#FFFFFF');

  // Escrever dados do gráfico de rosca como VALORES
  var catNames = dash.getRange('A15:A22').getValues().flat();
  var catVals  = dash.getRange('B15:B22').getValues().flat();
  for (var c = 0; c < catNames.length; c++) {
    dash.getRange('M' + (5+c)).setValue(catNames[c]).setFontColor('#FFFFFF');
    dash.getRange('N' + (5+c)).setValue(Number(catVals[c]) || 0).setNumberFormat('#,##0.00').setFontColor('#FFFFFF');
  }

  SpreadsheetApp.flush();

  // ── Gráfico 1: Barras ──
  var chartRow = 21;
  var barChart = dash.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dash.getRange('M1:O3'))
    .setNumHeaders(1)
    .setPosition(chartRow, 1, 0, 0)
    .setOption('title', 'Receitas vs Despesas por Ciclo')
    .setOption('titleTextStyle', {fontSize: 13, bold: true, color: '#1B2A4A'})
    .setOption('colors', ['#27AE60', '#E74C3C'])
    .setOption('legend', {position: 'bottom', textStyle: {fontSize: 10}})
    .setOption('vAxis', {format: '#,##0', textStyle: {fontSize: 9}, gridlines: {color: '#E8E8E8'}})
    .setOption('chartArea', {left: 70, top: 35, width: '70%', height: '65%'})
    .setOption('bar', {groupWidth: '55%'})
    .setOption('backgroundColor', {fill: '#FAFBFC'})
    .setOption('width', 380)
    .setOption('height', 280)
    .build();
  dash.insertChart(barChart);

  // ── Gráfico 2: Rosca ──
  var donutChart = dash.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(dash.getRange('M5:N12'))
    .setNumHeaders(0)
    .setPosition(chartRow, 6, 0, 0)
    .setOption('title', 'Gastos por Categoria')
    .setOption('titleTextStyle', {fontSize: 13, bold: true, color: '#1B2A4A'})
    .setOption('pieHole', 0.4)
    .setOption('colors', ['#3498DB','#E74C3C','#F1C40F','#27AE60','#9B59B6','#E67E22','#1ABC9C','#95A5A6'])
    .setOption('legend', {position: 'labeled', textStyle: {fontSize: 9}})
    .setOption('chartArea', {left: 10, top: 35, width: '90%', height: '70%'})
    .setOption('backgroundColor', {fill: '#FAFBFC'})
    .setOption('width', 380)
    .setOption('height', 280)
    .build();
  dash.insertChart(donutChart);

  // Feedback
  SpreadsheetApp.getUi().alert(
    'Graficos criados!\n\n' +
    'Para atualizar os dados dos graficos, execute novamente:\n' +
    'Menu Controle > Criar Graficos no Dashboard'
  );
}

// ═══ Formulário ═══
function abrirFormulario() {
  var cats = obterCategorias();
  var catsJson = JSON.stringify(cats);

  var htmlContent = '\
<!DOCTYPE html>\
<html>\
<head>\
<style>\
  * { box-sizing: border-box; margin: 0; padding: 0; }\
  body { font-family: "Google Sans", "Segoe UI", Roboto, sans-serif; padding: 20px; background: #FAFBFC; color: #1B2A4A; }\
  h2 { font-size: 20px; margin-bottom: 20px; text-align: center; }\
  .group { margin-bottom: 14px; }\
  label { display: block; font-size: 11px; font-weight: 700; color: #5F6368; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }\
  select, input[type="text"], input[type="number"], input[type="date"] {\
    width: 100%; padding: 10px 12px; border: 2px solid #E0E0E0; border-radius: 8px;\
    font-size: 14px; background: white; color: #1B2A4A; transition: border-color 0.2s;\
  }\
  select:focus, input:focus { border-color: #2980B9; outline: none; box-shadow: 0 0 0 3px rgba(41,128,185,0.15); }\
  .row { display: flex; gap: 10px; }\
  .row > .group { flex: 1; }\
  .tipo-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 4px; }\
  .badge-receita { background: #E8F5E9; color: #1E8449; }\
  .badge-despesa { background: #FFEBEE; color: #E74C3C; }\
  .separator { height: 1px; background: #E8E8E8; margin: 18px 0; }\
  .btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }\
  .btn-go { background: #27AE60; color: white; }\
  .btn-go:hover { background: #1E8449; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(39,174,96,0.35); }\
  .btn-go:active { transform: translateY(0); }\
  .btn-go:disabled { background: #95D5B2; cursor: wait; transform: none; box-shadow: none; }\
  .toast { position: fixed; top: 16px; left: 16px; right: 16px; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 14px;\
           text-align: center; display: none; z-index: 999; animation: pop 0.3s ease; }\
  .toast-ok { background: #E8F5E9; color: #1E8449; border: 1px solid #A5D6A7; }\
  .toast-err { background: #FFEBEE; color: #C62828; border: 1px solid #EF9A9A; }\
  @keyframes pop { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }\
  .counter { text-align: center; font-size: 12px; color: #999; margin-top: 12px; }\
</style>\
</head>\
<body>\
  <h2>📝 Novo Lançamento</h2>\
  <div id="toast-ok" class="toast toast-ok">✅ Lançamento adicionado!</div>\
  <div id="toast-err" class="toast toast-err">❌ Preencha descrição, valor e data</div>\
\
  <div class="group">\
    <label>Tipo</label>\
    <select id="tipo" onchange="onTipoChange()">\
      <option value="Despesa">📤 Despesa</option>\
      <option value="Receita">📥 Receita</option>\
    </select>\
    <span id="tipoBadge" class="tipo-badge badge-despesa">DESPESA</span>\
  </div>\
\
  <div class="row">\
    <div class="group">\
      <label>Data</label>\
      <input type="date" id="data">\
    </div>\
    <div class="group">\
      <label>Ciclo</label>\
      <select id="ciclo">\
        <option value="1">1 — até dia 15</option>\
        <option value="2">2 — após dia 15</option>\
      </select>\
    </div>\
  </div>\
\
  <div class="group">\
    <label>Categoria</label>\
    <select id="categoria"></select>\
  </div>\
      <label>Responsável</label>\
      <select id="responsavel">\
        <option value="Will">Will</option>\
        <option value="Sá">Sá</option>\
        <option value="Ambos">Ambos</option>\
      </select>\
    </div>\
  </div>\
\
  <div class="row">\
    <div class="group">\
      <label>Valor (R$)</label>\
      <input type="number" id="valor" step="0.01" min="0" placeholder="0,00">\
    </div>\
    <div class="group">\
      <label>Status</label>\
      <select id="status">\
        <option value="A Receber">🔵 A Receber</option>\
        <option value="Recebido">✅ Recebido</option>\
      </select>\
    </div>\
  </div>\
\
  <div class="separator"></div>\
  <button class="btn btn-go" onclick="enviar()" id="btnGo">✅ Adicionar Lançamento</button>\
  <div class="counter" id="counter"></div>\
\
<script>\
  var contagem = 0;\
  var hoje = new Date();\
  document.getElementById("data").value = hoje.toISOString().split("T")[0];\
  document.getElementById("ciclo").value = hoje.getDate() <= 14 ? "1" : "2";\
\
  var cats = ' + catsJson + ';\
  var selCat = document.getElementById("categoria");\
  cats.forEach(function(c) {\
    var o = document.createElement("option"); o.value = c; o.text = c; selCat.add(o);\
  });\
  onTipoChange();\
\
  function onTipoChange() {\
    var tipo = document.getElementById("tipo").value;\
    var badge = document.getElementById("tipoBadge");\
    badge.textContent = tipo.toUpperCase();\
    badge.className = "tipo-badge " + (tipo === "Receita" ? "badge-receita" : "badge-despesa");\
    var recCats = ["Salário","13° Salário","PLR","Férias","Renda Extra"];\
    var despCats = ["Luz","Internet","Estacionamento","Cartão Will","Cartão Sá","Celular","Areia","Unha mão"];\
    var target = tipo === "Receita" ? recCats : despCats;\
    for (var i = 0; i < selCat.options.length; i++) {\
      if (target.indexOf(selCat.options[i].value) >= 0) { selCat.selectedIndex = i; break; }\
    }\
    var selStatus = document.getElementById("status");\
    selStatus.innerHTML = "";\
    if (tipo === "Receita") {\
      selStatus.add(new Option("🔵 A Receber", "A Receber"));\
      selStatus.add(new Option("✅ Recebido", "Recebido"));\
    } else {\
      selStatus.add(new Option("🔴 A Pagar", "A Pagar"));\
      selStatus.add(new Option("✅ Pago", "Pago"));\
    }\
  }\
\
  function toast(id, ms) {\
    var el = document.getElementById(id); el.style.display = "block";\
    setTimeout(function() { el.style.display = "none"; }, ms || 2500);\
  }\
\
  function enviar() {\
    var d = {\
      tipo: document.getElementById("tipo").value,\
      data: document.getElementById("data").value,\
      descricao: document.getElementById("categoria").value,\
      categoria: document.getElementById("categoria").value,\
      responsavel: document.getElementById("responsavel").value,\
      ciclo: document.getElementById("ciclo").value,\
      valor: document.getElementById("valor").value,\
      status: document.getElementById("status").value\
    };\
    if (!d.valor || !d.data) { toast("toast-err"); return; }\
    var btn = document.getElementById("btnGo");\
    btn.disabled = true; btn.textContent = "⏳ Salvando...";\
    google.script.run\
      .withSuccessHandler(function() {\
        contagem++;\
        toast("toast-ok");\
        document.getElementById("valor").value = "";\
        document.getElementById("counter").textContent = contagem + " lançamento(s) adicionado(s) nesta sessão";\
        btn.disabled = false; btn.textContent = "✅ Adicionar Lançamento";\
        document.getElementById("valor").focus();\
      })\
      .withFailureHandler(function(err) {\
        alert("Erro: " + err.message);\
        btn.disabled = false; btn.textContent = "✅ Adicionar Lançamento";\
      })\
      .adicionarLancamento(d);\
  }\
\
  document.addEventListener("keydown", function(e) {\
    if (e.key === "Enter" && !document.getElementById("btnGo").disabled) enviar();\
  });\
</script>\
</body>\
</html>';

  var html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(420)
    .setHeight(620)
    .setTitle('Novo Lançamento');

  SpreadsheetApp.getUi().showSidebar(html);
}
