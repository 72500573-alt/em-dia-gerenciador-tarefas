// Acesso ao banco. Todas as operações exigem o dono autenticado.
const select = 'SELECT id,title,description,priority,due_date AS dueDate,status,version,created_at AS createdAt FROM tasks';
export function taskRepository(db, owner) {
 return {
  async find(id) { return db.prepare(select+' WHERE id=? AND owner=?').bind(id,owner).first(); },
  async list() { return (await db.prepare(select+' WHERE owner=? ORDER BY created_at DESC,id').bind(owner).all()).results; },
  async exists(id) { return db.prepare('SELECT id FROM tasks WHERE id=? AND owner=?').bind(id,owner).first(); },
  async create(data) {
   return db.prepare('INSERT INTO tasks (id,owner,title,description,priority,due_date,status,version,created_at) VALUES (?,?,?,?,?,?,?,1,?) ON CONFLICT(id) DO NOTHING').bind(data.id,owner,data.title.trim(),data.description.trim(),data.priority,data.dueDate,data.status,new Date().toISOString()).run();
  },
  async update(id,data) {
   return db.prepare('UPDATE tasks SET title=?,description=?,priority=?,due_date=?,status=?,version=version+1 WHERE id=? AND owner=? AND version=?').bind(data.title.trim(),data.description.trim(),data.priority,data.dueDate,data.status,id,owner,data.version).run();
  },
  async remove(id,version) { return db.prepare('DELETE FROM tasks WHERE id=? AND owner=? AND version=?').bind(id,owner,version).run(); }
 };
}
