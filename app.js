const sampleCsv = `date,symbol,side,entry_price,exit_price,pnl,return_pct,result
2024-01-02,AAPL,long,190.1,195.8,5.7,3.00,win
2024-01-03,MSFT,long,430.2,426.5,-3.7,-0.86,loss
2024-01-05,TSLA,short,248.0,236.4,11.6,4.68,win
2024-01-09,NVDA,long,658.5,645.0,-13.5,-2.05,loss
2024-01-12,AMZN,long,182.7,188.4,5.7,3.12,win
2024-01-16,GOOGL,short,145.2,150.7,-5.5,-3.79,loss
2024-01-20,META,long,450.4,462.9,12.5,2.77,win
2024-01-25,AMD,long,150.2,147.1,-3.1,-2.06,loss
2024-01-29,SHOP,short,68.7,64.1,4.6,6.69,win
2024-02-02,CRM,long,290.0,286.5,-3.5,-1.21,loss
2024-02-06,ORCL,long,116.7,120.8,4.1,3.51,win
2024-02-10,NFLX,long,612.0,598.9,-13.1,-2.14,loss
2024-02-14,PLTR,long,28.3,31.4,3.1,10.96,win
2024-02-18,INTC,long,55.0,53.2,-1.8,-3.27,loss
2024-02-20,ABNB,short,145.8,141.2,4.6,3.16,win
2024-02-24,TTD,long,70.5,68.9,-1.6,-2.27,loss
2024-03-01,NASDAQ,long,16.9,17.5,0.6,3.55,win
2024-03-04,SPY,short,520.0,514.6,5.4,1.04,win
2024-03-08,DIS,long,108.7,100.8,-7.9,-7.27,loss
2024-03-10,UBER,short,60.2,58.1,2.1,3.49,win
2024-03-14,AMD,long,152.2,146.8,-5.4,-3.55,loss
2024-03-17,NKE,long,101.8,106.3,4.5,4.42,win
2024-03-21,ADBE,long,560.0,551.1,-8.9,-1.59,loss
2024-03-25,COST,long,720.4,734.9,14.5,2.01,win`;

const state = {
  trades: [],
};

const els = {
  csvFile: document.getElementById('csvFile'),
  loadSampleBtn: document.getElementById('loadSampleBtn'),
  runSimulationBtn: document.getElementById('runSimulationBtn'),
  totalTrades: document.getElementById('totalTrades'),
  winRate: document.getElementById('winRate'),
  profitFactor: document.getElementById('profitFactor'),
  avgTrade: document.getElementById('avgTrade'),
  chanceOfProfitValue: document.getElementById('chanceOfProfitValue'),
  chanceOfTargetValue: document.getElementById('chanceOfTargetValue'),
  chanceOfLossValue: document.getElementById('chanceOfLossValue'),
  chanceOfPositiveSeriesValue: document.getElementById('chanceOfPositiveSeriesValue'),
  chanceOfProfitBar: document.getElementById('chanceOfProfitBar'),
  chanceOfTargetBar: document.getElementById('chanceOfTargetBar'),
  chanceOfLossBar: document.getElementById('chanceOfLossBar'),
  chanceOfPositiveSeriesBar: document.getElementById('chanceOfPositiveSeriesBar'),
  expectedEquityValue: document.getElementById('expectedEquityValue'),
  probabilityPositiveOutcome: document.getElementById('probabilityPositiveOutcome'),
  bestCaseValue: document.getElementById('bestCaseValue'),
  worstCaseValue: document.getElementById('worstCaseValue'),
  tradeTableBody: document.getElementById('tradeTableBody'),
  profitTarget: document.getElementById('profitTarget'),
  lossLimit: document.getElementById('lossLimit'),
  simTrades: document.getElementById('simTrades'),
};

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/);
  if (!rows.length) return [];

  const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const values = rows.slice(1).filter(Boolean).map(row => {
    const cells = row.split(',').map(c => c.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = cells[index] ?? '';
    });
    return obj;
  });

  return values
    .map((row) => {
      const pnl = Number(row.pnl ?? row['profit_loss'] ?? row['net_pnl'] ?? 0);
      const returnPct = Number(row.return_pct ?? row['pct_return'] ?? row['performance'] ?? 0);
      const side = (row.side ?? 'long').toLowerCase();
      const symbol = row.symbol ?? 'UNKNOWN';
      const date = row.date ?? '';
      const result = (row.result ?? (pnl >= 0 ? 'win' : 'loss')).toLowerCase();

      return {
        date,
        symbol,
        side,
        pnl: Number.isFinite(pnl) ? pnl : 0,
        returnPct: Number.isFinite(returnPct) ? returnPct : 0,
        result,
      };
    })
    .filter((trade) => trade.symbol && Number.isFinite(trade.pnl));
}

function getTradeMetrics(trades) {
  if (!trades.length) {
    return {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      avgTrade: 0,
      chanceOfProfit: 0,
      chanceTarget: 0,
      chanceLoss: 0,
      expectedValue: 0,
      positiveSeriesChance: 0,
      returns: [],
      wins: 0,
      losses: 0,
      grossProfit: 0,
      grossLoss: 0,
    };
  }

  const totalTrades = trades.length;
  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl < 0).length;
  const grossProfit = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const avgTrade = trades.reduce((sum, t) => sum + t.pnl, 0) / totalTrades;
  const winRate = (wins / totalTrades) * 100;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Number.POSITIVE_INFINITY : 0;
  const returns = trades.map(t => Number(t.returnPct ?? (t.pnl / Math.max(t.pnl * 0.5, 1))));

  const targetPct = Number(els.profitTarget.value || 0);
  const stopPct = Number(els.lossLimit.value || 0);
  const targetHits = trades.filter(t => Number(t.returnPct) >= targetPct).length;
  const stopHits = trades.filter(t => Number(t.returnPct) <= stopPct).length;

  const consecutiveWins = trades.reduce((best, trade) => {
    if (trade.pnl > 0) {
      return { current: best.current + 1, best: Math.max(best.best, best.current + 1) };
    }
    return { current: 0, best: best.best };
  }, { current: 0, best: 0 }).best;

  return {
    totalTrades,
    winRate,
    profitFactor,
    avgTrade,
    chanceOfProfit: (wins / totalTrades) * 100,
    chanceTarget: (targetHits / totalTrades) * 100,
    chanceLoss: (stopHits / totalTrades) * 100,
    expectedValue: avgTrade,
    positiveSeriesChance: totalTrades > 0 ? ((consecutiveWins / totalTrades) * 100) : 0,
    returns,
    wins,
    losses,
    grossProfit,
    grossLoss,
  };
}

function renderTable(trades) {
  els.tradeTableBody.innerHTML = trades
    .slice(0, 20)
    .map((trade) => {
      const pnlValue = Number(trade.pnl ?? 0);
      const cellClass = pnlValue >= 0 ? 'win' : 'loss';
      return `
        <tr>
          <td>${trade.date || 'N/A'}</td>
          <td>${trade.symbol}</td>
          <td>${trade.side}</td>
          <td class="${cellClass}">${(Number(trade.returnPct ?? 0)).toFixed(2)}%</td>
          <td class="${cellClass}">${trade.result === 'win' ? 'Win' : 'Loss'}</td>
        </tr>
      `;
    })
    .join('');
}

function setBar(barEl, value) {
  const safeValue = Math.min(Math.max(value, 0), 100);
  barEl.style.width = `${safeValue}%`;
}

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function updateDashboard(trades) {
  const metrics = getTradeMetrics(trades);

  els.totalTrades.textContent = metrics.totalTrades;
  els.winRate.textContent = `${metrics.winRate.toFixed(1)}%`;
  els.profitFactor.textContent = Number.isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : '0.00';
  els.avgTrade.textContent = `${metrics.avgTrade.toFixed(2)}%`;

  setBar(els.chanceOfProfitBar, metrics.chanceOfProfit);
  setBar(els.chanceOfTargetBar, metrics.chanceTarget);
  setBar(els.chanceOfLossBar, metrics.chanceLoss);
  setBar(els.chanceOfPositiveSeriesBar, metrics.positiveSeriesChance);

  els.chanceOfProfitValue.textContent = `${metrics.chanceOfProfit.toFixed(1)}%`;
  els.chanceOfTargetValue.textContent = `${metrics.chanceTarget.toFixed(1)}%`;
  els.chanceOfLossValue.textContent = `${metrics.chanceLoss.toFixed(1)}%`;
  els.chanceOfPositiveSeriesValue.textContent = `${metrics.positiveSeriesChance.toFixed(1)}%`;

  renderTable(trades);
  runMonteCarlo(trades);
}

function loadTradesFromCsv(text) {
  const parsed = parseCsv(text);
  state.trades = parsed;
  updateDashboard(state.trades);
}

function runMonteCarlo(trades) {
  if (!trades.length) {
    els.expectedEquityValue.textContent = '$0.00';
    els.probabilityPositiveOutcome.textContent = '0%';
    els.bestCaseValue.textContent = '$0.00';
    els.worstCaseValue.textContent = '$0.00';
    return;
  }

  const returns = trades.map(t => Number(t.returnPct || t.pnl || 0) / 100);
  const simulationTrades = Math.max(1, Number(els.simTrades.value || 30));
  const iterations = 1500;
  const outcomes = [];

  for (let i = 0; i < iterations; i += 1) {
    let equity = 1000;
    for (let j = 0; j < simulationTrades; j += 1) {
      const randomReturn = returns[Math.floor(Math.random() * returns.length)] || 0;
      equity *= 1 + randomReturn;
    }
    outcomes.push(equity);
  }

  const positiveEnding = outcomes.filter(value => value > 1000).length;
  const meanEquity = outcomes.reduce((sum, value) => sum + value, 0) / outcomes.length;
  const bestCase = Math.max(...outcomes);
  const worstCase = Math.min(...outcomes);

  els.expectedEquityValue.textContent = formatMoney(meanEquity);
  els.probabilityPositiveOutcome.textContent = `${((positiveEnding / iterations) * 100).toFixed(1)}%`;
  els.bestCaseValue.textContent = formatMoney(bestCase);
  els.worstCaseValue.textContent = formatMoney(worstCase);
}

els.loadSampleBtn.addEventListener('click', () => {
  loadTradesFromCsv(sampleCsv);
});

els.csvFile.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => loadTradesFromCsv(String(e.target?.result ?? ''));
  reader.readAsText(file);
});

els.runSimulationBtn.addEventListener('click', () => {
  runMonteCarlo(state.trades);
});

window.addEventListener('DOMContentLoaded', () => {
  loadTradesFromCsv(sampleCsv);
});
