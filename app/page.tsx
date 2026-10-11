"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, Check, ChevronDown, ExternalLink, Fish, Globe2, LoaderCircle, LockKeyhole, Search, Sparkles, Target, TestTube2 } from "lucide-react";

type Source = { title: string; url: string; snippet?: string; primitive: string };
type Scenario = { name: string; commitment: number; margin: number; adoption: number; churn: number; description: string };
type Analysis = { mode: "live" | "demo"; recommendation: string; rationale: string; confidence: string; recommendedScenario: string; architecture: string; signals: Array<{ label: string; value: string; status: string }>; scenarios: Scenario[]; experiment: { hypothesis: string; control: string; variant: string; primary: string; guardrails: string[] }; sources: Source[]; agentEvidence?: string; warnings?: string[] };

const defaults = { company: "LangChain", product: "LangSmith portfolio", description: "Observability, evaluations, deployment, Fleet, Engine, sandboxes, and LLM gateway for teams building production agents.", pricingUrl: "https://www.langchain.com/pricing", segment: "Growth-stage AI engineering teams", monthlyCommitment: 12000, monthlyCost: 2600, creditUtilization: 68, multiProductAdoption: 42, annualChurn: 9, targetMargin: 78, experimentLift: 11 };
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Metric({ label, value, onChange, suffix, hint, min = 0, max }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; hint?: string; min?: number; max?: number }) {
  return <Field label={label} hint={hint}><div className="metric-input"><input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />{suffix && <b>{suffix}</b>}</div></Field>;
}

export default function Home() {
  const [form, setForm] = useState(defaults);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [stage, setStage] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const liveMargin = useMemo(() => Math.round((1 - form.monthlyCost / Math.max(form.monthlyCommitment, 1)) * 100), [form.monthlyCost, form.monthlyCommitment]);
  const update = (key: keyof typeof defaults, value: string | number) => setForm((current) => ({ ...current, [key]: value }));

  async function runAnalysis(live: boolean) {
    setError(""); setAnalysis(null); setStage(1);
    const timers = [window.setTimeout(() => setStage(2), 850), window.setTimeout(() => setStage(3), 1800), window.setTimeout(() => setStage(4), 3100)];
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, apiKey: live ? apiKey : "", demo: !live }) });
      const result = await response.json() as Analysis & { error?: string };
      if (!response.ok) throw new Error(result.error || "Analysis failed");
      setStage(4); setAnalysis(result);
      window.setTimeout(() => document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) { setError(err instanceof Error ? err.message : "Analysis failed"); setStage(0); }
    finally { timers.forEach(window.clearTimeout); }
  }

  const stages = [[Search, "Search", "Discovering pricing alternatives"], [Globe2, "Fetch", "Normalizing public evidence"], [Sparkles, "Agent", "Operating the pricing experience"], [BarChart3, "Model", "Testing package scenarios"]] as const;

  return <main>
    <nav className="nav shell"><a className="brand" href="#top" aria-label="PriceLab home"><span><Fish size={19} /></span> PriceLab</a><div className="nav-meta"><span className="pulse" /> TinyFish-powered market evidence</div></nav>
    <section className="hero shell" id="top">
      <div className="eyebrow"><Sparkles size={14} /> AGENTIC MONETIZATION INTELLIGENCE</div>
      <h1>Stop pricing from<br /><em>the rear-view mirror.</em></h1>
      <p>Connect live market evidence to how customers adopt, consume, renew, and expand—then learn which packaging hypothesis to test next.</p>
      <div className="hero-chips"><span><Search size={14} /> Live market</span><span><BarChart3 size={14} /> Unit economics</span><span><TestTube2 size={14} /> Experiment design</span></div>
    </section>

    <section className="workspace shell">
      <div className="workspace-head"><div><span>01</span><h2>Frame the decision</h2><p>Public evidence stays separate from private assumptions.</p></div><div className="demo-pill">LANGSMITH DEMO</div></div>
      <div className="form-grid">
        <div className="form-card">
          <div className="card-kicker"><Target size={16} /> Market context</div>
          <div className="two-col"><Field label="Company"><input value={form.company} onChange={(e) => update("company", e.target.value)} /></Field><Field label="Product portfolio"><input value={form.product} onChange={(e) => update("product", e.target.value)} /></Field></div>
          <Field label="What customers buy"><textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} /></Field>
          <div className="two-col"><Field label="Pricing page"><input value={form.pricingUrl} onChange={(e) => update("pricingUrl", e.target.value)} /></Field><Field label="Target segment"><input value={form.segment} onChange={(e) => update("segment", e.target.value)} /></Field></div>
        </div>
        <div className="form-card warm">
          <div className="card-kicker"><LockKeyhole size={16} /> Illustrative internal inputs</div>
          <div className="metric-grid">
            <Metric label="Monthly commitment" value={form.monthlyCommitment} onChange={(n) => update("monthlyCommitment", n)} suffix="$" />
            <Metric label="Monthly cost to serve" value={form.monthlyCost} onChange={(n) => update("monthlyCost", n)} suffix="$" />
            <Metric label="Credit utilization" value={form.creditUtilization} onChange={(n) => update("creditUtilization", n)} suffix="%" max={100} />
            <Metric label="Multi-product adoption" value={form.multiProductAdoption} onChange={(n) => update("multiProductAdoption", n)} suffix="%" max={100} />
            <Metric label="Annual churn" value={form.annualChurn} onChange={(n) => update("annualChurn", n)} suffix="%" max={100} />
            <Metric label="Target gross margin" value={form.targetMargin} onChange={(n) => update("targetMargin", n)} suffix="%" max={100} />
            <Metric label="Winning experiment lift" value={form.experimentLift} onChange={(n) => update("experimentLift", n)} suffix="%" hint="Activation or conversion lift" />
            <div className="margin-readout"><span>Current modeled margin</span><strong className={liveMargin >= form.targetMargin ? "good" : "bad"}>{liveMargin}%</strong></div>
          </div>
          <p className="privacy-note"><LockKeyhole size={13} /> Use synthetic or authorized data. No internal metrics are sent to TinyFish research queries.</p>
        </div>
      </div>
      <div className="run-panel">
        <button className="key-toggle" onClick={() => setShowKey(!showKey)}><ChevronDown size={15} className={showKey ? "rotated" : ""} /> Run on live TinyFish primitives</button>
        {showKey && <div className="key-row"><input type="password" placeholder="TinyFish API key (used for this run only)" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /><button disabled={!apiKey || (stage > 0 && !analysis)} onClick={() => runAnalysis(true)}>Run live <ArrowRight size={16} /></button></div>}
        <button className="demo-button" disabled={stage > 0 && !analysis} onClick={() => runAnalysis(false)}>{stage > 0 && !analysis ? <><LoaderCircle className="spin" size={17} /> Running workflow</> : <>Explore with demo data <ArrowRight size={17} /></>}</button>
        <p>Demo mode shows the full decision model. Add a key to replace sample evidence with live Search, Fetch, and Agent results.</p>
      </div>
      {(stage > 0 || error) && <div className="progress-wrap">{stages.map(([Icon, name, text], index) => <div className={`progress-step ${stage > index ? "active" : ""}`} key={name}><div>{stage > index + 1 || analysis ? <Check size={16} /> : stage === index + 1 ? <LoaderCircle className="spin" size={16} /> : <Icon size={16} />}</div><span><b>{name}</b><small>{text}</small></span></div>)}{error && <div className="error">{error}</div>}</div>}
    </section>
    {analysis && <Results analysis={analysis} company={form.company} />}
    <footer className="shell"><div className="brand"><span><Fish size={18} /></span> PriceLab</div><p>Facts, assumptions, and inferences stay labeled. Recommendations are hypotheses—not guarantees.</p></footer>
  </main>;
}

function Results({ analysis, company }: { analysis: Analysis; company: string }) {
  return <section id="results" className="results shell">
    <div className="results-head"><div><span>02</span><h2>Decision memo</h2><p>For {company} · generated from {analysis.mode === "live" ? "live public evidence" : "an illustrative evidence set"}</p></div><div className={`mode-badge ${analysis.mode}`}>{analysis.mode === "live" ? "LIVE RUN" : "DEMO RUN"}</div></div>
    <div className="recommendation"><div className="rec-label"><Sparkles size={15} /> RECOMMENDED ARCHITECTURE</div><h3>{analysis.recommendation}</h3><p>{analysis.rationale}</p><div className="rec-meta"><span>Architecture <b>{analysis.architecture}</b></span><span>Confidence <b>{analysis.confidence}</b></span></div></div>
    <div className="signal-grid">{analysis.signals.map((signal) => <div className="signal" key={signal.label}><span>{signal.label}</span><strong>{signal.value}</strong><small className={signal.status}>{signal.status}</small></div>)}</div>
    <div className="section-title"><span>03</span><h2>Scenario comparison</h2></div>
    <div className="scenario-grid">{analysis.scenarios.map((scenario) => { const recommended = scenario.name === analysis.recommendedScenario; return <article className={recommended ? "scenario recommended" : "scenario"} key={scenario.name}>{recommended && <div className="best">RECOMMENDED</div>}<h3>{scenario.name}</h3><p>{scenario.description}</p><dl><div><dt>Commitment</dt><dd>{fmt.format(scenario.commitment)}<small>/mo</small></dd></div><div><dt>Gross margin</dt><dd>{scenario.margin}%</dd></div><div><dt>Adoption</dt><dd>{scenario.adoption}%</dd></div><div><dt>Churn risk</dt><dd>{scenario.churn}%</dd></div></dl></article>})}</div>
    <div className="experiment-card"><div><div className="card-kicker"><TestTube2 size={16} /> NEXT BEST TEST</div><h3>{analysis.experiment.hypothesis}</h3></div><div className="test-split"><div><span>CONTROL</span><p>{analysis.experiment.control}</p></div><div><span>VARIANT</span><p>{analysis.experiment.variant}</p></div></div><div className="test-foot"><span>Primary metric <b>{analysis.experiment.primary}</b></span><span>Guardrails <b>{analysis.experiment.guardrails.join(" · ")}</b></span></div></div>
    <div className="evidence"><div className="section-title"><span>04</span><h2>Evidence ledger</h2></div><div className="evidence-list">{analysis.sources.map((source, index) => <a href={source.url} target="_blank" rel="noreferrer" key={`${source.url}-${index}`}><div className="source-number">{String(index + 1).padStart(2, "0")}</div><div><h4>{source.title}</h4><p>{source.snippet || "Public market evidence"}</p></div><span className="primitive">{source.primitive}</span><ExternalLink size={15} /></a>)}</div>{analysis.agentEvidence && <details><summary>Agent observation</summary><pre>{analysis.agentEvidence}</pre></details>}{analysis.warnings?.map((warning) => <p className="warning" key={warning}>{warning}</p>)}</div>
  </section>;
}
