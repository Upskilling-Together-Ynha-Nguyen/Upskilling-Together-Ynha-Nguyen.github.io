import {api} from './posthog-dashboard.mjs';
const d=await api('dashboards/2078488/');
for(const tile of d.tiles||[]){if(!tile.insight?.query)continue;const q=tile.insight.query.source;try{const r=await api('query/','POST',{query:q});console.log(JSON.stringify({name:tile.insight.name,results:r.results,error:r.error}));}catch(e){console.log(tile.insight.name,String(e));}}
