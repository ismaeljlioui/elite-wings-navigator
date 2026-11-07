"use client";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { clampRange, snapRange, rangeKeyTarget, RANGE_MAX } from "@/lib/filter-controls";

const PX = .08;
function Digit({ digit }: { digit: string }) {
  return <span className="tms-col"><span className="tms-strip" style={{transform:`translateY(${-Number(digit)*1.5}em)`}}>{'0123456789'.split('').map(n=><span key={n}>{n}</span>)}</span></span>;
}

export function RangeScrubber({value,onChange,active=true}:{value:number;onChange:(value:number)=>void;active?:boolean}) {
  const [pos,setPos] = useState(value);
  const [width,setWidth] = useState(240);
  const ruler = useRef<HTMLDivElement>(null);
  const state = useRef({x:value,to:value,v:0});
  const raf = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{id:number;x:number;t:number;v:number;scale:number}|null>(null);
  const published = useRef(value);
  const change = useRef(onChange);
  change.current = onChange;
  const reduced = useRef(false);

  function stop() {
    cancelAnimationFrame(raf.current);raf.current=0;
    if(idle.current!==null)clearTimeout(idle.current);
    idle.current=null;
  }
  function publish(next:number) {
    next=snapRange(next);
    if(next!==published.current){published.current=next;change.current(next);}
  }
  function move(x:number) {
    state.current.x=clampRange(x);
    state.current.to=snapRange(state.current.x);
    setPos(state.current.x);publish(state.current.to);
  }
  function settle(target:number,velocity=0) {
    stop();
    const s=state.current;
    s.to=snapRange(target);s.v=velocity;publish(s.to);
    if(reduced.current){s.x=s.to;s.v=0;setPos(s.x);return;}
    let last=0;
    const tick=(time:number)=>{
      const dt=last ? Math.min((time-last)/16.67,2) : 1;last=time;
      s.v+=((s.to-s.x)*.035-s.v*.32)*dt;
      s.x=clampRange(s.x+s.v*dt);
      if((Math.abs(s.to-s.x)<.1&&Math.abs(s.v)<.1)||reduced.current){s.x=s.to;s.v=0;setPos(s.x);raf.current=0;return;}
      setPos(s.x);raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
  }
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{reduced.current=media.matches;};update();
    media.addEventListener('change',update);
    const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));
    if(ruler.current)observer.observe(ruler.current);
    return ()=>{stop();observer.disconnect();media.removeEventListener('change',update);};
  },[]);
  useLayoutEffect(()=>{
    if(value===published.current&&active)return;
    stop();drag.current=null;published.current=value;
    state.current={x:value,to:value,v:0};setPos(value);
  },[value,active]);
  useEffect(()=>{
    const el=ruler.current;
    if(!el||!active)return;
    const wheel=(e:WheelEvent)=>{
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
      e.preventDefault();stop();
      const pixels=e.deltaX*(e.deltaMode===1 ? 16 : e.deltaMode===2 ? width : 1);
      move(state.current.x+pixels/PX);
      idle.current=setTimeout(()=>settle(state.current.x),120);
    };
    el.addEventListener('wheel',wheel,{passive:false});
    return ()=>{el.removeEventListener('wheel',wheel);stop();};
  },[active,width]);
  function release(e:PointerEvent<HTMLDivElement>,cancelled=false) {
    const g=drag.current;
    if(!g||g.id!==e.pointerId)return;
    drag.current=null;
    const velocity=cancelled||performance.now()-g.t>80 ? 0 : Math.max(-60,Math.min(60,g.v));
    settle(state.current.x+velocity*10,velocity*.5);
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  }
  const half=width/2;
  const ticks=[];
  for(let n=Math.max(0,Math.ceil((pos-half/PX)/250)*250);n<=Math.min(RANGE_MAX,pos+half/PX);n+=250){
    const x=(n-pos)*PX;
    const strength=Math.max(0,1-(Math.abs(x)/half)**2);
    ticks.push({n,x,strength,kind:n%1000===0?'hour':n%500===0?'quarter':'step'});
  }
  const digits=String(value);
  return <div className="tms">
    <div className="tms-read" aria-hidden="true"><span className="tms-time">{digits.split('').map((d,i)=><Digit key={digits.length-i} digit={d}/>)}</span><span className="tms-mer">nm</span></div>
    <div id="range" ref={ruler} className="tms-ruler" role="slider" tabIndex={active?0:-1} aria-label="Minimum range" aria-valuemin={0} aria-valuemax={RANGE_MAX} aria-valuenow={value} aria-valuetext={value===0?'Any range':`${value.toLocaleString('en-US')} nautical miles`} aria-describedby="range-help"
      onPointerDown={e=>{if(e.button!==0||!active)return;stop();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,t:performance.now(),v:0,scale:e.currentTarget.getBoundingClientRect().width/e.currentTarget.offsetWidth||1};state.current.v=0;}}
      onPointerMove={e=>{const g=drag.current;if(!g||g.id!==e.pointerId)return;const now=performance.now();const delta=-(e.clientX-g.x)/g.scale/PX;g.v=g.v*.5+delta/(Math.max(1,now-g.t)/16.67)*.5;g.x=e.clientX;g.t=now;move(state.current.x+delta);}}
      onPointerUp={e=>release(e)} onPointerCancel={e=>release(e,true)} onLostPointerCapture={e=>release(e,true)}
      onKeyDown={e=>{const target=rangeKeyTarget(e.key,state.current.to);if(target===null)return;e.preventDefault();drag.current=null;settle(target);}}
    >
      <div className="tms-track" aria-hidden="true">{ticks.map(t=><span key={t.n} className="tms-tick" data-kind={t.kind} style={{transform:`translateX(${t.x}px) scaleY(${.55+.45*t.strength})`,opacity:.18+.82*t.strength}}/>)}
        {ticks.filter(t=>t.kind==='hour').map(t=><span key={`label-${t.n}`} className="tms-hour" style={{transform:`translateX(${t.x}px) translateX(-50%)`,opacity:.15+.85*t.strength}}>{t.n.toLocaleString('en-US')}</span>)}
      </div><span className="tms-mark" aria-hidden="true"/>
    </div>
    <p id="range-help" className="tms-help">Drag or use ← → · 250 nm steps</p>
  </div>;
}
