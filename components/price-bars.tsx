"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { buildPriceBins, PRICE_GROUPS } from "@/lib/filter-controls";

type Jet={base_price:number|null;range:number;business_jet_category:string};
const CH=104, GAP=2, TIP_WIDTH=144;
export function PriceBars({jets,min,max,active}:{jets:Jet[];min:number;max:number;active:boolean}) {
  const data=useMemo(()=>buildPriceBins(jets),[jets]);
  const [at,setAt]=useState<number|null>(null);
  const [seen,setSeen]=useState(false);
  const [width,setWidth]=useState(240);
  const plot=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const observer=new ResizeObserver(([e])=>setWidth(e.contentRect.width));
    if(plot.current)observer.observe(plot.current);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!active){setAt(null);return;}
    const id=requestAnimationFrame(()=>setSeen(true));
    return ()=>cancelAnimationFrame(id);
  },[active]);
  const selected=data.flatMap(b=>b.prices).filter(p=>p>=min&&p<=max).length;
  const maxCount=Math.max(1,...data.map(b=>b.prices.length));
  const scale=(CH-10)/maxCount;
  const gap=4;
  const barWidth=Math.max(2,(width-gap*19)/20);
  const layout=data.map(b=>{
    let bottom=0;
    const segs=b.values.map((count,k)=>{
      const height=count ? count*scale-GAP : 0;
      const result={k,height,bottom};
      if(count)bottom+=height+GAP;
      return result;
    });
    return {segs,height:Math.max(2,bottom-GAP)};
  });
  const current=at===null?null:data[at];
  const left=at===null?0:at*(barWidth+gap);
  const tipWidth=Math.min(TIP_WIDTH,width);
  const tipLeft=Math.max(0,Math.min(width-tipWidth,left+barWidth+8+tipWidth<=width?left+barWidth+8:left-tipWidth-8));
  function bandLabel(i:number){return `$${data[i].min}M to ${i===19?'':'under '}$${data[i].max}M`;}
  return <div className="stb price-bars" data-scrub={current?'':undefined} data-colour="off">
    <div className="stb-head"><div className="stb-titles"><div className="stb-title">Aircraft by price</div><div className="stb-sub">Guide prices · $5M bands</div></div></div>
    <div className="stb-figure"><span key={selected} className="stb-num stb-digit" data-pop={seen||undefined}>{selected}</span><span className="stb-unit">aircraft in budget</span></div>
    <div ref={plot} className="stb-plot" role="group" aria-label="Aircraft price distribution. Use left and right arrows to inspect price bands." style={{height:CH+1}} onPointerLeave={()=>{if(!plot.current?.contains(document.activeElement))setAt(null);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setAt(null);}}>
      <span className="stb-base" style={{top:CH}}/>
      {data.map((bin,i)=><button type="button" key={i} className="stb-col" data-on={at===i||undefined} data-in-budget={bin.prices.some(p=>p>=min&&p<=max)||undefined} tabIndex={(at??0)===i?0:-1} aria-label={`${bandLabel(i)}: ${bin.prices.length} aircraft`} aria-describedby={at===i?'price-band-details':undefined}
        onPointerEnter={()=>setAt(i)} onFocus={()=>setAt(i)} onClick={()=>setAt(i)}
        onKeyDown={e=>{if(e.key==='Escape'){setAt(null);return;}const next=e.key==='Home'?0:e.key==='End'?19:e.key==='ArrowRight'?Math.min(19,i+1):e.key==='ArrowLeft'?Math.max(0,i-1):null;if(next===null)return;e.preventDefault();plot.current?.querySelectorAll<HTMLButtonElement>('.stb-col')[next]?.focus();}}
        style={{left:i*(barWidth+gap),width:barWidth,'--i':i} as CSSProperties}>
        {layout[i].segs.map(seg=><span key={seg.k} className="stb-bar" style={{'--c':`var(--stb-c${seg.k+1})`,bottom:seen?seg.bottom+3:3,height:seen?seg.height:0} as CSSProperties}/>)}
        {bin.prices.length===0&&<span className="stb-zero"/>}
      </button>)}
      {at!==null&&<span className="stb-ring" aria-hidden="true" style={{transform:`translate(${left-2}px,${CH-layout[at].height-5}px)`,width:barWidth+4,height:layout[at].height+7}}/>}
      <div className="stb-tip" id="price-band-details" role="tooltip" hidden={!current} style={{transform:`translateX(${tipLeft}px)`,width:tipWidth}}>
        {current&&<><div className="stb-tip-head"><span>${current.min}–{current.max}M</span><b>{current.prices.length} aircraft</b></div>
        {current.values.map((n,k)=>n>0&&<div className="stb-tip-row" key={k}><i style={{'--c':`var(--stb-c${k+1})`} as CSSProperties}/><span>{PRICE_GROUPS[k]}</span><b>{n}</b></div>)}
        <div className="stb-tip-row"><span>In budget</span><b>{current.prices.filter(p=>p>=min&&p<=max).length}</b></div></>}
      </div>
    </div>
    <div className="stb-axis"><span>$0M</span><span>$50M</span><span>$100M</span></div>
  </div>;
}
