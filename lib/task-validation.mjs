export function validateTask(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Dados inválidos.';
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.trim().length > 100) return 'Informe um título de até 100 caracteres.';
  if (typeof value.description !== 'string' || value.description.length > 1000) return 'A descrição deve ter até 1.000 caracteres.';
  if (!['baixa','media','alta'].includes(value.priority)) return 'Prioridade inválida.';
  if (!['pendente','concluida'].includes(value.status)) return 'Status inválido.';
  if (typeof value.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.dueDate) || !Number.isFinite(Date.parse(value.dueDate)) || new Date(value.dueDate).toISOString().slice(0,10) !== value.dueDate) return 'Informe uma data válida.';
  return null;
}
