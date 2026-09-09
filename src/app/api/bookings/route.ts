import { db } from '@/lib/db';
import { tutors,slotsFor,slotLabel } from '@/lib/tutors';
import { Resend } from 'resend';
import { record } from '@/lib/events';
export const runtime='nodejs';
export async function GET(){return Response.json({booked:db.prepare('SELECT slot FROM bookings').all().map(x=>x.slot)},{headers:{'Cache-Control':'no-store'}});}
export async function POST(req:Request){
 let b;try{b=await req.json();}catch{return Response.json({error:'Invalid request.'},{status:400});}
 const t=tutors.find(t=>t.id===b.tutor);const slot=t&&slotsFor(t.id).find(s=>s.id===b.slot);
 if(!t||!slot||!t.subjects.includes(b.subject)||!t.modes.includes(b.mode)||!Number.isInteger(Number(b.grade))||Number(b.grade)<t.min||Number(b.grade)>t.max||!['parent','student','email'].every(k=>typeof b[k]==='string'&&b[k].trim().length>0&&b[k].length<150)||!/^\S+@\S+\.\S+$/.test(b.email))return Response.json({error:'Please check your details and choose a matching subject and grade.'},{status:400});
 const id=crypto.randomUUID();try{db.prepare('INSERT INTO bookings (id,slot,tutor,subject,mode,parent,email,student,grade,time) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,b.slot,t.id,b.subject,b.mode,b.parent.trim(),b.email.trim(),b.student.trim(),Number(b.grade),slot.time);}catch(e){if(String(e).includes('UNIQUE'))return Response.json({error:'That time was just booked. Please choose another slot.'},{status:409});throw e;}
 let notification='queued';
 if(process.env.RESEND_API_KEY&&process.env.BOOKING_NOTIFY_EMAIL&&process.env.BOOKING_FROM_EMAIL){try{const result=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.BOOKING_FROM_EMAIL,to:process.env.BOOKING_NOTIFY_EMAIL,subject:`New ABC Tutoring booking with ${t.name}`,text:`Parent: ${b.parent}\nEmail: ${b.email}\nStudent: ${b.student}\nGrade: ${b.grade}\nSubject: ${b.subject}\nFormat: ${b.mode}\nTime: ${slotLabel(slot.time)} Pacific\nReference: ${id}`});notification=result.error?'failed':'sent';}catch{notification='failed';}}
 db.prepare('UPDATE bookings SET notification=? WHERE id=?').run(notification,id);
 await record('booking_completed',typeof b.visitor==='string'?b.visitor.slice(0,100):id,{tutor_id:t.id,subject:b.subject,format:b.mode,booking_id:id,source:['facebook','google','direct','other'].includes(b.source)?b.source:'direct'});
 return Response.json({id,notification},{status:201});
}
