import { db } from './db';
import { PostHog } from 'posthog-node';
export async function record(event:string,visitor:string,properties:Record<string,unknown>){db.prepare('INSERT INTO events (event,visitor,properties) VALUES (?,?,?)').run(event,visitor,JSON.stringify(properties));const key=process.env.NEXT_PUBLIC_POSTHOG_KEY;if(key){const ph=new PostHog(key,{host:process.env.NEXT_PUBLIC_POSTHOG_HOST||'https://us.i.posthog.com',flushAt:1,flushInterval:0});try{ph.capture({distinctId:visitor,event,properties});await ph.shutdown();}catch{console.error('PostHog delivery failed');}}}
