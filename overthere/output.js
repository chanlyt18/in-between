// Fine output structure is derived from the exact arrived cable samples and
// their recorded history. No per-frame random numbers or independent clock.
import {H,notes,routes,rng,clamp,fieldSample,mix} from './engine.js';
const r=rng(7741);
export const RAY_COUNT=820;
export const rayTraits=Array.from({length:RAY_COUNT},(_,i)=>({y:i/(RAY_COUNT-1)*H,length:.22+r()*.91,width:.21+r()*.22,core:r()>.29,lag:.02+r()*.12,detail:r()}));
const offsets=[-71,-47,-31,-18,-9,-3,7,16,29,43,61,82,101,-89];
const strata=notes.map((note,n)=>({n,bank:n%3,offset:offsets[Math.floor(n/3)%offsets.length],sigma:2.4+(n*13%19)*.34,route:n*5+(n%5),lag:.035+(n%7)*.024}));
// Linear interpolation in the actual 60 Hz sample buffer retains continuous
// fractional-time animation on 90/120 Hz displays as well as ordinary ones.
export function historyValue(history,current,time,key,index){if(!history.length||time>=current.t)return current[key][index];let lo=0,hi=history.length-1;if(time<=history[0].t)return history[0][key][index];if(time>=history[hi].t){const a=history[hi];return mix(a[key][index],current[key][index],clamp((time-a.t)/(current.t-a.t||1)));}while(lo+1<hi){const m=(lo+hi)>>1;if(history[m].t<=time)lo=m;else hi=m;}const a=history[lo],b=history[hi];return mix(a[key][index],b[key][index],clamp((time-a.t)/(b.t-a.t||1)));}
export function computeEmissions(s,history=[]){const fine=new Float64Array(RAY_COUNT),bankEnergy=new Float64Array(3),bankMoment=new Float64Array(3),bankCount=new Float64Array(3);for(const p of strata){const n=p.n,a=s.arrivals[n],lag=historyValue(history,s,s.t-p.lag,'arrivals',n),lead=s.routeAmplitudes[p.route],imbalance=s.routeAmplitudes[n*5]-s.routeAmplitudes[n*5+4];bankEnergy[p.bank]+=a;bankMoment[p.bank]+=(a-lag)*(n%2?1:-1);bankCount[p.bank]++;const center=routes[n*5].y+p.offset+clamp(imbalance,-1.5,1.5)*6,drive=(a*.72+lead*.28),sigma=p.sigma*(.85+clamp(lag)*.35);const begin=Math.max(0,Math.floor((center-sigma*4)/H*(RAY_COUNT-1))),end=Math.min(RAY_COUNT-1,Math.ceil((center+sigma*4)/H*(RAY_COUNT-1)));for(let i=begin;i<=end;i++){const u=(rayTraits[i].y-center)/sigma;const primary=Math.exp(-.5*u*u),side=Math.exp(-.5*((u-2.9)/.48)**2)*.37;fine[i]+=drive*(primary+side);}}
 const bankCenters=[229,492,754];for(let b=0;b<3;b++)bankEnergy[b]/=bankCount[b];
 const values=new Array(RAY_COUNT);for(let i=0;i<RAY_COUNT;i++){const ray=rayTraits[i],y=ray.y;let core=0,gate=1;for(let b=0;b<3;b++){const dy=y-bankCenters[b];core+=bankEnergy[b]*2.2*Math.exp(-.5*(dy/15)**2);const shift=clamp(bankMoment[b]*32,-13,13);for(const sign of [-1,1]){const gap=dy-sign*(39+bankEnergy[b]*31)-shift;const notch=Math.exp(-.5*(gap/(5+bankEnergy[b]*9))**2);gate*=1-notch*.96;}}
 const broad=fieldSample(s.field,y),carrier=(broad*.29+fine[i]*.32)*gate,detail=(fine[i]*1.32+core)*gate;const strength=clamp(detail*1.6,0,2),darkness=clamp(Math.pow(strength,.62)),excursion=(.12+Math.sqrt(Math.max(0,strength))*.68+carrier*.8)*ray.length;
 values[i]={y,carrier,detail,strength,darkness,excursion,gate,core:ray.core,width:ray.width,seed:ray.detail};}
 return{rays:values,bankEnergy,bankMoment};}
