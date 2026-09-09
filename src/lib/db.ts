import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
const dir=path.join(process.cwd(),'.data');mkdirSync(dir,{recursive:true});
export const db=new DatabaseSync(path.join(dir,'prototype.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, slot TEXT UNIQUE NOT NULL, tutor TEXT, subject TEXT, mode TEXT, parent TEXT, email TEXT, student TEXT, grade INTEGER, time TEXT, notification TEXT DEFAULT 'pending'); CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, event TEXT, visitor TEXT, properties TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);`);
