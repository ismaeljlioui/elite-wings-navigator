import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {snapRange,rangeKeyTarget,buildPriceBins} from '../lib/filter-controls.ts';
test('range limits and keyboard nudges follow the latest dragged position',()=>{
 assert.equal(snapRange(-1000),0);
 assert.equal(snapRange(9000),8000);
 assert.equal(snapRange(3660),3750);
 assert.equal(rangeKeyTarget('ArrowRight',snapRange(3660)),4000);
 assert.equal(rangeKeyTarget('ArrowLeft',0),0);
 assert.equal(rangeKeyTarget('PageUp',7750),8000);
 assert.equal(rangeKeyTarget('Home',8000),0);
 assert.equal(rangeKeyTarget('End',0),8000);
 assert.equal(rangeKeyTarget('Tab',1000),null);
});
test('price bands count boundary prices once and exclude missing prices',()=>{
 const jet=p=>({base_price:p,range:2000,business_jet_category:'Light'});
 const bins=buildPriceBins([jet(null),jet(NaN),jet(-1),jet(0),jet(5e6),jet(100e6)]);
 assert.deepEqual(bins[0].prices,[0]);assert.deepEqual(bins[1].prices,[5]);assert.deepEqual(bins[19].prices,[100]);
 assert.equal(bins.reduce((n,b)=>n+b.prices.length,0),3);
});
test('all priced aircraft appear in exactly one stack',()=>{
 const jets=JSON.parse(readFileSync(new URL('../data/aircraft.json',import.meta.url)));
 const bins=buildPriceBins(jets);
 assert.equal(bins.reduce((n,b)=>n+b.values.reduce((a,v)=>a+v,0),0),jets.filter(j=>j.base_price!==null&&j.base_price>=0&&j.base_price<=1e8).length);
 for(const bin of bins)assert.equal(bin.values.reduce((a,v)=>a+v,0),bin.prices.length);
});
