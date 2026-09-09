export function identity(){try{let id=sessionStorage.getItem('abc-visitor');if(!id){id=crypto.randomUUID();sessionStorage.setItem('abc-visitor',id);}return id;}catch{return 'anonymous';}}
export function source(){try{const q=new URLSearchParams(location.search);const value=q.get('utm_source');if(value)sessionStorage.setItem('abc-source',value==='facebook'?'facebook':value==='google'?'google':'other');if(!sessionStorage.getItem('abc-source'))sessionStorage.setItem('abc-source',document.referrer.includes('facebook.com')?'facebook':document.referrer?'other':'direct');return sessionStorage.getItem('abc-source')||'direct';}catch{return 'direct';}}
export function track(event:string,properties:Record<string,string>={}){
 const payload={...properties,source:source(),prototype_mode:'browser_local',abc_dashboard_demo:false};
 try{const events=JSON.parse(localStorage.getItem('abc-events')||'[]');events.push({event,properties:payload});localStorage.setItem('abc-events',JSON.stringify(events.slice(-500)));}catch{}
 const key=process.env.NEXT_PUBLIC_POSTHOG_KEY;
 if(key)void fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST||'https://us.i.posthog.com'}/i/v0/e/`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,event,properties:{...payload,distinct_id:identity(),$process_person_profile:false}}),keepalive:true}).catch(()=>{});
}
