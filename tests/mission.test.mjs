import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { distanceNm, meetsMission } from '../lib/mission.ts';
const airports=JSON.parse(readFileSync(new URL('../data/airports.json',import.meta.url)));
const get=id=>airports.find(a=>a.id===id);
test('airport coordinates use longitude/latitude and plausible route lengths',()=>{
 for(const a of airports){assert.ok(Math.abs(a.coordinates[0])<=180);assert.ok(Math.abs(a.coordinates[1])<=90)}
 const transatlantic=distanceNm(get('KTEB').coordinates,get('EGLF').coordinates);
 assert.ok(transatlantic>2900&&transatlantic<3100,`NY-London ${transatlantic} nm`);
 const pacific=distanceNm(get('KSFO').coordinates,get('RJTT').coordinates);
 assert.ok(pacific>4400&&pacific<4600,`SF-Tokyo ${pacific} nm`);
});
test('distance handles identical, reversed and antipodal positions',()=>{
 assert.equal(distanceNm([0,0],[0,0]),0);
 assert.equal(distanceNm([0,0],[180,0]),10807);
 assert.equal(distanceNm(get('KTEB').coordinates,get('EGLF').coordinates),distanceNm(get('EGLF').coordinates,get('KTEB').coordinates));
});
test('mission screening excludes missing capacity and failing range/seats',()=>{
 const m={distance:3000,passengers:8};
 assert.equal(meetsMission({range:3000,max_passengers:8},m),true);
 assert.equal(meetsMission({range:2999,max_passengers:12},m),false);
 assert.equal(meetsMission({range:4000,max_passengers:7},m),false);
 assert.equal(meetsMission({range:4000,max_passengers:null},m),false);
});
