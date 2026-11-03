import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {openDatabase} from './sqlite-adapter.mjs';
import {handleTasks} from '../lib/tasks.mjs';
let db,server,base,dir;
before(async()=>{
 dir=mkdtempSync(join(tmpdir(),'em-dia-test-'));db=openDatabase(join(dir,'test.sqlite'));
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.sqlite.exec(readFileSync('drizzle/'+file,'utf8'));
 // Simula somente o provedor externo de identidade; HTTP, SQL e regras são reais.
 server=createServer(async(req,res)=>{try{
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const request=new Request(base+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
 const response=await handleTasks(request,db,req.headers['x-test-user']);
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
 }catch{res.writeHead(500);res.end('{}')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
});
beforeEach(()=>db.sqlite.exec('DELETE FROM tasks'));
after(async()=>{await new Promise(resolve=>server.close(resolve));db.sqlite.close();rmSync(dir,{recursive:true,force:true})});
const task=(extra={})=>({id:randomUUID(),title:'Estudar testes',description:'Revisar a matéria',priority:'media',dueDate:'2026-11-10',status:'pendente',...extra});
async function api(method='GET',path='',data,user='A',headers={}){const r=await fetch(base+'/api/tasks'+path,{method,headers:{...(user?{'x-test-user':user}:{}),'Content-Type':'application/json',Origin:base,...headers},...(data!==undefined?{body:typeof data==='string'?data:JSON.stringify(data)}:{})});return {status:r.status,data:await r.json()};}
test('quando cadastro dados válidos, então persiste, lista e consulta a tarefa',async()=>{const t=task();assert.equal((await api('POST','',t)).status,201);assert.equal((await api()).data.length,1);assert.equal((await api('GET','/'+t.id)).data.title,t.title);assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM tasks').get().n,1)});
test('quando edito e concluo, então altera dados e incrementa versão',async()=>{const t=task();await api('POST','',t);const r=await api('PUT','/'+t.id,{...t,title:'Título alterado',status:'concluida',version:1});assert.equal(r.status,200);assert.equal(r.data.version,2);assert.equal(r.data.status,'concluida');assert.equal(r.data.title,'Título alterado')});
test('quando reabro tarefa concluída, então volta a pendente',async()=>{const t=task({status:'concluida'});await api('POST','',t);assert.equal((await api('PUT','/'+t.id,{...t,status:'pendente',version:1})).data.status,'pendente')});
test('quando excluo, então remove e repetição retorna 404',async()=>{const t=task();await api('POST','',t);assert.equal((await api('DELETE','/'+t.id,{version:1})).status,200);assert.equal((await api('DELETE','/'+t.id,{version:1})).status,404);assert.equal((await api()).data.length,0)});
for(const [name,extra] of [['título vazio',{title:'  '}],['título longo',{title:'a'.repeat(101)}],['descrição longa',{description:'a'.repeat(1001)}],['prioridade negativa',{priority:-1}],['status inválido',{status:'admin'}],['data inexistente',{dueDate:'2026-02-30'}],['data ausente',{dueDate:''}],['id inválido',{id:'123'}]])test(`quando envio ${name}, então retorna 400 e não grava`,async()=>{assert.equal((await api('POST','',task(extra))).status,400);assert.equal((await api()).data.length,0)});
test('quando uso limites exatos e ano bissexto, então aceita',async()=>{assert.equal((await api('POST','',task({title:'a'.repeat(100),description:'b'.repeat(1000),dueDate:'2028-02-29'}))).status,201)});
test('quando não estou autenticado, então rejeita leitura e gravação',async()=>{assert.equal((await api('GET','',undefined,'')).status,401);assert.equal((await api('POST','',task(),'')).status,401)});
test('quando B tenta consultar, alterar ou excluir tarefa de A, então retorna 404',async()=>{const t=task();await api('POST','',t);assert.equal((await api('GET','',undefined,'B')).data.length,0);assert.equal((await api('GET','/'+t.id,undefined,'B')).status,404);assert.equal((await api('PUT','/'+t.id,{...t,version:1},'B')).status,404);assert.equal((await api('DELETE','/'+t.id,{version:1},'B')).status,404);assert.equal((await api('GET','/'+t.id)).data.version,1)});
test('quando cliente falsifica owner, então servidor mantém titularidade de A',async()=>{const t=task({owner:'B'});await api('POST','',t);assert.equal((await api()).data.length,1);assert.equal((await api('GET','',undefined,'B')).data.length,0)});
test('quando POST idêntico chega duas vezes simultaneamente, então existe uma tarefa',async()=>{const t=task();const r=await Promise.all([api('POST','',t),api('POST','',t)]);assert.deepEqual(r.map(x=>x.status),[201,201]);assert.equal((await api()).data.length,1)});
test('quando duas edições usam mesma versão, então só uma vence',async()=>{const t=task();await api('POST','',t);const r=await Promise.all([api('PUT','/'+t.id,{...t,title:'A',version:1}),api('PUT','/'+t.id,{...t,title:'B',version:1})]);assert.deepEqual(r.map(x=>x.status).sort(),[200,409]);assert.equal((await api('GET','/'+t.id)).data.version,2)});
test('quando exclusão usa versão antiga, então retorna 409 sem apagar',async()=>{const t=task();await api('POST','',t);await api('PUT','/'+t.id,{...t,version:1});assert.equal((await api('DELETE','/'+t.id,{version:1})).status,409);assert.equal((await api()).data.length,1)});
test('quando reutilizo ID com dados diferentes ou outro usuário, então retorna 409',async()=>{const t=task();await api('POST','',t);assert.equal((await api('POST','',{...t,title:'Outro'})).status,409);assert.equal((await api('POST','',t,'B')).status,409);assert.equal((await api('GET','/'+t.id)).data.title,t.title)});
test('quando envio JSON quebrado, conteúdo excessivo ou tipo errado, então rejeita',async()=>{assert.equal((await api('POST','','{')).status,400);assert.equal((await api('POST','','a'.repeat(10001))).status,413);assert.equal((await api('POST','',task(),'A',{'Content-Type':'text/plain'})).status,415)});
test('quando origem é externa ou ausente, então retorna 403',async()=>{assert.equal((await api('POST','',task(),'A',{Origin:'https://outro.example'})).status,403);assert.equal((await api('POST','',task(),'A',{Origin:''})).status,403)});
test('quando título contém SQL ou HTML, então salva texto sem executar SQL',async()=>{const t=task({title:"<script>alert(1)</script> '; DROP TABLE tasks; --"});assert.equal((await api('POST','',t)).status,201);assert.equal((await api('GET','/'+t.id)).data.title,t.title);assert.equal((await api()).data.length,1)});
test('quando versão é zero, negativa ou ausente, então retorna 400',async()=>{const t=task();await api('POST','',t);for(const version of [0,-1,undefined])assert.equal((await api('PUT','/'+t.id,{...t,version})).status,400)});
test('quando fecho e reabro o banco real, então os dados permanecem',async()=>{const t=task();await api('POST','',t);db.sqlite.close();db=openDatabase(join(dir,'test.sqlite'));assert.equal((await api('GET','/'+t.id)).data.title,t.title)});
