import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../../chatgpt-auth';
import { handleTasks } from '../../../../lib/tasks.mjs';
export const dynamic = 'force-dynamic';
async function route(request: Request) {
  const user = await getChatGPTUser();
  try { return await handleTasks(request, env.DB, user?.userId); }
  catch { return Response.json({error:'Não foi possível acessar as tarefas. Tente novamente.'},{status:500}); }
}
export { route as GET, route as POST, route as PUT, route as DELETE };
