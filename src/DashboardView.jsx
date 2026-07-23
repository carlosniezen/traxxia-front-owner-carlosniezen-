import React from 'react';

// Spec §4.6 — unidades vs meta, tendencia 4 semanas, ranking personal,
// insight destacado, racha de días libres. Plus the §2 care message on risk.
function TrendBars({ trend, goal }) {
  const max = Math.max(goal, ...trend, 1);
  const labels = ['-3 sem', '-2 sem', '-1 sem', 'Esta sem'];
  return (
    <div className="trend">
      {trend.map((v, i) => (
        <div className="trend-col" key={i}>
          <div className="trend-track">
            <div className="goal-line" style={{ bottom: `${(goal / max) * 100}%` }} />
            <div className={'trend-bar' + (v > goal ? ' over' : '')} style={{ height: `${(v / max) * 100}%` }} />
          </div>
          <span className="trend-val">{v}</span>
          <span className="trend-lbl">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardView({ dashboard, tolerance }) {
  if (!dashboard) return null;
  const { week_units, weekly_goal, over_goal, trend, free_streak, insight, risk } = dashboard;
  const ranked = tolerance ?? [];
  const best = ranked.slice(0, 3);
  const worst = ranked.slice(-3).reverse();

  return (
    <section className="view">
      <h2 className="view-title">Tu semana</h2>

      {risk?.at_risk && (
        <div className="care-card">
          <span className="big-icon">💛</span>
          <div>
            <p>{risk.message}</p>
            <div className="care-links">
              {risk.links.map((l, i) => l.url
                ? <a key={i} href={l.url} target="_blank" rel="noreferrer">{l.label} ↗</a>
                : <span key={i} className="care-note">{l.label}</span>)}
            </div>
          </div>
        </div>
      )}

      <div className="stat-row">
        <div className={'stat-card' + (over_goal ? ' warn' : '')}>
          <div className="stat-num">{week_units}<span className="stat-den"> / {weekly_goal}</span></div>
          <div className="stat-label">unidades esta semana</div>
          {over_goal && <div className="stat-flag">Sobre tu meta</div>}
        </div>
        <div className="stat-card good">
          <div className="stat-num">{free_streak}</div>
          <div className="stat-label">días libres de alcohol 🔥</div>
        </div>
      </div>

      {insight && (
        <div className="insight-card">
          <span className="big-icon">💡</span>
          <p>{insight.text}</p>
        </div>
      )}

      <h3 className="sub-h">Tendencia (4 semanas)</h3>
      <TrendBars trend={trend} goal={weekly_goal} />

      <div className="rank-cols">
        <div>
          <h3 className="sub-h">Te cae mejor</h3>
          {best.map((c) => <RankRow key={c.key} c={c} tone="good" />)}
        </div>
        <div>
          <h3 className="sub-h">Te cae peor</h3>
          {worst.map((c) => <RankRow key={c.key} c={c} tone="bad" />)}
        </div>
      </div>
    </section>
  );
}

function RankRow({ c, tone }) {
  return (
    <div className="rank-row">
      <span className="rank-icon">{c.icon}</span>
      <span className="rank-name">{c.name}</span>
      <span className={'rank-score ' + tone}>{c.score}</span>
      <span className={'rank-basis' + (c.basis === 'personal' ? ' personal' : '')}>{c.label}</span>
    </div>
  );
}
