"use client";
import React, { useState, useEffect, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  motion, useScroll, useTransform, AnimatePresence,
  useInView, useSpring, useMotionValue, animate,
} from "framer-motion";

const A = "#b8ff57";
const BG = "#080808";
const DIM = "rgba(255,255,255,0.06)";
const M = "'DM Mono', monospace";
const S = "'DM Sans', sans-serif";

const NAV = [
  { label:"Work",id:"work"},{ label:"Systems",id:"systems"},
  { label:"Experience",id:"experience"},{ label:"Stack",id:"skills"},
  { label:"About",id:"about"},{ label:"Contact",id:"contact"},
];

const PROJECTS = [
  { id:"01", title:"HELIX",    tags:["React","WebGL","Node.js"],    desc:"Real-time 3D data visualization platform for genomic sequencing pipelines.", year:"2024", metric:"10M+ pts/frame",    color:"#0f0f0f" },
  { id:"02", title:"VANTAGE",  tags:["Next.js","Postgres","Stripe"], desc:"SaaS financial dashboard with predictive analytics and scenario modelling.", year:"2024", metric:"$420M processed/mo", color:"#111"    },
  { id:"03", title:"PULSAR",   tags:["Rust","WASM","TypeScript"],    desc:"Browser-native code execution sandbox with zero-latency hot reload.",        year:"2023", metric:"<2ms exec time",    color:"#0f0f0f" },
  { id:"04", title:"ETHER",    tags:["Solidity","The Graph","React"],desc:"Decentralized governance protocol powering 40+ DAOs.",                       year:"2023", metric:"$2B+ TVL secured",  color:"#111"    },
  { id:"05", title:"NORTHSTAR",tags:["Python","AWS","React"],        desc:"ML-powered supply chain optimisation for Fortune 500 companies.",             year:"2022", metric:"34% cost reduction", color:"#0f0f0f" },
  { id:"06", title:"AXIOM",    tags:["GraphQL","Docker","Redis"],    desc:"Developer toolchain cutting CI/CD pipeline time by 70% across teams.",        year:"2022", metric:"70% faster deploys", color:"#111"    },
];

const EXPERIENCES = [
  { role:"Senior Full-Stack Engineer", company:"Vercel",                    period:"2023 – Present", desc:"Leading frontend infrastructure initiatives; 40% build-time improvement. Edge Network features now serving 1M+ developers." },
  { role:"Software Engineer",          company:"Figma",                     period:"2021 – 2023",    desc:"Real-time collaboration engine. Plugin APIs adopted by 200k+ community extensions." },
  { role:"Lead Engineer",              company:"Stealth Startup (Acquired)",period:"2019 – 2021",    desc:"First hire. Scaled to 12 engineers, shipped 3 products, led Series B acquisition." },
  { role:"Frontend Developer",         company:"Andela",                    period:"2017 – 2019",    desc:"Built scalable React applications for enterprise clients across Africa and Europe." },
];

const SKILLS = ["TypeScript","React","Next.js","Node.js","Rust","PostgreSQL","GraphQL","AWS","Docker","WebGL","Python","Solidity","Redis","Kafka","Kubernetes","Three.js"];

const TESTIMONIALS = [
  { name:"Sarah Chen",  role:"CTO @ Vercel",       quote:"Ken is the rare engineer who makes everything around him better — the code, the team, the product. A genuine force multiplier." },
  { name:"Marcus Webb", role:"Founder @ Axiom Labs", quote:"Working with Ken was a turning point. He shipped in weeks what we thought would take months, and the quality was immaculate." },
  { name:"Amara Osei",  role:"VP Eng @ Figma",      quote:"Ken's ability to hold systems thinking and pixel-perfect detail simultaneously is extraordinary. One of the best I've worked with." },
];

type LineType="cmd"|"info"|"success"|"route";
const TERMINAL: {delay:number;text:string;type:LineType}[] = [
  { delay:0,    text:"$ next build",                                      type:"cmd"     },
  { delay:700,  text:"  info  - Loaded env from .env.local",              type:"info"    },
  { delay:1200, text:"  info  - Linting and checking validity...",        type:"info"    },
  { delay:1800, text:"  info  - Creating an optimized production build...",type:"info"  },
  { delay:2500, text:"  v  Compiled successfully",                        type:"success" },
  { delay:3000, text:"  Route (app)              Size     First JS",      type:"info"   },
  { delay:3300, text:"  ┌ o /                   4.2 kB   87.3 kB",       type:"route"  },
  { delay:3500, text:"  ├ o /dashboard          6.8 kB   91.0 kB",       type:"route"  },
  { delay:3700, text:"  ├ f /api/data           0 B      0 B",            type:"route"  },
  { delay:3900, text:"  └ o /settings           3.1 kB   88.2 kB",       type:"route"  },
  { delay:4200, text:"  v  Build complete in 4.2s",                       type:"success" },
  { delay:4700, text:"$ vercel --prod",                                   type:"cmd"    },
  { delay:5100, text:"  v  Deployed -> ken-bett.vercel.app",              type:"success" },
];

const scrollTo = (id: string): void => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

const MOBILE_BP = 768;
const TABLET_BP = 960;

function useMediaQuery(maxWidth: number): boolean {
  const [match,setMatch]=useState(false);
  useEffect(()=>{
    const mql=window.matchMedia(`(max-width:${maxWidth}px)`);
    const update=()=>setMatch(mql.matches);
    update();
    mql.addEventListener("change",update);
    return()=>mql.removeEventListener("change",update);
  },[maxWidth]);
  return match;
}

const BPCtx=React.createContext({isMobile:false,isTablet:false});
const useBP=()=>React.useContext(BPCtx);

function useTypewriter(words: string[],speed=85){
  const [idx,setIdx]=useState(0);
  const [txt,setTxt]=useState("");
  const [del,setDel]=useState(false);
  useEffect(()=>{
    const w=words[idx%words.length];
    const t=setTimeout(()=>{
      if(!del){
        setTxt(w.slice(0,txt.length+1));
        if(txt.length===w.length)setTimeout(()=>setDel(true),1500);
      } else {
        setTxt(w.slice(0,txt.length-1));
        if(txt.length===0){setDel(false);setIdx(i=>i+1);}
      }
    },del?speed/2:speed);
    return()=>clearTimeout(t);
  },[txt,del,idx,words,speed]);
  return txt;
}

function CountUp({to,suffix=""}:{to:number;suffix?:string}){
  const ref=useRef<HTMLSpanElement>(null);
  const inV=useInView(ref,{once:true});
  const mv=useMotionValue(0);
  const [d,setD]=useState("0");
  useEffect(()=>{
    if(!inV)return;
    const c=animate(mv,to,{duration:2,ease:"easeOut",onUpdate:v=>setD(Math.round(v).toString())});
    return c.stop;
  },[inV,to,mv]);
  return <span ref={ref}>{d}{suffix}</span>;
}

function FadeUp({children,delay=0,style={}}:{children:ReactNode;delay?:number;style?:CSSProperties}){
  const ref=useRef<HTMLDivElement>(null);
  const v=useInView(ref,{once:true,margin:"-50px"});
  return(
    <motion.div ref={ref} style={style}
      initial={{opacity:0,y:44}} animate={v?{opacity:1,y:0}:{}}
      transition={{duration:0.8,delay,ease:[0.22,1,0.36,1]}}>
      {children}
    </motion.div>
  );
}

function SlideIn({children,delay=0,from="left"}:{children:ReactNode;delay?:number;from?:"left"|"right"}){
  const ref=useRef<HTMLDivElement>(null);
  const v=useInView(ref,{once:true,margin:"-50px"});
  return(
    <motion.div ref={ref}
      initial={{opacity:0,x:from==="left"?-56:56}} animate={v?{opacity:1,x:0}:{}}
      transition={{duration:0.8,delay,ease:[0.22,1,0.36,1]}}>
      {children}
    </motion.div>
  );
}

/* MOUSE GLOW */
function MouseGlow(){
  const x=useMotionValue(-400),y=useMotionValue(-400);
  const sx=useSpring(x,{stiffness:80,damping:20});
  const sy=useSpring(y,{stiffness:80,damping:20});
  useEffect(()=>{
    const h=(e:MouseEvent)=>{x.set(e.clientX);y.set(e.clientY);};
    window.addEventListener("mousemove",h);
    return()=>window.removeEventListener("mousemove",h);
  },[x,y]);
  return(
    <motion.div style={{position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:0,
      x:sx,y:sy,translateX:"-50%",translateY:"-50%",
      width:400,height:400,borderRadius:"50%",
      background:`radial-gradient(circle,${A}07 0%,transparent 65%)`,filter:"blur(40px)"}}/>
  );
}

/* SCROLL BAR */
function ScrollBar(){
  const {scrollYProgress}=useScroll();
  const scaleX=useSpring(scrollYProgress,{stiffness:100,damping:30});
  return <motion.div style={{position:"fixed",top:0,left:0,right:0,height:2,background:A,scaleX,originX:0,zIndex:300}}/>;
}

/* NAV */
function Nav(){
  const {isMobile}=useBP();
  const [scrolled,setScrolled]=useState(false);
  const [active,setActive]=useState("");
  const [time,setTime]=useState("");
  const [menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{
    const tick=()=>setTime(new Date().toLocaleTimeString("en-US",{hour12:false}));
    tick();
    const ti=setInterval(tick,1000);
    const onS=()=>{
      setScrolled(window.scrollY>40);
      const sects=NAV.map(n=>document.getElementById(n.id)).filter((s):s is HTMLElement=>!!s&&s.getBoundingClientRect().top<=130);
      const cur=sects[sects.length-1];
      if(cur)setActive(cur.id);
    };
    window.addEventListener("scroll",onS,{passive:true});
    return()=>{clearInterval(ti);window.removeEventListener("scroll",onS);};
  },[]);
  const close=()=>setMenuOpen(false);
  return(
    <motion.nav initial={{opacity:0,y:-28}} animate={{opacity:1,y:0}}
      transition={{duration:0.7,ease:[0.22,1,0.36,1]}}
      style={{position:"fixed",top:0,left:0,right:0,zIndex:200,
        padding:isMobile?"12px 16px":"16px 40px",
        display:"flex",justifyContent:"space-between",alignItems:"center",
        background:scrolled?"rgba(8,8,8,0.94)":"transparent",
        backdropFilter:scrolled?"blur(20px)":"none",
        borderBottom:scrolled?`1px solid ${DIM}`:"none",transition:"all 0.4s"}}>
      <div style={{display:"flex",alignItems:"center",gap:isMobile?12:20}}>
        <motion.div whileHover={{scale:1.04}} whileTap={{scale:0.98}}
          onClick={()=>{window.scrollTo({top:0,behavior:"smooth"});close();}}
          style={{fontFamily:M,fontSize:isMobile?10:12,color:A,letterSpacing:3,textTransform:"uppercase",cursor:"pointer"}}>
          KENBETT.dev
        </motion.div>
        {!isMobile&&(
          <div style={{fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.2)",letterSpacing:2,borderLeft:`1px solid ${DIM}`,paddingLeft:20}}>
            <motion.span animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:2}}>●</motion.span>
            {" "}{time} EAT
          </div>
        )}
      </div>
      {!isMobile&&(
        <div style={{display:"flex",gap:28,alignItems:"center"}}>
          {NAV.map(({label,id})=>(
            <motion.button key={id} onClick={()=>scrollTo(id)} whileHover={{y:-1}}
              style={{fontFamily:M,fontSize:10,color:active===id?A:"rgba(255,255,255,0.4)",
                letterSpacing:1.5,textTransform:"uppercase",background:"none",border:"none",
                cursor:"pointer",padding:"4px 0",position:"relative",transition:"color 0.2s"}}>
              {label}
              {active===id&&<motion.div layoutId="underline"
                style={{position:"absolute",bottom:-2,left:0,right:0,height:1,background:A}}/>}
            </motion.button>
          ))}
        </div>
      )}
      {isMobile&&(
        <>
          <motion.button onClick={()=>setMenuOpen(!menuOpen)} whileTap={{scale:0.95}}
            style={{background:"none",border:"none",cursor:"pointer",padding:8,
              display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}
            aria-label="Toggle menu">
            {[0,1,2].map(i=>(
              <span key={i} style={{width:20,height:2,background:A,borderRadius:1,
                opacity:menuOpen&&i===0?0:1,
                transform:menuOpen&&i===1?"rotate(45deg)":menuOpen&&i===2?"rotate(-45deg) translateY(-7px)":undefined}}/>
            ))}
          </motion.button>
          <AnimatePresence>
            {menuOpen&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{position:"fixed",inset:0,top:52,zIndex:199,
                  background:"rgba(8,8,8,0.98)",backdropFilter:"blur(20px)",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:24}}
                onClick={close}>
                {NAV.map(({label,id})=>(
                  <motion.button key={id} onClick={e=>{e.stopPropagation();scrollTo(id);close();}}
                    style={{fontFamily:M,fontSize:14,color:active===id?A:"rgba(255,255,255,0.9)",
                      letterSpacing:2,textTransform:"uppercase",background:"none",border:"none",cursor:"pointer"}}>
                    {label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.nav>
  );
}

/* ARCH DIAGRAM */
function ArchDiagram(){
  const ref=useRef<HTMLDivElement>(null);
  const inV=useInView(ref,{once:true});
  const [show,setShow]=useState(false);
  useEffect(()=>{if(inV)setShow(true);},[inV]);
  const cols=[
    {x:12,label:"BROWSER",   sub:"React / DOM",      color:`${A}cc`},
    {x:30,label:"NEXT.JS",   sub:"SSR / RSC",         color:`${A}cc`},
    {x:50,label:"MIDDLEWARE",sub:"Auth / Edge",        color:"#57b8ffcc"},
    {x:70,label:"API ROUTES",sub:"REST / tRPC",        color:`${A}cc`},
    {x:88,label:"SERVICES",  sub:"DB / Cache / Queue", color:`${A}cc`},
  ];
  const hEdges=cols.slice(0,-1).map((c,i)=>({x1:c.x+6,y1:50,x2:cols[i+1].x-6,y2:50}));
  const services=[{label:"PostgreSQL",y:30},{label:"Redis",y:50},{label:"Kafka",y:70}];
  return(
    <div ref={ref} style={{position:"relative",height:"100%",overflow:"hidden"}}>
      <svg viewBox="0 0 100 100" style={{width:"100%",height:"100%",overflow:"hidden",display:"block"}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="ah" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto">
            <path d="M0,0 L0,3 L3,1.5 z" fill={`${A}66`}/>
          </marker>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="0.6" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <motion.line x1="6" y1="50" x2="94" y2="50" stroke={`${A}15`} strokeWidth="0.2"
          initial={{pathLength:0}} animate={show?{pathLength:1}:{}} transition={{duration:1.5,delay:0.3}}/>
        {hEdges.map((e,i)=>(
          <g key={i}>
            <motion.line {...e} stroke={`${A}30`} strokeWidth="0.25"
              strokeDasharray="1.5 0.8" markerEnd="url(#ah)"
              initial={{opacity:0}} animate={show?{opacity:1}:{}}
              transition={{delay:1.2+i*0.2}}
              style={{animation:show?`dash ${1.2+i*0.2}s linear infinite`:undefined}}/>
            <motion.circle r="0.7" fill={A}
              initial={{x:e.x1,y:50,opacity:0}}
              animate={show?{x:[e.x1,e.x2],y:[50,50],opacity:[0,1,1,0]}:{}}
              transition={{delay:1.8+i*0.35,duration:0.9,repeat:Infinity,repeatDelay:2.2+i*0.5,ease:"linear"}}/>
          </g>
        ))}
        {services.map((sv,i)=>(
          <g key={sv.label}>
            <motion.line x1="82" y1={sv.y} x2="76" y2={sv.y}
              stroke={`${A}25`} strokeWidth="0.2" markerEnd="url(#ah)"
              initial={{opacity:0}} animate={show?{opacity:1}:{}} transition={{delay:2+i*0.2}}/>
          </g>
        ))}
        {cols.map((col,i)=>{
          const w=col.label==="MIDDLEWARE"?14:12;
          const xOff=col.label==="MIDDLEWARE"?7:6;
          return(
            <motion.g key={col.label} initial={{opacity:0,y:6}} animate={show?{opacity:1,y:0}:{}}
              transition={{delay:0.5+i*0.15,type:"spring",stiffness:180}}>
              <motion.rect x={col.x-xOff} y={46} width={w} height="8" rx="0"
                fill="#0e0e0e" stroke={col.color} strokeWidth="0.35"
                animate={{stroke:[col.color.slice(0,-2)+"40",col.color,col.color.slice(0,-2)+"40"]}}
                transition={{delay:i*0.4,repeat:Infinity,duration:2.8}} filter="url(#glow2)"/>
              <text x={col.x} y={50.5} textAnchor="middle"
                style={{fontFamily:M,fontSize:"1.9px",fill:col.color,fontWeight:500,letterSpacing:"0.2px"}}>{col.label}</text>
              <text x={col.x} y={53} textAnchor="middle"
                style={{fontFamily:M,fontSize:"1.5px",fill:"rgba(255,255,255,0.3)"}}>{col.sub}</text>
            </motion.g>
          );
        })}
        {services.map((sv,i)=>(
          <motion.g key={sv.label} initial={{opacity:0,x:6}} animate={show?{opacity:1,x:0}:{}}
            transition={{delay:1.5+i*0.15}}>
            <motion.rect x={82} y={sv.y-3} width="14" height="6" rx="0"
              fill="#0e0e0e" stroke={`${A}55`} strokeWidth="0.3"
              animate={{stroke:[`${A}30`,`${A}88`,`${A}30`]}}
              transition={{delay:i*0.5,repeat:Infinity,duration:2.2}}/>
            <text x={89} y={sv.y+0.5} textAnchor="middle"
              style={{fontFamily:M,fontSize:"1.7px",fill:`${A}cc`}}>{sv.label}</text>
          </motion.g>
        ))}
        {cols.map((col,i)=>(
          <motion.text key={`L${i}`} x={col.x} y={38} textAnchor="middle"
            initial={{opacity:0}} animate={show?{opacity:1}:{}} transition={{delay:1+i*0.1}}
            style={{fontFamily:M,fontSize:"1.4px",fill:"rgba(255,255,255,0.18)",letterSpacing:"0.3px"}}>
            L{i+1}
          </motion.text>
        ))}
      </svg>
    </div>
  );
}

/* NEXT METRICS */
function NextMetrics(){
  const [m,setM]=useState({fcp:0.8,lcp:1.2,ttfb:18,score:98});
  useEffect(()=>{
    const t=setInterval(()=>setM(p=>({
      fcp:+(Math.max(0.4,Math.min(1.4,p.fcp+(Math.random()-0.5)*0.15))).toFixed(2),
      lcp:+(Math.max(0.9,Math.min(2.0,p.lcp+(Math.random()-0.5)*0.2))).toFixed(2),
      ttfb:Math.round(Math.max(10,Math.min(40,p.ttfb+(Math.random()-0.5)*5))),
      score:Math.round(Math.max(94,Math.min(100,p.score+(Math.random()-0.5)*2))),
    })),2000);
    return()=>clearInterval(t);
  },[]);
  const Ring=({score}:{score:number})=>{
    const r=18,circ=2*Math.PI*r;
    return(
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
        <motion.circle cx="26" cy="26" r={r} fill="none" stroke={A} strokeWidth="3"
          strokeLinecap="square" strokeDashoffset={circ*0.25}
          animate={{strokeDasharray:`${circ*(score/100)} ${circ}`}}
          transition={{duration:1,ease:"easeOut"}}/>
        <text x="26" y="30" textAnchor="middle" style={{fontFamily:M,fontSize:"9px",fill:A}}>{score}</text>
      </svg>
    );
  };
  return(
    <div style={{background:"#0c0c0c",border:`1px solid ${DIM}`}}>
      <div style={{borderBottom:`1px solid ${DIM}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:6,height:6,background:"#fff",borderRadius:"50%",opacity:0.8}}/>
          <span style={{fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:1.5}}>NEXT.JS · PRODUCTION</span>
        </div>
        <motion.span animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:1.5}}
          style={{fontFamily:M,fontSize:9,color:A}}>● LIVE</motion.span>
      </div>
      <div style={{padding:20}}>
        <div style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Core Web Vitals</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[{label:"FCP",val:`${m.fcp}s`,good:m.fcp<1.2},{label:"LCP",val:`${m.lcp}s`,good:m.lcp<1.5},{label:"TTFB",val:`${m.ttfb}ms`,good:m.ttfb<25}].map(({label,val,good})=>(
            <div key={label} style={{border:`1px solid ${DIM}`,padding:"10px 12px"}}>
              <div style={{fontFamily:M,fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:1.5,marginBottom:6}}>{label}</div>
              <motion.div animate={{color:good?A:"#ff7b7b"}} style={{fontFamily:M,fontSize:15,fontWeight:500}}>{val}</motion.div>
              <div style={{marginTop:5,height:1,background:"rgba(255,255,255,0.06)"}}>
                <motion.div animate={{width:good?"100%":"60%",background:good?A:"#ff7b7b"}} transition={{duration:0.8}} style={{height:"100%"}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20,paddingTop:14,borderTop:`1px solid ${DIM}`}}>
          <Ring score={m.score}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:1.5,marginBottom:10}}>LIGHTHOUSE SCORE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {([["BUILDS","1,247"],["ERRORS","0"],["REGIONS","14"],["P99","12ms"]] as [string,string][]).map(([k,v])=>(
                <div key={k}>
                  <div style={{fontFamily:M,fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:1}}>{k}</div>
                  <div style={{fontFamily:M,fontSize:13,color:k==="ERRORS"?"#57ffb8":"#fff"}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${DIM}`}}>
          <div style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:1.5,marginBottom:10}}>BUILD TIMELINE</div>
          <div style={{display:"flex",gap:3,alignItems:"flex-end",height:28}}>
            {Array.from({length:20},(_,i)=>{
              const h=30+((i*47+13)%70);
              return(
                <motion.div key={i}
                  initial={{scaleY:0}} whileInView={{scaleY:1}} viewport={{once:true}}
                  transition={{delay:i*0.04,duration:0.4}}
                  style={{flex:1,height:`${h}%`,background:i===19?A:`${A}44`,originY:1}}/>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TERMINAL — FIX: use containerRef.scrollTop instead of
   scrollIntoView() which was leaking scroll to the page.
═══════════════════════════════════════════════════════ */
type TLine={text:string;type:LineType};
function Terminal(){
  const [lines,setLines]=useState<TLine[]>([]);
  const wrapRef=useRef<HTMLDivElement>(null);      // outer div for inView detection
  const scrollRef=useRef<HTMLDivElement>(null);     // inner scrollable div
  const inV=useInView(wrapRef,{once:true});
  const startedRef=useRef(false);

  useEffect(()=>{
    if(!inV||startedRef.current)return;
    startedRef.current=true;
    TERMINAL.forEach(({delay,text,type})=>{
      setTimeout(()=>setLines(l=>[...l,{text,type}]),delay);
    });
  },[inV]);

  // Scroll only the inner div — never touches window.scrollY
  useEffect(()=>{
    const el=scrollRef.current;
    if(el)el.scrollTop=el.scrollHeight;
  },[lines]);

  const colors:Record<TLine["type"],string>={cmd:A,info:"rgba(255,255,255,0.5)",success:"#57ffb8",route:"rgba(255,255,255,0.65)"};
  return(
    <div ref={wrapRef} style={{background:"#080808",border:`1px solid ${DIM}`,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",borderBottom:`1px solid ${DIM}`,background:"#0d0d0d"}}>
        {[A,"#ff6b6b","rgba(255,255,255,0.15)"].map((c,i)=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",background:c}}/>
        ))}
        <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.2)",marginLeft:8,letterSpacing:1}}>
          ken@macbook ~/projects/helix
        </span>
        <motion.span animate={{opacity:[1,0,1]}} transition={{repeat:Infinity,duration:2}}
          style={{marginLeft:"auto",fontFamily:M,fontSize:9,color:`${A}99`}}>● BUILD</motion.span>
      </div>
      <div ref={scrollRef}
        style={{padding:"14px 18px",fontFamily:M,fontSize:11,lineHeight:1.85,
          height:240,overflowY:"auto",scrollbarWidth:"none"}}>
        {lines.map((line,i)=>(
          <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{duration:0.25}}
            style={{color:colors[line.type]}}>
            {line.text}
          </motion.div>
        ))}
        {lines.length<TERMINAL.length&&(
          <motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity,duration:0.6}}
            style={{display:"inline-block",width:6,height:12,background:A,verticalAlign:"text-bottom"}}/>
        )}
      </div>
    </div>
  );
}

/* HERO */
function Hero(){
  const {isMobile}=useBP();
  const typed=useTypewriter(["systems.","full-stack products.","infrastructure.","things that last."],80);
  const {scrollY}=useScroll();
  const y=useTransform(scrollY,[0,600],[0,-90]);
  const op=useTransform(scrollY,[0,500],[1,0]);
  return(
    <motion.section style={{y,opacity:op,minHeight:"100vh",display:"flex",alignItems:"center",padding:isMobile?"0 16px":"0 40px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:`linear-gradient(${A}07 1px,transparent 1px),linear-gradient(90deg,${A}07 1px,transparent 1px)`,
        backgroundSize:isMobile?"40px 40px":"60px 60px"}}/>
      <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:`${A}05`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:`${A}05`,pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",width:"100%",
        display:"grid",gridTemplateColumns:isMobile?"1fr":"54fr 46fr",
        gap:isMobile?24:56,alignItems:"center",paddingTop:isMobile?100:80}}>
        <div>
          <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.3}}
            style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,fontFamily:M,fontSize:10,
              color:"rgba(255,255,255,0.3)",letterSpacing:2,textTransform:"uppercase"}}>
            <motion.span animate={{opacity:[1,0.2,1]}} transition={{repeat:Infinity,duration:1.5}}
              style={{width:5,height:5,borderRadius:"50%",background:A,display:"inline-block"}}/>
            sys.status = &quot;available_for_hire&quot; · nairobi, ke
          </motion.div>
          <div style={{overflow:"hidden"}}>
            <motion.h1 initial={{y:110,opacity:0}} animate={{y:0,opacity:1}}
              transition={{duration:1,ease:[0.22,1,0.36,1],delay:0.1}}
              style={{fontFamily:M,fontSize:"clamp(38px,6.5vw,88px)",fontWeight:500,lineHeight:1.05,color:"#fff",margin:0,letterSpacing:-2,textTransform:"uppercase"}}>
              I BUILD<br/>
              <motion.span style={{color:A}}
                animate={{textShadow:[`0 0 0px ${A}00`,`0 0 28px ${A}44`,`0 0 0px ${A}00`]}}
                transition={{repeat:Infinity,duration:3}}>
                {typed}
              </motion.span>
              <motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity,duration:0.7}}
                style={{display:"inline-block",width:3,height:"0.85em",background:A,marginLeft:4,verticalAlign:"text-bottom"}}/>
            </motion.h1>
          </div>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.85}}
            style={{fontFamily:S,fontSize:15,lineHeight:1.8,color:"rgba(255,255,255,0.38)",maxWidth:440,margin:"28px 0 36px"}}>
            Senior engineer who designs distributed systems, writes tight Rust, and obsesses over the gap between p50 and p99. 6 years. 30+ shipped products. Nairobi → world.
          </motion.p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.0}}
            style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <motion.button whileHover={{scale:1.03,boxShadow:`0 8px 30px ${A}50`}} whileTap={{scale:0.97}}
              onClick={()=>scrollTo("work")}
              style={{fontFamily:M,fontSize:10,letterSpacing:2,textTransform:"uppercase",padding:"13px 26px",background:A,color:"#000",border:"none",cursor:"pointer",fontWeight:700}}>
              View Work
            </motion.button>
            <motion.button whileTap={{scale:0.97}} onClick={()=>scrollTo("contact")}
              style={{fontFamily:M,fontSize:10,letterSpacing:2,textTransform:"uppercase",padding:"13px 26px",
                background:"transparent",color:"rgba(255,255,255,0.5)",border:`1px solid rgba(255,255,255,0.12)`,cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
              Contact
            </motion.button>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
            style={{marginTop:isMobile?32:56,display:"flex",gap:isMobile?20:36,paddingTop:28,borderTop:`1px solid ${DIM}`,flexWrap:"wrap"}}>
            {([["6+","Years"],["30+","Products"],["99.99%","Uptime SLA"],["<12ms","p99"]] as [string,string][]).map(([n,l])=>(
              <motion.div key={l} whileHover={{y:-3}}>
                <div style={{fontFamily:M,fontSize:"clamp(15px,2vw,22px)",fontWeight:500,color:A}}>{n}</div>
                <div style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.28)",marginTop:4,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{opacity:0,scale:0.93}} animate={{opacity:1,scale:1}} transition={{delay:0.5,duration:1}}
          style={{position:"relative",border:`1px solid ${DIM}`,background:"#0c0c0c",padding:isMobile?16:28,height:isMobile?280:400,overflow:"hidden"}}>
          {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i)=>(
            <div key={i} style={{position:"absolute",...pos,width:10,height:10,
              borderTop:i<2?`2px solid ${A}`:"none",borderBottom:i>=2?`2px solid ${A}`:"none",
              borderLeft:i%2===0?`2px solid ${A}`:"none",borderRight:i%2!==0?`2px solid ${A}`:"none"}}/>
          ))}
          <div style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>FULLSTACK / ARCHITECTURE</div>
          <div style={{height:isMobile?220:330,minHeight:0,overflow:"hidden"}}><ArchDiagram/></div>
        </motion.div>
      </div>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
        onClick={()=>scrollTo("work")}
        style={{position:"absolute",bottom:isMobile?20:34,right:isMobile?16:40,fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.18)",
          letterSpacing:2,textTransform:"uppercase",writingMode:"vertical-rl",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
        scroll
        <motion.div animate={{scaleY:[0,1,0]}} transition={{repeat:Infinity,duration:1.9}}
          style={{width:1,height:46,background:`linear-gradient(${A},transparent)`,originY:0}}/>
      </motion.div>
    </motion.section>
  );
}

/* MARQUEE */
function Marquee(){
  const base=["Distributed Systems · ","Next.js · ","Rust · ","99.99% Uptime · ","GraphQL · ","Edge Computing · ","Event-driven · ","Zero-downtime · "];
  const items:string[]=([] as string[]).concat(...Array(8).fill(base));
  return(
    <div style={{overflow:"hidden",borderTop:`1px solid ${DIM}`,borderBottom:`1px solid ${DIM}`,padding:"11px 0",background:"#060606"}}>
      <motion.div animate={{x:["0%","-50%"]}} transition={{repeat:Infinity,duration:30,ease:"linear"}}
        style={{display:"flex",whiteSpace:"nowrap"}}>
        {items.map((item,i)=>(
          <span key={i} style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.16)",letterSpacing:3,textTransform:"uppercase",padding:"0 6px"}}>{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* SECTION HEADER */
function SectionHeader({number,label}:{number:string;label:string}){
  const {isMobile}=useBP();
  return(
    <FadeUp>
      <div style={{display:"flex",alignItems:"center",gap:isMobile?12:20,marginBottom:isMobile?32:56}}>
        <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.22)",letterSpacing:2,textTransform:"uppercase"}}>{number} / {label}</span>
        <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
          transition={{duration:0.9,ease:[0.22,1,0.36,1]}}
          style={{flex:1,height:1,background:DIM,originX:0}}/>
      </div>
    </FadeUp>
  );
}

/* PROJECT CARD */
function ProjectCard({project,index}:{project:(typeof PROJECTS)[0];index:number}){
  const {isMobile}=useBP();
  const [hov,setHov]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const inV=useInView(ref,{once:true,margin:"-80px"});
  return(
    <motion.div ref={ref}
      initial={{opacity:0,y:60}} animate={inV?{opacity:1,y:0}:{}}
      transition={{duration:0.7,delay:index*0.07,ease:[0.22,1,0.36,1]}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      whileHover={{y:isMobile?0:-5}}
      style={{background:project.color,border:`1px solid ${hov?`${A}30`:DIM}`,padding:isMobile?24:40,position:"relative",overflow:"hidden",transition:"border-color 0.3s",cursor:"pointer"}}>
      <motion.div animate={{y:hov?["0%","105%"]:"0%"}} transition={{duration:1.4,ease:"linear",repeat:hov?Infinity:0}}
        style={{position:"absolute",top:0,left:0,right:0,height:"35%",background:`linear-gradient(180deg,${A}05 0%,transparent 100%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.18)",letterSpacing:2}}>{project.id} / {project.year}</span>
        <motion.div animate={{opacity:hov?1:0,x:hov?0:8}} style={{fontFamily:M,fontSize:9,color:A,letterSpacing:1.5,textTransform:"uppercase"}}>VIEW ↗</motion.div>
      </div>
      <motion.h3 animate={{color:hov?"#fff":"rgba(255,255,255,0.88)"}}
        style={{fontFamily:M,fontSize:"clamp(20px,2.5vw,36px)",fontWeight:500,margin:"0 0 10px",lineHeight:1,letterSpacing:-0.5,textTransform:"uppercase"}}>
        {project.title}
      </motion.h3>
      <motion.div animate={{borderColor:hov?`${A}55`:DIM,color:hov?A:"rgba(255,255,255,0.28)"}}
        style={{display:"inline-flex",alignItems:"center",gap:6,border:"1px solid",padding:"3px 10px",fontFamily:M,fontSize:9,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14,transition:"all 0.3s"}}>
        <motion.span animate={{opacity:hov?[1,0.4,1]:1}} transition={{repeat:Infinity,duration:1.2}}>▸</motion.span>
        {project.metric}
      </motion.div>
      <p style={{fontFamily:S,fontSize:13,color:"rgba(255,255,255,0.36)",lineHeight:1.7,maxWidth:420,margin:"0 0 22px"}}>{project.desc}</p>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {project.tags.map((t:string)=>(
          <motion.span key={t}
            animate={{borderColor:hov?`${A}50`:DIM,color:hov?A:"rgba(255,255,255,0.32)"}}
            style={{fontFamily:M,fontSize:9,border:"1px solid",padding:"4px 10px",letterSpacing:1.5,textTransform:"uppercase",transition:"all 0.3s"}}>
            {t}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

/* DATA FLOW VIZ */
function DataFlowViz(){
  const {isMobile}=useBP();
  const layers=[
    {name:"CLIENT",     items:["React / Next.js","Static Assets","Service Worker"]},
    {name:"EDGE",       items:["Middleware","Auth Guard","Rate Limit"]},
    {name:"API LAYER",  items:["REST Endpoints","tRPC / GraphQL","Webhooks"]},
    {name:"PERSISTENCE",items:["PostgreSQL","Redis Cache","S3 Storage"]},
  ];
  const ref=useRef<HTMLDivElement>(null);
  const inV=useInView(ref,{once:true,margin:"0px"});
  const [show,setShow]=useState(false);
  useEffect(()=>{if(inV)setShow(true);},[inV]);
  return(
    <div ref={ref} style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(4,1fr)",gap:1,background:DIM}}>
      {layers.map((layer,li)=>(
        <motion.div key={layer.name} initial={{opacity:0,y:28}} animate={show?{opacity:1,y:0}:{}}
          transition={{delay:li*0.1,duration:0.6}}
          style={{background:BG,padding:isMobile?14:22,position:"relative"}}>
          <div style={{fontFamily:M,fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>
            L{li+1} / {layer.name}
          </div>
          {layer.items.map((item,ii)=>(
            <motion.div key={item}
              initial={{opacity:0,x:-8}} animate={show?{opacity:1,x:0}:{}}
              transition={{delay:li*0.1+ii*0.07+0.3}} whileHover={{x:4}}
              style={{border:`1px solid rgba(255,255,255,0.07)`,padding:"9px 12px",marginBottom:6,
                fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.55)",letterSpacing:0.5,
                cursor:"default",transition:"border-color 0.2s,color 0.2s",position:"relative",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${A}55`;e.currentTarget.style.color=A;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.55)";}}>
              {item}
              <motion.div animate={{x:["-100%","110%"]}}
                transition={{delay:li*0.6+ii*0.35,repeat:Infinity,duration:2.5+ii*0.4,ease:"linear"}}
                style={{position:"absolute",top:0,left:0,width:"28%",height:"100%",
                  background:`linear-gradient(90deg,transparent,${A}09,transparent)`,pointerEvents:"none"}}/>
            </motion.div>
          ))}
          {li<layers.length-1&&(
            <motion.div animate={{opacity:[0.3,1,0.3]}} transition={{repeat:Infinity,duration:1.8,delay:li*0.4}}
              style={{position:"absolute",right:-8,top:"50%",transform:"translateY(-50%)",color:`${A}88`,fontSize:14,zIndex:10}}>›</motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* SYSTEMS SECTION */
function SystemsSection(){
  const {isMobile}=useBP();
  return(
    <section id="systems" style={{padding:isMobile?"60px 16px":"120px 40px",borderTop:`1px solid ${DIM}`}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <SectionHeader number="02" label="Systems design"/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?24:40,marginBottom:isMobile?24:40}}>
          <SlideIn from="left">
            <div>
              <h2 style={{fontFamily:M,fontSize:"clamp(28px,3.5vw,52px)",fontWeight:500,color:"#fff",lineHeight:1.1,letterSpacing:-1,marginBottom:24,textTransform:"uppercase"}}>
                FROM ZERO<br/><span style={{color:A}}>TO DISTRIBUTED.</span>
              </h2>
              <p style={{fontFamily:S,fontSize:14,color:"rgba(255,255,255,0.38)",lineHeight:1.85,marginBottom:28}}>
                Every system I ship is built for observability, graceful degradation, and zero-downtime deploys from day one. Not an afterthought — a foundation.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {([
                  ["Event-driven Architecture","Kafka, RabbitMQ, pub/sub at scale"],
                  ["Edge-first Delivery","Sub-50ms globally via CDN + middleware"],
                  ["Resilience Patterns","Circuit breakers, retries, bulkheads"],
                  ["Observability Stack","Prometheus, Grafana, distributed tracing"],
                ] as [string,string][]).map(([title,sub],i)=>(
                  <motion.div key={title} initial={{opacity:0,x:-18}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
                    transition={{delay:i*0.09}} whileHover={{x:6}}
                    style={{display:"flex",gap:14,padding:"13px 16px",border:`1px solid rgba(255,255,255,0.06)`,transition:"all 0.2s",cursor:"default"}}>
                    <span style={{fontFamily:M,fontSize:10,color:A,marginTop:1}}>▸</span>
                    <div>
                      <div style={{fontFamily:M,fontSize:10,color:"#fff",letterSpacing:0.5,marginBottom:2}}>{title}</div>
                      <div style={{fontFamily:S,fontSize:12,color:"rgba(255,255,255,0.32)"}}>{sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SlideIn>
          <SlideIn from="right" delay={0.1}>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <Terminal/>
              <NextMetrics/>
            </div>
          </SlideIn>
        </div>
        <FadeUp delay={0.2}>
          <div>
            <div style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.22)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>
              STACK LAYERS / FULLSTACK DATA PIPELINE
            </div>
            <DataFlowViz/>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* EXPERIENCE */
function Experience(){
  const {isMobile}=useBP();
  return(
    <section id="experience" style={{padding:isMobile?"60px 16px":"120px 40px",borderTop:`1px solid ${DIM}`}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <SectionHeader number="03" label="Experience"/>
        <FadeUp delay={0.1}>
          <h2 style={{fontFamily:M,fontSize:"clamp(28px,4vw,56px)",fontWeight:500,color:"#fff",lineHeight:1.1,letterSpacing:-1,marginBottom:isMobile?36:56,textTransform:"uppercase"}}>
            WHERE I&apos;VE<br/><span style={{color:A}}>DONE THE WORK.</span>
          </h2>
        </FadeUp>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:0,top:8,bottom:0,width:1,background:DIM}}/>
          {EXPERIENCES.map((exp,i)=>(
            <SlideIn key={i} delay={i*0.08} from="left">
              <motion.div whileHover={{x:isMobile?0:8}} transition={{type:"spring",stiffness:280}}
                style={{paddingLeft:isMobile?24:36,marginBottom:isMobile?36:48,position:"relative"}}>
                <motion.div initial={{scale:0}} whileInView={{scale:1}} viewport={{once:true}}
                  transition={{delay:i*0.1+0.25,type:"spring",stiffness:280}}
                  style={{position:"absolute",left:-4,top:6,width:8,height:8,background:A}}/>
                <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6,marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                    <span style={{fontFamily:M,fontSize:13,fontWeight:500,color:"#fff",textTransform:"uppercase",letterSpacing:0.5}}>{exp.role}</span>
                    <span style={{fontFamily:M,fontSize:10,color:A}}>@ {exp.company}</span>
                  </div>
                  <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.22)",letterSpacing:1.5}}>{exp.period}</span>
                </div>
                <p style={{fontFamily:S,fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.75,maxWidth:680}}>{exp.desc}</p>
              </motion.div>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* SKILLS */
function Skills(){
  const {isMobile}=useBP();
  const ref=useRef<HTMLDivElement>(null);
  const inV=useInView(ref,{once:true,margin:"-60px"});
  return(
    <section id="skills" style={{padding:isMobile?"60px 16px":"120px 40px",borderTop:`1px solid ${DIM}`}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <SectionHeader number="04" label="Stack"/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:64,alignItems:"start"}}>
          <FadeUp>
            <div>
              <h2 style={{fontFamily:M,fontSize:"clamp(26px,3.5vw,50px)",fontWeight:500,color:"#fff",lineHeight:1.1,letterSpacing:-1,marginBottom:40,textTransform:"uppercase"}}>
                DEPTH OVER<br/><span style={{color:A}}>BREADTH.</span>
              </h2>
              {([["Frontend",95],["Backend / API",90],["Infrastructure",83],["Blockchain / Web3",70]] as [string,number][]).map(([label,pct],i)=>(
                <div key={String(label)} style={{marginBottom:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.33)",letterSpacing:1.5,textTransform:"uppercase"}}>{label}</span>
                    <span style={{fontFamily:M,fontSize:9,color:A}}>{pct}%</span>
                  </div>
                  <div style={{height:2,background:"rgba(255,255,255,0.07)"}}>
                    <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
                      transition={{duration:1.3,delay:i*0.11,ease:[0.22,1,0.36,1]}}
                      style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${A},${A}66)`,originX:0}}/>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
          <div ref={ref} style={{display:"flex",flexWrap:"wrap",gap:9,alignContent:"flex-start"}}>
            {SKILLS.map((skill,i)=>(
              <motion.div key={skill}
                initial={{opacity:0,scale:0.7,y:14}} animate={inV?{opacity:1,scale:1,y:0}:{}}
                transition={{delay:i*0.04,duration:0.4,ease:[0.22,1,0.36,1]}}
                whileHover={{scale:1.07,y:-2,boxShadow:`0 4px 18px ${A}22`}}
                style={{fontFamily:M,fontSize:10,color:"rgba(255,255,255,0.42)",border:`1px solid rgba(255,255,255,0.08)`,padding:"9px 15px",letterSpacing:1,textTransform:"uppercase",cursor:"default",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,255,255,0.42)";}}>
                {skill}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ABOUT */
function About(){
  const {isMobile}=useBP();
  return(
    <section id="about" style={{padding:isMobile?"60px 16px":"120px 40px",borderTop:`1px solid ${DIM}`}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?40:80,alignItems:"start"}}>
        <SlideIn from="left">
          <div>
            <SectionHeader number="05" label="About"/>
            <h2 style={{fontFamily:M,fontSize:"clamp(20px,2.4vw,34px)",fontWeight:500,color:"#fff",lineHeight:1.3,letterSpacing:-0.5,marginBottom:24,textTransform:"uppercase"}}>
              ENGINEER WHO THINKS IN SYSTEMS AND SHIPS IN WEEKS.
            </h2>
            <p style={{fontFamily:S,fontSize:14,color:"rgba(255,255,255,0.4)",lineHeight:1.85,marginBottom:16}}>
              I&apos;m Ken Bett — a full-stack engineer from Nairobi. I live at the intersection of infrastructure and product: equally comfortable designing an event-driven microservices architecture and obsessing over a 3px button state.
            </p>
            <p style={{fontFamily:S,fontSize:14,color:"rgba(255,255,255,0.4)",lineHeight:1.85}}>
              Previously at Vercel, Figma, and two acquisitions. I write code that is fast, observable, and occasionally beautiful.
            </p>
            <div style={{display:"flex",gap:isMobile?24:36,marginTop:36,paddingTop:28,borderTop:`1px solid ${DIM}`,flexWrap:"wrap"}}>
              {([[6,"+yr","Experience"],[30,"+","Products"],[12,"","OSS libs"]] as [number,string,string][]).map(([n,s,l])=>(
                <div key={l}>
                  <div style={{fontFamily:M,fontSize:30,fontWeight:500,color:A,lineHeight:1}}><CountUp to={n} suffix={s}/></div>
                  <div style={{fontFamily:M,fontSize:8,color:"rgba(255,255,255,0.26)",marginTop:5,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </SlideIn>
        <SlideIn from="right" delay={0.14}>
          <div>
            <div style={{background:"#0c0c0c",border:`1px solid ${DIM}`,padding:isMobile?20:32,marginBottom:20}}>
              <div style={{display:"flex",gap:7,marginBottom:22}}>
                {[A,"rgba(255,255,255,0.12)","rgba(255,255,255,0.06)"].map((c,i)=>(
                  <div key={i} style={{width:8,height:8,borderRadius:"50%",background:c}}/>
                ))}
              </div>
              {([["name","Ken Bett"],["location","Nairobi, Kenya"],["focus","Full-stack + infra"],
                ["email","kenatohat@gmail.com"],["open_to","Senior / Staff roles"],
                ["stack","TS · Rust · Python"],["philosophy","make it work, fast, clean"]] as [string,string][]).map(([key,value],i)=>(
                <motion.div key={key} initial={{opacity:0,x:-8}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
                  transition={{delay:i*0.055}}
                  style={{display:"flex",gap:12,marginBottom:11,fontFamily:M,fontSize:11}}>
                  <span style={{color:A,minWidth:100}}>{key}</span>
                  <span style={{color:"rgba(255,255,255,0.38)"}}>= <span style={{color:"rgba(255,255,255,0.78)"}}>&quot;{value}&quot;</span></span>
                </motion.div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {TESTIMONIALS.map((t,i)=>(
                <motion.div key={i} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{delay:i*0.1}} whileHover={{borderColor:`${A}33`,x:4}}
                  style={{border:`1px solid rgba(255,255,255,0.06)`,padding:"16px 18px",transition:"all 0.2s",cursor:"default"}}>
                  <p style={{fontFamily:S,fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.7,marginBottom:9}}>&quot;{t.quote}&quot;</p>
                  <div style={{fontFamily:M,fontSize:9,color:A}}>{t.name} <span style={{color:"rgba(255,255,255,0.22)"}}>· {t.role}</span></div>
                </motion.div>
              ))}
            </div>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* CONTACT */
function Contact(){
  const {isMobile}=useBP();
  const [sent,setSent]=useState(false);
  const [form,setForm]=useState({name:"",email:"",message:""});
  const submit=()=>{
    if(form.name&&form.email&&form.message){
      setSent(true);setTimeout(()=>setSent(false),4000);
      setForm({name:"",email:"",message:""});
    }
  };
  return(
    <section id="contact" style={{padding:isMobile?"80px 16px":"140px 40px",borderTop:`1px solid ${DIM}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:isMobile?280:550,height:isMobile?280:550,borderRadius:"50%",
        background:`radial-gradient(circle,${A}08,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{position:"relative",maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?40:80}}>
        <SlideIn from="left">
          <div>
            <SectionHeader number="06" label="Contact"/>
            <h2 style={{fontFamily:M,fontSize:"clamp(34px,5vw,72px)",fontWeight:500,color:"#fff",lineHeight:1,letterSpacing:-2,marginBottom:24,textTransform:"uppercase"}}>
              LET&apos;S BUILD<br/><span style={{color:A}}>SOMETHING.</span>
            </h2>
            <p style={{fontFamily:S,fontSize:14,color:"rgba(255,255,255,0.33)",lineHeight:1.85,marginBottom:36}}>
              Open to senior engineering roles, technical co-founder opportunities, and interesting consulting work. I respond within 24 hours.
            </p>
            <motion.a href="mailto:kenatohat@gmail.com" whileHover={{x:5}}
              style={{display:"inline-flex",alignItems:"center",gap:10,fontFamily:M,fontSize:11,color:A,textDecoration:"none",letterSpacing:1.5,marginBottom:36}}>
              <motion.span animate={{x:[0,4,0]}} transition={{repeat:Infinity,duration:1.5}}>→</motion.span>
              kenatohat@gmail.com
            </motion.a>
            <div style={{display:"flex",gap:22}}>
              {["GitHub","LinkedIn","Twitter"].map(link=>(
                <motion.a key={link} href="#" whileHover={{y:-2}}
                  style={{fontFamily:M,fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.2)",textDecoration:"none",transition:"color 0.2s"}}>
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </SlideIn>
        <SlideIn from="right" delay={0.12}>
          <div style={{background:"#0c0c0c",border:`1px solid ${DIM}`,padding:isMobile?24:36}}>
            <AnimatePresence mode="wait">
              {sent?(
                <motion.div key="sent" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
                  style={{textAlign:"center",padding:"56px 0"}}>
                  <motion.div animate={{rotate:[0,10,-10,0]}} transition={{repeat:2,duration:0.4}}
                    style={{fontFamily:M,fontSize:44,color:A,marginBottom:14}}>✓</motion.div>
                  <p style={{fontFamily:S,fontSize:14,color:"rgba(255,255,255,0.45)"}}>Message sent. I&apos;ll get back to you soon.</p>
                </motion.div>
              ):(
                <motion.div key="form" initial={{opacity:0}} animate={{opacity:1}}>
                  {([["Name","name","text","Your name"],["Email","email","email","your@email.com"]] as [string,keyof typeof form,string,string][]).map(([label,field,type,ph])=>(
                    <div key={field} style={{marginBottom:20}}>
                      <label style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.26)",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:7}}>{label}</label>
                      <input type={type} value={form[field]} placeholder={ph}
                        onChange={e=>setForm(f=>({...f,[field]:e.target.value}))}
                        style={{width:"100%",background:"#111",border:`1px solid rgba(255,255,255,0.08)`,color:"#fff",fontFamily:S,fontSize:13,padding:"10px 13px",outline:"none",boxSizing:"border-box"}}
                        onFocus={(e:React.FocusEvent<HTMLInputElement>)=>(e.target.style.borderColor=A)}
                        onBlur={(e:React.FocusEvent<HTMLInputElement>)=>(e.target.style.borderColor="rgba(255,255,255,0.08)")}/>
                    </div>
                  ))}
                  <div style={{marginBottom:22}}>
                    <label style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.26)",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:7}}>Message</label>
                    <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                      placeholder="Let's build something incredible..." rows={5}
                      style={{width:"100%",background:"#111",border:`1px solid rgba(255,255,255,0.08)`,color:"#fff",fontFamily:S,fontSize:13,padding:"10px 13px",outline:"none",resize:"none",boxSizing:"border-box"}}
                      onFocus={(e:React.FocusEvent<HTMLTextAreaElement>)=>(e.target.style.borderColor=A)}
                      onBlur={(e:React.FocusEvent<HTMLTextAreaElement>)=>(e.target.style.borderColor="rgba(255,255,255,0.08)")}/>
                  </div>
                  <motion.button onClick={submit}
                    whileHover={{scale:1.02,boxShadow:`0 6px 26px ${A}44`}} whileTap={{scale:0.97}}
                    style={{width:"100%",padding:"13px",background:A,color:"#000",border:"none",cursor:"pointer",fontFamily:M,fontSize:10,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>
                    Send Message →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}

/* HUD */
function HUDCorners(){
  const [pos,setPos]=useState({x:0,y:0});
  useEffect(()=>{
    const h=(e:MouseEvent)=>setPos({x:e.clientX,y:e.clientY});
    window.addEventListener("mousemove",h,{passive:true});
    return()=>window.removeEventListener("mousemove",h);
  },[]);
  return(
    <div style={{position:"fixed",bottom:20,left:40,zIndex:50,pointerEvents:"none"}}>
      <motion.div animate={{opacity:[0.3,0.5,0.3]}} transition={{repeat:Infinity,duration:3}}
        style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:1.5}}>
        x:{pos.x} y:{pos.y}
      </motion.div>
    </div>
  );
}

/* ROOT */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:${BG};color:#fff;overflow-x:hidden;}
::selection{background:${A};color:#000;}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.14);}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:${BG};}
::-webkit-scrollbar-thumb{background:${A}55;}
::-webkit-scrollbar-thumb:hover{background:${A};}
@keyframes dash{to{stroke-dashoffset:-8;}}
i,em{font-style:normal;}
`;

export default function Portfolio(){
  const isMobile=useMediaQuery(MOBILE_BP);
  const isTablet=useMediaQuery(TABLET_BP);
  // NOTE: No window.scrollTo(0,0) here — it was fighting browser scroll
  // restoration and causing the incremental-scroll jitter on refresh.
  return(
    <BPCtx.Provider value={{isMobile,isTablet}}>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      {!isMobile&&<MouseGlow/>}
      <ScrollBar/>
      {!isMobile&&<HUDCorners/>}
      <Nav/>
      <Hero/>
      <Marquee/>
      <section id="work" style={{padding:isMobile?"60px 16px 80px":"100px 40px 110px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <SectionHeader number="01" label="Selected work"/>
          <FadeUp delay={0.1}>
            <h2 style={{fontFamily:M,fontSize:"clamp(30px,4.5vw,62px)",fontWeight:500,color:"#fff",lineHeight:1,letterSpacing:-2,marginBottom:isMobile?32:48,textTransform:"uppercase"}}>
              THINGS I&apos;VE<br/><span style={{color:A}}>SHIPPED.</span>
            </h2>
          </FadeUp>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fit,minmax(440px,1fr))",gap:isMobile?16:24}}>
            {PROJECTS.map((p,i)=><ProjectCard key={p.id} project={p} index={i}/>)}
          </div>
        </div>
      </section>
      <SystemsSection/>
      <Experience/>
      <Skills/>
      <About/>
      <Contact/>
      <motion.footer initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
        style={{borderTop:`1px solid ${DIM}`,padding:isMobile?"16px":"22px 40px",
          display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",alignItems:"center",gap:isMobile?12:0}}>
        <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.15)",letterSpacing:1.5}}>© 2025 Ken Bett</span>
        <motion.button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} whileHover={{y:-2}}
          style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.15)",background:"none",border:"none",cursor:"pointer",letterSpacing:1.5,transition:"color 0.2s"}}
          onMouseEnter={e=>(e.currentTarget.style.color=A)}
          onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.15)")}>
          ↑ Back to top
        </motion.button>
        <span style={{fontFamily:M,fontSize:9,color:"rgba(255,255,255,0.15)",letterSpacing:1.5}}>Built with React + Framer Motion</span>
      </motion.footer>
    </BPCtx.Provider>
  );
}