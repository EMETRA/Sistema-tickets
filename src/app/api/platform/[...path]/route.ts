import { queuePanelIncident } from '@/observability/server-incidents';
import { NextRequest } from 'next/server';
import { getGraphqlEndpoint } from '@/api/config/env';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function proxy(request:NextRequest,context:{params:Promise<{path:string[]}>}){
    if(process.env.TICKETS_PLATFORM_ENABLED!=='true')return Response.json({codigo:'FEATURE_DISABLED',message:'Los módulos nuevos de Tickets todavía no están habilitados.'},{status:503,headers:{'Cache-Control':'private, no-store'}});
    const {path}=await context.params;
    if(!['bootstrap','catalog','search','people','access-options','network','records','confirmations','rbac','requests','audit','metrics','monitor','repositories','sources','objects','tickets','files','organization','client-errors','module-access','inventory','boletas','vivi-reports'].includes(path[0]))return Response.json({message:'Ruta no disponible'},{status:404});
    if(path.length>6||path.some(x=>!/^[-a-zA-Z0-9]+$/.test(x)))return Response.json({message:'Ruta inválida'},{status:400});
    const authorization=request.headers.get('authorization');if(!authorization||!/^Bearer \S+$/.test(authorization))return Response.json({message:'Inicia sesión para continuar.'},{status:401});
    const endpoint=new URL(getGraphqlEndpoint());endpoint.pathname=endpoint.pathname.replace(/\/graphql\/?$/,'')+'/platform/'+path.join('/');endpoint.search=request.nextUrl.search;
    const headers=new Headers({Authorization:authorization});
    const confirmation=request.headers.get('x-ticket-confirmation');if(confirmation)headers.set('x-ticket-confirmation',confirmation);
    const mime=request.headers.get('content-type')||'';
    let body:BodyInit|undefined;
    try{
        if(!['GET','HEAD'].includes(request.method)){
            if(mime.includes('multipart/form-data')){
                if(!/^records\/[-a-z]+\/[-a-f0-9]{36}\/files$/.test(path.join('/')))return Response.json({message:'Subida no permitida'},{status:400});
                if(Number(request.headers.get('content-length')||0)>21*1024*1024)return Response.json({message:'El archivo es demasiado grande.'},{status:413});
                const form=await request.formData(),file=form.get('file'),command=form.get('command');
                if(!(file instanceof File)||file.size>20*1024*1024||typeof command!=='string'||command.length>5000)return Response.json({message:'Archivo inválido.'},{status:400});body=form;
            }else{
                const reader=request.body?.getReader();const chunks:Uint8Array[]=[];let size=0;
                if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>60000){await reader.cancel();return Response.json({message:'La solicitud es demasiado grande.'},{status:413});}chunks.push(part.value);}
                body=Buffer.concat(chunks);headers.set('Content-Type','application/json');
            }
        }
        const upstream=await fetch(endpoint,{method:request.method,headers,body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(40000)});
        const resultHeaders=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
        for(const key of ['content-type','content-disposition']){const value=upstream.headers.get(key);if(value)resultHeaders.set(key,value);}
        return new Response(upstream.body,{status:upstream.status,headers:resultHeaders});
    }catch(error){const referencia = path[0] === 'client-errors' ? undefined : await queuePanelIncident('Platform.'+path[0],error); return Response.json({message:'No se pudo comunicar con Tickets. Conserva los datos y reintenta.',referencia},{status:503,headers:{'Cache-Control':'no-store'}});}
}
export {proxy as GET,proxy as POST,proxy as PATCH,proxy as PUT,proxy as DELETE};
