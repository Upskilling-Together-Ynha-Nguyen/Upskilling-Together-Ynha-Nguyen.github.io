import {loadEnvFile} from 'node:process';
loadEnvFile('.env.local');
const env=process.env;
for(const k of ['POSTHOG_HOST','POSTHOG_PROJECT_ID','POSTHOG_PERSONAL_API_KEY','NEXT_PUBLIC_POSTHOG_KEY'])if(!env[k])throw new Error(`Missing ${k}`);
const host=env.POSTHOG_HOST.replace(/\/$/,'');
export async function api(path,method='GET',body){const r=await fetch(`${host}/api/projects/${env.POSTHOG_PROJECT_ID}/${path}`,{method,headers:{Authorization:`Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error(`${method} ${path}: ${r.status} ${(await r.text()).slice(0,400)}`);if(!r.headers.get('content-type')?.includes('application/json'))throw new Error(`Expected JSON; received ${r.headers.get('content-type')} at ${r.url}. Check host and project ID.`);return r.json();}
const list=await api('dashboards/?limit=100');console.log(JSON.stringify({connection:'ok',dashboards:list.results.map(d=>({id:d.id,name:d.name}))}));
if(process.argv.includes('--create')) {
 const name='ABC Tutoring · Parent journey & bookings (demo)';
 let dashboard=list.results.find(d=>d.name===name);
 if(!dashboard)dashboard=await api('dashboards/','POST',{name,description:'DEMO DATA — simulated visitors, not real families or reservations. Last 30 days. Tutor popularity, subject demand, ordered booking funnel, completed bookings, and referral performance. All charts isolate abc_dashboard_demo=true; no parent or student details.',filters:{date_from:'-30d'}});
 console.log('Dashboard',dashboard.id);
 const scope="properties.abc_dashboard_demo = true AND timestamp >= now() - INTERVAL 30 DAY";
 const definitions=[
 ['Demo: Most-viewed tutors',`SELECT properties.tutor_id AS tutor, count() AS profile_views, count(DISTINCT distinct_id) AS visitors FROM events WHERE ${scope} AND event='tutor_viewed' GROUP BY tutor ORDER BY profile_views DESC`],
 ['Demo: Subjects parents seek',`SELECT properties.subject AS subject, count(DISTINCT distinct_id) AS interested_visitors FROM events WHERE ${scope} AND event='subject_searched' GROUP BY subject ORDER BY interested_visitors DESC`],
 ['Demo: Completed bookings by day',`SELECT toDate(timestamp) AS day, count() AS completed_bookings FROM events WHERE ${scope} AND event='booking_completed' GROUP BY day ORDER BY day`],
 ['Demo: Referrals — does Facebook lead to bookings?',`SELECT properties.source AS source, count(DISTINCT if(event='page_viewed',distinct_id,NULL)) AS visitors, count(DISTINCT if(event='booking_completed',distinct_id,NULL)) AS booked_visitors, round(100.0 * count(DISTINCT if(event='booking_completed',distinct_id,NULL)) / nullIf(count(DISTINCT if(event='page_viewed',distinct_id,NULL)),0),1) AS conversion_percent FROM events WHERE ${scope} GROUP BY source ORDER BY visitors DESC`],
 ['Demo: Visitors who book vs. leave without booking',`SELECT count(DISTINCT if(event='page_viewed',distinct_id,NULL)) AS visitors, count(DISTINCT if(event='booking_completed',distinct_id,NULL)) AS booked_visitors, count(DISTINCT if(event='page_viewed',distinct_id,NULL))-count(DISTINCT if(event='booking_completed',distinct_id,NULL)) AS visitors_without_booking FROM events WHERE ${scope}`]
 ];
 const existing=await api(`dashboards/${dashboard.id}/`);
 for(const [title,query] of definitions){if(existing.tiles?.some(t=>t.insight?.name===title))continue;const insight=await api('insights/','POST',{name:title,description:'Synthetic demonstration only. Filters exclude real website traffic.',saved:true,dashboards:[dashboard.id],query:{kind:'DataTableNode',source:{kind:'HogQLQuery',query}}});console.log('Created',insight.name);}
 const funnelName='Demo: Browse → view tutor → start → complete (7-day funnel)';
 if(!existing.tiles?.some(t=>t.insight?.name===funnelName))await api('insights/','POST',{name:funnelName,saved:true,dashboards:[dashboard.id],query:{kind:'InsightVizNode',source:{kind:'FunnelsQuery',dateRange:{date_from:'-30d'},properties:[{key:'abc_dashboard_demo',value:true,operator:'exact',type:'event'}],series:['page_viewed','tutor_viewed','booking_started','booking_completed'].map(event=>({kind:'EventsNode',event,name:event})),funnelsFilter:{funnelWindowInterval:7,funnelWindowIntervalUnit:'day',funnelVizType:'steps',funnelOrderType:'ordered'}}}});
 await api(`dashboards/${dashboard.id}/sharing/`,'PATCH',{enabled:true});
 const sharing=await api(`dashboards/${dashboard.id}/sharing/`);if(!sharing.enabled)throw new Error('Public sharing is not enabled');console.log('Public dashboard:',`${host}/shared/${sharing.access_token}`);
}
