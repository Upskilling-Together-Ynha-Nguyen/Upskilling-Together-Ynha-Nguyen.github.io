import {execFileSync} from 'node:child_process';
import {loadEnvFile} from 'node:process';
loadEnvFile('.env.local');
const credential=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8'});
const token=credential.split('\n').find(l=>l.startsWith('password='))?.slice(9);if(!token)throw new Error('No GitHub credential available');
const repo='Upskilling-Together-Ynha-Nguyen/Upskilling-Together-Ynha-Nguyen.github.io';
async function api(path,method='GET',body){const r=await fetch(`https://api.github.com/repos/${repo}/${path}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!r.ok&&r.status!==404)throw new Error(`${path}: HTTP ${r.status}`);return {status:r.status,data:r.status===204?null:await r.json()};}
if(process.argv.includes('--configure')){
 for(const name of ['NEXT_PUBLIC_POSTHOG_KEY','NEXT_PUBLIC_POSTHOG_HOST']){const value=process.env[name];if(!value)throw new Error(`Missing ${name}`);const existing=await api(`actions/variables/${name}`);await api(existing.status===404?'actions/variables':`actions/variables/${name}`,existing.status===404?'POST':'PATCH',{name,value});console.log(`Configured public build variable ${name}`);}
 const pages=await api('pages');const result=await api('pages',pages.status===404?'POST':'PUT',{build_type:'workflow'});console.log('Pages configuration',result.status);
}
if(process.argv.includes('--status')){const r=await api('actions/runs?per_page=3');console.log(JSON.stringify(r.data.workflow_runs?.map(r=>({id:r.id,status:r.status,conclusion:r.conclusion,url:r.html_url,sha:r.head_sha}))));}
