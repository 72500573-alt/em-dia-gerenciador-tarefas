import {DatabaseSync} from 'node:sqlite';
// Adaptador de driver, não mock: todo SQL roda no SQLite real em arquivo temporário.
export function openDatabase(filename) {
 const sqlite=new DatabaseSync(filename);
 return {sqlite,prepare(sql){ const statement=sqlite.prepare(sql); return {bind(...params){return {
  async first(){return statement.get(...params)??null},
  async all(){return {results:statement.all(...params)}},
  async run(){const r=statement.run(...params);return {meta:{changes:Number(r.changes)}}}
 }}}}};
}
