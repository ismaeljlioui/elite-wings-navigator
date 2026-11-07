"use client";
import { useState, type CSSProperties } from "react";
import { Columns3, X } from "lucide-react";
type Item = { id:number; name:string; maker:string };
export function ShortlistStack({items,onRemove,onCompare}:{items:Item[];onRemove:(id:number)=>void;onCompare:()=>void}){
 const [open,setOpen]=useState(false);
 return <section className="shortlist-stack" aria-label="Aircraft shortlist" data-open={open || undefined} onPointerEnter={()=>setOpen(true)} onPointerLeave={()=>setOpen(false)} onFocus={()=>setOpen(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}} style={{'--count':items.length} as CSSProperties}>
 {items.map((item,i)=><div className="shortlist-paper" key={item.id} data-front={i===0 || undefined} aria-hidden={!open && i>0} style={{'--i':i,zIndex:items.length-i} as CSSProperties}>
 <Columns3 size={18}/><div className="shortlist-copy"><b>{item.name}</b><span>{open ? item.maker : `${items.length} of 3 aircraft · Your shortlist`}</span></div>
 {i===0 && <button className="shortlist-action" onClick={onCompare}>Compare</button>}
 <button className="shortlist-remove" aria-label={`Remove ${item.name} from shortlist`} tabIndex={open || i===0 ? 0 : -1} onClick={()=>onRemove(item.id)}><X size={16}/></button>
 </div>)}
 </section>;
}
