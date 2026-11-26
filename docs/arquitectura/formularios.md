# Formularios: react-hook-form + zod

La validación usa **zod** con mensajes propios, cortos y concretos («Completa «Nombre».»), definidos en
`src/platform/forms.ts`. Los mismos ayudantes sirven para todos los formularios y reflejan lo que valida
el API, así el error aparece antes de enviar y con el mismo texto en todas las pantallas.

## Formularios de campos fijos → react-hook-form

```tsx
const esquema = z.object({
    name: texto("Nombre del módulo", { requerido: true, max: 100 }),
    description: texto("Descripción del módulo", { max: 500 }),
});
const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { name: "", description: "" },
});
useEffect(() => { if (initialData) reset(initialData); }, [initialData, reset]); // editar
<form onSubmit={handleSubmit(onSubmit)} noValidate>
    <Input {...register("name")} state={errors.name ? "error" : "default"} errorMessage={errors.name?.message} />
```

- `reset()` para cargar datos al editar (no `setState` dentro de un efecto).
- `useWatch` en lugar de `watch` (compatible con el compilador de React).
- `handleSubmit` evita el envío nativo del formulario (antes `ModulesForm` y `PermissionsForm` recargaban la página).

Migrados: `ModulesForm`, `PermissionsForm`, `RolesForm`, creación de ticket (`TicketCreationPanel`),
roles de acceso (`AccessWorkspace`), inicio de sesión, activación de cuenta, recuperación de contraseña,
edición de colocación CCT (`CctEditCepo`) y notificaciones por correo (`MOD10`). Noticias (`NewsForm`) y
juzgado (`JUZ01`) ya validaban con zod.

Cuando el servidor del front también valida (recuperación), las reglas viven en un solo módulo
(`src/auth/recovery-rules.ts`) que usan el formulario y la ruta, para que ambos acepten lo mismo.
Las reglas de colocación CCT (`cctEditSchema` en `src/platform/cct.ts`) copian `cct/contract.ts` del API.

## Editor genérico de registros → esquema dinámico

`RecordEditor` arma sus campos según la definición del API. Valida al guardar con
`esquemaDatos(fields)` (número con mínimo y máximo, fecha, opción de la lista, enlace, obligatorios) y
muestra el mensaje debajo de cada campo (`PlatformField error=…`), enfocando el primero con error.

## Ayudantes (`src/platform/forms.ts`)

| Ayudante | Uso |
| --- | --- |
| `texto(label, { requerido, max })` | Texto sin espacios sobrantes; vacío o solo espacios cuenta como «sin completar». |
| `esquemaCampo(field)` | Esquema de un campo de la plataforma según su tipo. |
| `esquemaDatos(fields)` | Objeto `datos` de un registro. |
| `mensajes` | Textos de error comunes, para reutilizar en validaciones propias. |

Pruebas: `test/integracion/formularios.test.cjs`.

## Qué queda fuera

- **Filtros y búsquedas** (reportes, colas, bandejas): son campos de consulta sin reglas de negocio; se
  quedan con estado local y se aplican al enviar.
- **Formularios con estructura propia**: la campaña de RRHH (`HrCampaignsWorkspace`) arma una matriz de
  campos solicitados; valida textos con `maxLength`/`required` nativos y el periodo antes de enviar
  (cierre posterior a la apertura y a ahora, como el API). La actualización de datos de RRHH
  (`HrUpdateForm`) deriva su borrador de la consulta y valida cada campo con los límites que envía el
  API (`maximo`, `obligatorio`, `permiteNulo`).
