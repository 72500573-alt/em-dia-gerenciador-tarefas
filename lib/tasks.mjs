// O dono é recebido da autenticação do servidor, nunca do JSON enviado pelo cliente.
export function validateTask(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Dados inválidos.';
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.trim().length > 100) return 'Informe um título de até 100 caracteres.';
  if (typeof value.description !== 'string' || value.description.length > 1000) return 'A descrição deve ter até 1.000 caracteres.';
  if (!['baixa','media','alta'].includes(value.priority)) return 'Prioridade inválida.';
  if (!['pendente','concluida'].includes(value.status)) return 'Status inválido.';
  if (typeof value.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.dueDate) || !Number.isFinite(Date.parse(value.dueDate)) || new Date(value.dueDate).toISOString().slice(0,10) !== value.dueDate) return 'Informe uma data válida.';
  return null;
}
export function json(data, status=200) {
  return Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
const select = 'SELECT id,title,description,priority,due_date AS dueDate,status,version,created_at AS createdAt FROM tasks';
export async function handleTasks(request, db, owner) {
  if (!owner) return json({error:'Entre com sua conta para acessar as tarefas.'},401);
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/tasks(?:\/([a-f0-9-]{36}))?\/?$/);
  if (!match) return json({error:'Endereço não encontrado.'},404);
  const id=match[1]; const method=request.method;
  if (method === 'GET') {
    if (id) { const task=await db.prepare(select+' WHERE id=? AND owner=?').bind(id,owner).first(); return task ? json(task):json({error:'Tarefa não encontrada.'},404); }
    const result=await db.prepare(select+' WHERE owner=? ORDER BY created_at DESC,id').bind(owner).all();
    return json(result.results);
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
    await db.prepare('INSERT INTO tasks (id,owner,title,description,priority,due_date,status,version,created_at) VALUES (?,?,?,?,?,?,?,1,?) ON CONFLICT(id) DO NOTHING').bind(data.id,owner,data.title.trim(),data.description.trim(),data.priority,data.dueDate,data.status,new Date().toISOString()).run();
    const task=await db.prepare(select+' WHERE id=? AND owner=?').bind(data.id,owner).first();
    if(!task) return json({error:'Identificador já utilizado.'},409);
    if(task.title!==data.title.trim() || task.description!==data.description.trim() || task.priority!==data.priority || task.dueDate!==data.dueDate || task.status!==data.status) return json({error:'Identificador reutilizado com dados diferentes.'},409);
    return json(task,201);
  }
  if (!id) return json({error:'Informe a tarefa.'},400);
  if(!Number.isInteger(data?.version) || data.version<1) return json({error:'Versão inválida.'},400);
  if(method==='PUT') {
    const error=validateTask(data); if(error) return json({error},400);
    const result=await db.prepare('UPDATE tasks SET title=?,description=?,priority=?,due_date=?,status=?,version=version+1 WHERE id=? AND owner=? AND version=?').bind(data.title.trim(),data.description.trim(),data.priority,data.dueDate,data.status,id,owner,data.version).run();
    if(result.meta.changes) return json(await db.prepare(select+' WHERE id=? AND owner=?').bind(id,owner).first());
  } else if(method==='DELETE') {
    const result=await db.prepare('DELETE FROM tasks WHERE id=? AND owner=? AND version=?').bind(id,owner,data.version).run();
    if(result.meta.changes) return json({message:'Tarefa excluída.'});
  } else return json({error:'Método não permitido.'},405);
  const existing=await db.prepare('SELECT id FROM tasks WHERE id=? AND owner=?').bind(id,owner).first();
  return existing ? json({error:'A tarefa mudou em outra aba. Atualize antes de tentar novamente.'},409):json({error:'Tarefa não encontrada.'},404);
}
