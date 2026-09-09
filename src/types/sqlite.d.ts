// Node 22 runtime API; this starter uses the older Node 20 declaration package.
declare module 'node:sqlite' {
 type Value = string | number | bigint | null | Uint8Array;
 export class DatabaseSync {
  constructor(path:string);
  exec(sql:string):void;
  prepare(sql:string):{
   all(...values:Value[]):Record<string,Value>[];
   run(...values:Value[]):{changes:number|bigint;lastInsertRowid:number|bigint};
  };
 }
}
