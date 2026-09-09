import {readFileSync,existsSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {loadEnvFile} from 'node:process';
loadEnvFile('.env.local');
for(const route of ['index.html','tutors/index.html','insights/index.html','404.html'])assert(existsSync(`out/${route}`),`Missing ${route}`);
const files=readdirSync('out',{recursive:true}).filter(f=>/\.(html|js|txt)$/.test(f));
for(const file of files){const content=readFileSync(`out/${file}`,'utf8');for(const key of ['POSTHOG_PERSONAL_API_KEY','RESEND_API_KEY']){const value=process.env[key];if(value)assert(!content.includes(value),`Private credential in ${file}`);}assert(!content.includes('/api/bookings')&&!content.includes('/api/events'),`Server dependency in ${file}`);}
const html=readFileSync('out/index.html','utf8');for(const [,url] of html.matchAll(/(?:src|href)="(\/_next\/[^"?]+)/g))assert(existsSync(`out${url.replaceAll('&amp;','&')}`),`Missing asset ${url}`);
console.log('PASS: exported routes, homepage asset references, no server API dependencies, no private keys in output.');
