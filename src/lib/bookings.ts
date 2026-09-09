import {Tutor,slotsFor} from './tutors';
const key='abc-demo-bookings-v1';
type Booking={id:string;slot:string;tutor:string;subject:string;mode:string};
export function bookings():Booking[]{const value=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(value))throw new Error('Saved booking data could not be read.');return value;}
export function bookedSlots(){return bookings().map(b=>b.slot);}
export async function reserve(tutor:Tutor,slot:string,data:Record<string,FormDataEntryValue>){
 const save=()=>{const existing=bookings();if(existing.some(b=>b.slot===slot))throw new Error('That slot is already booked in this browser. Close this window and choose another time.');
 if(!slotsFor(tutor.id).some(s=>s.id===slot)||!tutor.subjects.includes(String(data.subject))||!tutor.modes.includes(String(data.mode))||!/^\S+@\S+\.\S+$/.test(String(data.email))||!String(data.parent||'').trim()||!String(data.student||'').trim()||Number(data.grade)<tutor.min||Number(data.grade)>tutor.max)throw new Error('Please check the booking details.');
 const id=crypto.randomUUID();localStorage.setItem(key,JSON.stringify([...existing,{id,slot,tutor:tutor.id,subject:String(data.subject),mode:String(data.mode)}]));return {id,notification:'not-sent'};};
 // Web Locks serialize reservations across tabs where supported. Different browsers remain independent.
 return navigator.locks? navigator.locks.request('abc-demo-booking',save):save();
}
