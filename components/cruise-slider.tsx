"use client";
import {useEffect,useRef} from "react";
export function CruiseSlider({value,onChange}:{value:number;onChange:(v:number)=>void}) {
 const fill=useRef<HTMLDivElement>(null);
 const position=useRef(value/550*100);
 useEffect(()=>{
  let frame=0,velocity=0,last=0;
  const target=value/550*100;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paint=(time:number)=>{
   const dt=last?Math.min((time-last)/16.67,2):1;last=time;
   velocity=(velocity+(target-position.current)*.24*dt)*Math.pow(.76,dt);
   position.current=reduced?target:Math.max(0,Math.min(100,position.current+velocity*dt));
   if(fill.current){fill.current.style.width=position.current+'%';fill.current.style.setProperty('--lean',Math.max(-12,Math.min(12,velocity*2))+'px');}
   if(!reduced&&(Math.abs(target-position.current)>.02||Math.abs(velocity)>.02))frame=requestAnimationFrame(paint);
   else if(fill.current){position.current=target;fill.current.style.width=target+'%';fill.current.style.setProperty('--lean','0px');}
  };frame=requestAnimationFrame(paint);return()=>cancelAnimationFrame(frame);
 },[value]);
 return <div className="cruise-slosh"><div className="cruise-liquid" ref={fill}/><span className="cruise-marker" style={{left:`calc(14px + (100% - 28px) * ${value/550})`}}/><input id="speed" aria-label="Minimum high-speed cruise" aria-valuetext={value?`${value} knots true airspeed`:'Any cruise speed'} type="range" min={0} max={550} step={25} value={value} onChange={e=>onChange(Number(e.target.value))}/></div>;
}
