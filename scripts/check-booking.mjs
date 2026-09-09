import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://localhost:3000';
const d=new Date();d.setUTCDate(d.getUTCDate()+3);d.setUTCHours(23,0,0,0);
const slot=`james-${d.toISOString()}`;
const payload={tutor:'james',slot,subject:'Science',mode:'Online',parent:'Demo Parent',email:'demo@example.com',student:'Demo',grade:8,visitor:'simulation-booking',source:'facebook'};
for(const event of ['page_viewed','tutor_viewed','subject_searched','booking_started']){const r=await fetch(`${base}/api/events`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,visitor:'simulation-booking',properties:{tutor_id:'james',subject:'Science',source:'facebook',page:'tutors'}})});assert.equal(r.status,200);}
const post=b=>fetch(`${base}/api/bookings`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
assert.equal((await post({...payload,email:'invalid'})).status,400);
const responses=await Promise.all([post(payload),post(payload)]);
const statuses=responses.map(r=>r.status).sort();assert.deepEqual(statuses,[201,409]);
const result=await(await fetch(`${base}/api/bookings`)).json();assert(result.booked.includes(slot));assert(!JSON.stringify(result).includes('demo@example.com'));
console.log('PASS: telemetry, invalid input, concurrent booking conflict, hidden slot, no public personal data.');
