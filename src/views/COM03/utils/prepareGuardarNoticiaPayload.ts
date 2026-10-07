import { apiFetch, graphqlRequestClient } from '@/api/graphql/client';
import { NoticiaCmsError, type AccionNoticia, type NoticiaDetalle } from '@/api/graphql/COM03';
import type { NewsFormFile, NewsFormValues } from '@/components/client/organisms/NewsForm';
import { cmsMediaUrl, type CmsResourceDto } from '@/api/cms/mappers';
import { buildGuardarNoticiaPayload } from './buildGuardarNoticiaPayload';

type Autor = { id: number; nombre: string };
export type RecursosGuardados = {
    imagenes: Map<File, CmsResourceDto>;
    videos: Map<string, CmsResourceDto>;
    autores: Map<string, Autor>;
};
export const crearCacheRecursos = (): RecursosGuardados => ({ imagenes: new Map(), videos: new Map(), autores: new Map() });

/** El cache dura lo mismo que el formulario: un reintento reutiliza ids y no vuelve a subir lo ya confirmado. */
export async function prepareGuardarNoticiaPayload(
    values: NewsFormValues, initial: NoticiaDetalle | null, accion: AccionNoticia, cache: RecursosGuardados,
) {
    const { pendientes } = buildGuardarNoticiaPayload(values, initial?.id ?? null, accion, '');
    const imagenes = [...new Set(pendientes.flatMap(p => p.file && !cache.imagenes.has(p.file) ? [p.file] : []))];
    if (imagenes.reduce((n, f) => n + f.size, 0) > 20 * 1024 * 1024) throw new NoticiaCmsError(null, 400, ['El tamaño total de las imágenes excede 20 MB']);
    // El interceptor acepta veinte archivos por solicitud; cada lote confirmado
    // se conserva aunque el siguiente falle y el usuario reintente.
    for (let offset = 0; offset < imagenes.length; offset += 20) {
        const lote = imagenes.slice(offset, offset + 20);
        const form = new FormData();
        lote.forEach(f => form.append('archivos', f, f.name));
        const subidas = await apiFetch<CmsResourceDto[]>('/api/COM03/recursos', undefined, { method: 'POST', body: form });
        if (!Array.isArray(subidas) || subidas.length !== lote.length || subidas.some(r => !Number.isInteger(Number(r.id)) || Number(r.id) < 1)) {
            throw new NoticiaCmsError(null, 502, ['El servicio no confirmó todas las imágenes']);
        }
        lote.forEach((f, i) => cache.imagenes.set(f, subidas[i]));
    }
    for (const pendiente of pendientes) {
        if (!pendiente.url || cache.videos.has(pendiente.url)) continue;
        const recurso = await apiFetch<CmsResourceDto>('/api/COM03/recursos/externos', undefined, {
            method: 'POST', body: JSON.stringify({ url: pendiente.url, tipo: 'video' }),
        });
        if (!Number.isInteger(Number(recurso.id)) || Number(recurso.id) < 1) throw new NoticiaCmsError(null, 502, ['El servicio no confirmó el video']);
        cache.videos.set(pendiente.url, recurso);
    }
    const resolver = (file: NewsFormFile | null): NewsFormFile | null => {
        if (!file) return null;
        const recurso = file.file ? cache.imagenes.get(file.file) : file.youtubeId && file.url ? cache.videos.get(file.url) : undefined;
        return recurso ? { ...file, id: String(recurso.id), file: null, url: cmsMediaUrl(recurso.url) } : file;
    };
    const preparados: NewsFormValues = {
        ...values, archivoPrincipal: resolver(values.archivoPrincipal),
        secciones: values.secciones.map(s => ({ ...s, imagen: resolver(s.imagen) })),
        galeria: values.galeria.map(f => resolver(f)!),
    };
    const payload = buildGuardarNoticiaPayload(preparados, initial?.id ?? null, accion, '');
    if (payload.pendientes.length) throw new NoticiaCmsError(null, 502, ['Hay recursos sin confirmar; la noticia no se guardó']);

    const nombre = values.autor.trim();
    if (initial && nombre === initial.autor.trim() && initial.autores?.length) {
        payload.variables.input.autores = initial.autores.map(a => ({ autorId: a.id, rol: a.rol, orden: a.orden }));
    } else if (!nombre) {
        payload.variables.input.autores = [];
    } else {
        const key = nombre.toLocaleLowerCase('es-GT');
        let autor = cache.autores.get(key);
        if (!autor) {
            const catalogo = await apiFetch<{ data: Autor[] }>('/api/COM03/autores');
            const coinciden = catalogo.data.filter(a => a.nombre.trim().toLocaleLowerCase('es-GT') === key);
            if (coinciden.length > 1) throw new NoticiaCmsError(null, 400, ['El catálogo tiene varios autores con ese nombre; usa un nombre único']);
            autor = coinciden[0];
            if (!autor) {
                const result = await graphqlRequestClient<{ crearAutorCms: Autor }>(
                    'mutation CrearAutor($input: CrearAutorCmsInput!) { crearAutorCms(input: $input) { id nombre } }',
                    { variables: { input: { nombre } } },
                );
                autor = result.crearAutorCms;
            }
            cache.autores.set(key, autor);
        }
        payload.variables.input.autores = [{ autorId: autor.id, rol: 'autor', orden: 1 }];
    }
    return payload;
}
