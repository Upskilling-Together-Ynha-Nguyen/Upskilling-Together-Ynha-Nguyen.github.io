import {loadEnvFile} from 'node:process';
import {PostHog} from 'posthog-node';
loadEnvFile('.env.local');
const ph=new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY,{host:process.env.NEXT_PUBLIC_POSTHOG_HOST||'https://us.i.posthog.com',flushAt:100,flushInterval:0});
let count=0;
for(let i=0;i<40;i++){
 const properties={abc_dashboard_demo:true,source:i<24?'facebook':i<32?'google':'direct',tutor_id:['emma','emma','marcus','sophie','james'][i%5],subject:['Math','Math','Science','Reading','Algebra II'][i%5],$process_person_profile:false};
 const events=['page_viewed',...(i<32?['subject_searched','tutor_viewed']:[]),...(i<20?['booking_started']:[]),...(i<12?['booking_completed']:[])];
 events.forEach((event,j)=>{ph.capture({distinctId:`abc-dashboard-demo-v1-${i}`,event,properties,timestamp:new Date(Date.now()-86400000*(1+i%7)+j*60000)});count++;});
}
await ph.shutdown();console.log(`Submitted ${count} demo events for 40 simulated visitors; 12 simulated completions. No actual bookings created.`);
