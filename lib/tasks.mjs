import { taskRepository } from './task-repository.mjs';
// O dono é recebido da autenticação do servidor, nunca do JSON enviado pelo cliente.
import { validateTask } from './task-validation.mjs';
export { validateTask } from './task-validation.mjs';
export function json(data, status=200) {
  return Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export async function handleTasks(request, db, owner) {
  if (!owner) return json({error:'Entre com sua conta para acessar as tarefas.'},401);
  const repo=taskRepository(db,owner);
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/tasks(?:\/([a-f0-9-]{36}))?\/?$/);
  if (!match) return json({error:'Endereço não encontrado.'},404);
  const id=match[1]; const method=request.method;
  if (method === 'GET') {
    if (id) { const task=await repo.find(id); return task ? json(task):json({error:'Tarefa não encontrada.'},404); }
    return json(await repo.list());
  }
  if (!['POST','PUT','DELETE'].includes(method)) return json({error:'Método não permitido.'},405);
  // Bloqueia gravações feitas por outra origem (proteção contra CSRF).
  if (request.headers.get('origin') !== url.origin) return json({error:'Origem não permitida.'},403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Envie dados no formato JSON.'},415);
  let data;
  try {
    const reader=request.body?.getReader(); const chunks=[]; let size=0;
    if(reader) while(true) {
      const {done,value}=await reader.read(); if(done) break;
      size+=value.byteLength;
      if(size>10000) { await reader.cancel(); return json({error:'Dados muito grandes.'},413); }
      chunks.push(value);
    }
    const bytes=new Uint8Array(size); let offset=0;
    for(const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.byteLength; }
    data=JSON.parse(new TextDecoder().decode(bytes));
  } catch { return json({error:'JSON inválido.'},400); }
  if (method === 'POST' && !id) {
    const error=validateTask(data); if(error) return json({error},400);
    if(typeof data.id!=='string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(data.id)) return json({error:'Identificador inválido.'},400);
    await repo.create(data);
    const task=await repo.find(data.id);
    if(!task) return json({error:'Identificador já utilizado.'},409);
    if(task.title!==data.title.trim() || task.description!==data.description.trim() || task.priority!==data.priority || task.dueDate!==data.dueDate || task.status!==data.status) return json({error:'Identificador reutilizado com dados diferentes.'},409);
    return json(task,201);
  }
  if (!id) return json({error:'Informe a tarefa.'},400);
  if(!Number.isInteger(data?.version) || data.version<1) return json({error:'Versão inválida.'},400);
  if(method==='PUT') {
    const error=validateTask(data); if(error) return json({error},400);
    const result=await repo.update(id,data);
    if(result.meta.changes) return json(await repo.find(id));
  } else if(method==='DELETE') {
    const result=await repo.remove(id,data.version);
    if(result.meta.changes) return json({message:'Tarefa excluída.'});
  } else return json({error:'Método não permitido.'},405);
  const existing=await repo.exists(id);
  return existing ? json({error:'A tarefa mudou em outra aba. Atualize antes de tentar novamente.'},409):json({error:'Tarefa não encontrada.'},404);
}
