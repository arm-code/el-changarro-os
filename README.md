# Eventos Mendoza App
---

### Pasos a seguir para poder ejecutar el proyecto
- Clonar el proyecto desde el repositorio de github.
- Ejecutar `pnpm install`.
- Crear un archivo en la raiz del proyecto `.env.local` basandote de `.env.template`.
- Colocar las credenciales de acceso solicitadas dentro del archivo.
- **IMPORTANTE:** La variable de entorno `NEXT_PUBLIC_DEFAULT_BUSINESS_SLUG` debe estar configurada obligatoriamente, ya que sin ella la aplicación no podrá establecer el slug del negocio por defecto en ambientes locales o que no dispongan de un subdominio válido.
- Ejecutar en local con `pnpm run dev`.
---

### Gestión de las ramas de git
- Hay dos ramas principales `dev` y `main`.
- Para trabajar en nuevos features hay que crear una  nueva rama basada en `dev`.
- Se recomienda la siguiente nomeclatura para los nombres de las ramas `[nombre-feature]-[fecha]-[Iniciales-Usuario]`. Ej. `login-251024-ARM`.

### Mandar cambios a las ramas principales.
- Hay que desarrollar el `feature` en la rama creada basada en `dev`.
- Una vez corroborado que funcione correctamente, hacer `pull request` a la rama `dev`. Resolver conflictos si es necesario.
- Pedir autorización para hacer `merge`.
- Verificar que los cambios funcionen correctamente en `dev`, y despues hacer `pull request` a `main`, para proceder con el `merge`.

---


### Pasos para agregar componentes de `shadcn` 
- Asegurate de tener instalada la libreria `pnpm dlx shadcn@latest init`
- Para agregar un componente `pnpm dlx shadcn@latest add [nombre-del-cpmponente]`
- Puedes consultar los diferentes componentes en `https://ui.shadcn.com/docs/components`




