"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api, request, type Report, type Vital, type Summary, type Doctor, type Slot, type Appointment } from "@/services/api";
import "./workspace.css";

const metrics: Record<string, string> = {heart_rate:"Heart rate",bp:"Blood pressure",glucose:"Glucose",weight:"Weight"};
const units: Record<string,string> = {heart_rate:"bpm",bp:"mmHg",glucose:"mg/dL",weight:"kg"};
const date = (value:string) => new Date(value).toLocaleString([], {dateStyle:"medium",timeStyle:"short"});
export function Workspace({view, reportId}:{view:string;reportId?:string}) {
  const router = useRouter();
  const [name,setName] = useState("");
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [reports,setReports] = useState<Report[]>([]);
  const [report,setReport] = useState<Report|null>(null);
  const [summaries,setSummaries] = useState<Summary[]>([]);
  const [vitals,setVitals] = useState<Vital[]>([]);
  const [doctors,setDoctors] = useState<Doctor[]>([]);
  const [appointments,setAppointments] = useState<Appointment[]>([]);
  const [doctor,setDoctor] = useState("");
  const [slots,setSlots] = useState<Slot[]>([]);
  const [slot,setSlot] = useState("");
  const [range,setRange] = useState("7d");
  const [metric,setMetric] = useState("heart_rate");
  const [explanation,setExplanation] = useState("");
  const auth = view === "login" || view === "register";

  useEffect(() => {
    if (auth) return;
    if (!sessionStorage.getItem("pulse-access")) {router.replace("/login");return;}
    let active = true;
    Promise.all([
      api<{full_name:string}>("/auth/me"),
      api<Report[]>("/reports"),
      api<Summary[]>("/vitals/summary"),
      api<Appointment[]>("/appointments"),
      view === "appointments" ? api<Doctor[]>("/doctors") : Promise.resolve([]),
      reportId ? api<Report>("/reports/"+reportId) : Promise.resolve(null)
    ]).then(([user,rs,ss,aa,dd,rr]) => {
      if (!active) return;
      setName(user.full_name);setReports(rs);setSummaries(ss);setAppointments(aa);setDoctors(dd);setReport(rr);
      setExplanation(rr?.explanation?.details.full_text || "");
    }).catch(e=>active && setError(e.message)).finally(()=>active && setLoading(false));
    return ()=>{active=false;};
  },[auth,view,reportId,router]);

  useEffect(()=>{
    if(view!=="vitals" || !sessionStorage.getItem("pulse-access")) return;
    let active=true;
    api<Vital[]>("/vitals?range="+range+"&type="+metric).then(data=>{if(active)setVitals(data);}).catch(e=>{if(active)setError(e.message);});
    return ()=>{active=false;};
  },[view,range,metric]);

  useEffect(()=>{
    if(!doctor)return;
    let active=true;
    api<Slot[]>("/doctors/"+doctor+"/slots").then(data=>{if(active)setSlots(data.filter(s=>new Date(s.starts_at)>new Date()));}).catch(e=>{if(active)setError(e.message);});
    return ()=>{active=false;};
  },[doctor]);

  async function perform(action:()=>Promise<void>) {
    setBusy(true);setError("");setNotice("");
    try {await action();} catch(e) {setError(e instanceof Error?e.message:"Something went wrong. Please try again.");}
    finally {setBusy(false);}
  }
  async function authenticate(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const data=new FormData(event.currentTarget);
    await perform(async()=>{
      const result=await api<{access_token:string}>("/auth/"+view,{method:"POST",body:JSON.stringify(Object.fromEntries(data))});
      sessionStorage.setItem("pulse-access",result.access_token);router.push("/dashboard");
    });
  }
  async function upload(file:File|undefined) {
    if(!file)return;
    await perform(async()=>{
      if(file.size>10*1024*1024)throw new Error("Choose a file smaller than 10 MB.");
      const data=new FormData();data.set("file",file);
      const saved=await api<Report>("/reports",{method:"POST",body:data});
      router.push("/reports/"+saved.id);
    });
  }
  async function explain() {
    await perform(async()=>{
      setExplanation("");
      const response=await request("/reports/"+reportId+"/explain");
      const reader=response.body?.getReader();if(!reader)throw new Error("The stream could not start.");
      const decoder=new TextDecoder();let buffer="";
      while(true){
        const chunk=await reader.read();if(chunk.done)break;
        buffer+=decoder.decode(chunk.value,{stream:true});
        const events=buffer.split("\n\n");buffer=events.pop() || "";
        for(const event of events){
          const line=event.split("\n").find(line=>line.startsWith("data: "));
          if(!line || line.slice(6)==="[DONE]")continue;
          const data=JSON.parse(line.slice(6));
          if(data.error)throw new Error("The explanation could not finish. Please retry.");
          if(data.token)setExplanation(text=>text+data.token);
        }
      }
      setReport(await api<Report>("/reports/"+reportId));
    });
  }
  const uploadControl=<label className="primary upload">{busy?"Uploading…":"＋ Upload report"}<input disabled={busy} type="file" accept=".pdf,.png,.jpg,.jpeg,.tiff" onChange={e=>upload(e.target.files?.[0])}/></label>;
  if(auth) return <div className="pulse-app auth-page"><Link className="wordmark" href="/">pulse<span>OS</span></Link><div className="auth-card"><p className="eyebrow">YOUR HEALTH. YOUR SPACE.</p><h1>{view==="login"?"Welcome back.":"A clearer picture starts here."}</h1><p className="muted">Your reports, readings, and care. Together.</p><form onSubmit={authenticate}>{view==="register"&&<label>Full name<input name="full_name" required autoComplete="name"/></label>}<label>Email address<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" minLength={8} required autoComplete={view==="login"?"current-password":"new-password"}/></label><button className="primary" disabled={busy}>{busy?"Please wait…":view==="login"?"Sign in →":"Create account →"}</button></form>{error&&<p role="alert" className="error">{error}</p>}<p className="muted">{view==="login"?"New to PulseOS?":"Already have an account?"} <Link href={view==="login"?"/register":"/login"}>{view==="login"?"Create an account":"Sign in"}</Link></p></div><p className="footnote">Portfolio demonstration · Use synthetic health data only</p></div>;

  return <div className="pulse-app"><aside className="sidebar"><Link href="/" className="wordmark">pulse<span>OS</span></Link><p className="eyebrow">YOUR PERSONAL SPACE</p><nav>{["dashboard","reports","vitals","appointments"].map((item,i)=><Link aria-current={view===item?"page":undefined} className={view===item?"active":""} key={item} href={"/"+item}><span aria-hidden="true">{["◫","▤","⌁","◷"][i]}</span>{item==="dashboard"?"Overview":item[0].toUpperCase()+item.slice(1)}</Link>)}</nav><div className="sidebar-bottom"><div className="avatar">{name.slice(0,1)||"P"}</div><p>{name||"Your account"}</p><button onClick={()=>{sessionStorage.removeItem("pulse-access");router.push("/login");}}>Sign out</button></div></aside><main className="workspace"><header className="topbar"><span>Personal health companion</span><span className="pill">Portfolio demo</span></header>{error&&<div className="error" role="alert">{error} <Link href="/login">Sign in again</Link></div>}{notice&&<p role="status" className="success">{notice}</p>}
    <section className="page-heading"><div><p className="eyebrow">{view==="dashboard"?"A LITTLE CLARITY, EVERY DAY":"YOUR HEALTH, IN PLAIN LANGUAGE"}</p><h1>{({dashboard:"Your health, together.",reports:reportId?"Understand your results.":"Every report. More clarity.",vitals:"Small readings. Bigger picture.",appointments:"Your next step in care."})[view]}</h1><p className="muted">{view==="dashboard"?"Welcome"+(name?", "+name.split(" ")[0]:"")+". Here’s your personal overview.":"A calm space to understand, track, and plan."}</p></div>{(view==="dashboard"||view==="reports")&&!reportId&&uploadControl}</section>
    {loading?<div className="panel" role="status">Loading your health space…</div>:<>
    {view==="dashboard"&&<><div className="dashboard-grid"><section className="panel score-card"><p className="eyebrow">YOUR HEALTH SCORE</p><div className="score-ring"><strong>{summaries[0]?.health_score??"—"}</strong><span>out of 100</span></div><h2>A moment of perspective.</h2><p className="muted">A simple summary of logged readings. An educational indicator, not a medical assessment.</p><Link href="/vitals">Explore your readings ↗</Link></section><section className="panel light-card"><p className="eyebrow">LESS JARGON. MORE UNDERSTANDING.</p><h2>Your report.<br/>In plain language.</h2><p>Bring your lab results into focus with explanations you can take to your doctor.</p><Link className="dark-button" href="/reports">Explore reports →</Link><div className="report-art"><span>LAB REPORT</span><i/><i/><i/><b>Clarity starts here.</b></div></section><section className="panel"><p className="eyebrow">RECENT REPORT</p>{reports[0]?<Link href={"/reports/"+reports[0].id}><h2>{reports[0].filename}</h2><p className="muted">{date(reports[0].created_at)}</p><span className="pill">{reports[0].status}</span></Link>:<><h2>A fresh start.</h2><p className="muted">Upload a sample report to begin.</p></>}</section><section className="panel"><p className="eyebrow">UPCOMING CARE</p>{appointments.filter(a=>a.status==="confirmed")[0]?<><h2>{appointments.filter(a=>a.status==="confirmed")[0].doctor.name}</h2><p className="muted">{date(appointments.filter(a=>a.status==="confirmed")[0].slot.starts_at)}</p></>:<><h2>Make room for care.</h2><p className="muted">Choose a doctor and a time that suits you.</p></>}<Link href="/appointments">View appointments →</Link></section></div></>}
    {view==="reports"&&!reportId&&<section className="panel"><div className="section-title"><h2>Your report library</h2><span className="muted">{reports.length} reports</span></div>{reports.length?reports.map(r=><Link className="list-row" key={r.id} href={"/reports/"+r.id}><div><strong>{r.filename}</strong><p className="muted">{date(r.created_at)}</p></div><span className="pill">{r.status} ↗</span></Link>):<div className="empty"><h2>Your first insight is one upload away.</h2><p>Choose a sample PDF or image up to 10 MB.</p></div>}</section>}
    {view==="reports"&&reportId&&<div className="split"><section className="panel"><p className="eyebrow">STRUCTURED RESULTS</p><h2>{report?.filename}</h2><div className="table-wrap"><table><thead><tr><th>Biomarker</th><th>Result</th><th>Reference</th></tr></thead><tbody>{report?.values?.map(v=><tr key={v.id}><td>{v.test_name}<small>{v.status}</small></td><td>{v.value} {v.unit}</td><td>{v.ref_low??"—"} – {v.ref_high??"—"}</td></tr>)}</tbody></table></div>{!report?.values?.length&&<p className="muted">Choose Explain report to extract the results.</p>}</section><section className="panel"><p className="eyebrow">YOUR PLAIN-LANGUAGE GUIDE</p><h2>Let’s make sense of it.</h2><button className="primary" disabled={busy} onClick={explain}>{busy?"Reading your report…":"Explain report →"}</button><div className="explanation" aria-live="polite">{explanation||"Your explanation will appear here."}</div><p className="footnote">PulseOS provides educational explanations. Discuss results and treatment decisions with a qualified clinician.</p></section></div>}
    {view==="vitals"&&<><div className="metric-grid">{Object.entries(metrics).map(([key,label])=><button className={"panel metric "+(metric===key?"selected":"")} onClick={()=>setMetric(key)} key={key}><span>{label}</span><strong>{summaries.find(s=>s.type===key)?.latest??"—"} <small>{units[key]}</small></strong><span className="muted">Latest reading</span></button>)}</div><div className="split"><section className="panel"><div className="section-title"><h2>{metrics[metric]}</h2><div className="segments">{["7d","30d"].map(r=><button aria-pressed={range===r} className={range===r?"chosen":""} key={r} onClick={()=>setRange(r)}>{r==="7d"?"7 days":"30 days"}</button>)}</div></div>{vitals.length?<div style={{height:280}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={vitals.map(v=>({...v,label:new Date(v.recorded_at).toLocaleDateString()}))}><XAxis dataKey="label" stroke="#8B93A1"/><Tooltip contentStyle={{background:"#12161D",borderRadius:12}}/><Area type="monotone" dataKey="value_1" stroke="#5EE1D2" fill="#5EE1D2" fillOpacity={0.08} isAnimationActive={false}/>{metric==="bp"&&<Area dataKey="value_2" stroke="#FFB86B" fill="transparent" isAnimationActive={false}/>}</AreaChart></ResponsiveContainer></div>:<div className="empty">Log a reading to start your trend.</div>}<div className="reading-list">{vitals.slice(-5).reverse().map(v=><div className="list-row" key={v.id}><span>{date(v.recorded_at)}</span><strong>{v.value_1}{v.value_2?"/"+v.value_2:""} {units[metric]}</strong></div>)}</div></section><section className="panel"><p className="eyebrow">BUILD A HEALTHIER HABIT</p><h2>Log a reading.</h2><form onSubmit={e=>{e.preventDefault();const form=e.currentTarget;const data=new FormData(form);perform(async()=>{await api("/vitals",{method:"POST",body:JSON.stringify({type:metric,value_1:Number(data.get("value_1")),value_2:metric==="bp"?Number(data.get("value_2")):null})});setVitals(await api<Vital[]>("/vitals?range="+range+"&type="+metric));setSummaries(await api<Summary[]>("/vitals/summary"));setNotice("Reading saved.");form.reset();});}}><label>{metrics[metric]} ({units[metric]})<input name="value_1" required type="number" min="1" step="0.1"/></label>{metric==="bp"&&<label>Diastolic (mmHg)<input name="value_2" type="number" required min="1"/></label>}<button disabled={busy} className="primary">{busy?"Saving…":"Save reading →"}</button></form></section></div></>}
    {view==="appointments"&&<><div className="split"><section className="panel"><p className="eyebrow">FIND YOUR CARE</p><h2>Choose a doctor.</h2>{doctors.map(d=><button className={"doctor-row "+(doctor===d.id?"selected":"")} key={d.id} onClick={()=>{if(doctor!==d.id){setSlot("");setSlots([]);setDoctor(d.id);}}}><span className="avatar">{d.name.split(" ").filter(n=>n!=="Dr.").map(n=>n[0]).slice(0,2).join("")}</span><span><strong>{d.name}</strong><small>{d.specialty}</small><p className="muted">{d.bio}</p></span></button>)}{!doctors.length&&<p className="muted">No doctors are available yet.</p>}</section><section className="panel"><p className="eyebrow">A TIME THAT WORKS FOR YOU</p><h2>Make space for a conversation.</h2><div className="slots">{slots.map(s=><button aria-pressed={slot===s.id} className={slot===s.id?"selected":""} onClick={()=>setSlot(s.id)} key={s.id}>{date(s.starts_at)}</button>)}</div>{!slots.length&&<p className="muted">{doctor?"No upcoming slots available.":"Select a doctor to see availability."}</p>}<button disabled={!slot||busy} className="primary" onClick={()=>perform(async()=>{await api("/appointments",{method:"POST",body:JSON.stringify({doctor_id:doctor,slot_id:slot})});setAppointments(await api<Appointment[]>("/appointments"));setSlots(items=>items.filter(s=>s.id!==slot));setSlot("");setNotice("Appointment confirmed.");})}>{busy?"Confirming…":"Confirm appointment →"}</button></section></div><section className="panel appointments"><h2>Your appointments</h2>{appointments.map(a=><div className="list-row" key={a.id}><div><strong>{a.doctor?.name}</strong><p className="muted">{a.slot&&date(a.slot.starts_at)}</p></div><span className="pill">{a.status}</span>{a.status==="confirmed"&&<button disabled={busy} onClick={()=>perform(async()=>{await api("/appointments/"+a.id,{method:"DELETE"});setAppointments(await api<Appointment[]>("/appointments"));setNotice("Appointment cancelled.");})}>Cancel</button>}</div>)}{!appointments.length&&<p className="muted">Your booked appointments will appear here.</p>}</section></>}
    </>}<footer className="app-footer">PulseOS · Your health, in plain language.<span>Educational portfolio · Synthetic data only</span></footer></main></div>;
}
