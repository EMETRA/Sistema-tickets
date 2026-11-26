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

Migrados: `ModulesForm`, `PermissionsForm`, `RolesForm`.

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

## Pendientes

Formularios que aún validan a mano y conviene migrar al tocarlos: creación de ticket
(`features/tickets/components/TicketCreationPanel`), noticias (`features/comunicacion/components/NewsForm`),
formularios de módulos heredados (`views/MOD*`, `views/JUZ01`) y RRHH (`HrUpdateForm`).
