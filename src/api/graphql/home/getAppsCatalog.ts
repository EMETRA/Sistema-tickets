import type { AppsCatalog } from '@/config/apps-catalog';
import { APPS_CATALOG_DUMMY } from './appsCatalog.dummy';
import { getGraphqlEndpoint } from '@/api/config/env';
import { headers } from 'next/headers';
export async function getAppsCatalog():Promise<AppsCatalog>{
    if(process.env.TICKETS_PLATFORM_ENABLED!=='true')return APPS_CATALOG_DUMMY;
    const incoming=await headers(),token=incoming.get('authorization');if(!token)throw new Error('401: Sesión requerida');
    const upstream=new URL(getGraphqlEndpoint());upstream.pathname=upstream.pathname.replace(/\/graphql\/?$/,'')+'/platform/catalog';upstream.search='';
    const response=await fetch(upstream,{headers:{Authorization:token},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error(response.status===401?'401: Sesión vencida':'No se pudo consultar el catálogo de aplicaciones.');
    return response.json();
}
