# Front_Tienda — Análisis y plan de optimización + rediseño

> Generado el 2026-09-06 tras revisión completa del código.
> Análogo al `ANALISIS_Y_OPTIMIZACION.md` del backend.
> Objetivo: entender el estado actual y dejar un plan por fases para **optimizar
> el código** y **rediseñar la interfaz**.

---

## 1. Resumen ejecutivo

App **Expo / React Native** (SDK 52, RN 0.76, React 18.3) con **expo-router v4**
(rutas por archivos), **Redux Toolkit + redux-persist**, **axios**. Corre en
**web + Android + iOS**. Consume el backend en `https://api.mystockapp.site/`.
Repo propio (`Front_Tienda/.git`, 5 commits, último ago-2025). ~11.400 LOC,
~55 archivos fuente, **0 tests, 0 CI**.

**Estado:** funcional pero con deuda técnica alta y varios problemas que rompen el
build de release. Lo más grave:

1. **No existe `app.json` / `app.config.*`** — un proyecto Expo lo necesita.
2. `babel.config.js` sin el plugin de `react-native-reanimated`.
3. Restos de Create-React-App mezclados (deps y archivos muertos).
4. Sin cliente API único ni interceptor de axios — el token se pasa a mano en
   cada llamada; ~7 archivos `axiosRequest.jsx` casi duplicados.
5. Auth frágil y repartida en 5–6 sitios, con bugs de claves de storage.

El "theme" no es un sistema de diseño (objeto plano, paleta oscura hardcodeada,
sin tokens ni modo claro), así que el **rediseño** arranca por construir esa base.

---

## 2. Stack y estructura

| Área | Qué |
|---|---|
| Framework | Expo SDK ~52.0.38, React Native ^0.76.3, React 18.3.1 |
| Routing | `expo-router` ^4.0.19 (file-based, layouts por carpeta) |
| Estado | `@reduxjs/toolkit` + `react-redux` + `redux-persist` (solo `user` y `empresa`) |
| HTTP | `axios` ^1.7.7 |
| Storage | `expo-secure-store` (móvil) / `localStorage` (web) vía wrapper propio |
| Cámara / barras | `expo-camera`, `expo-barcode-scanner` (deprecado en SDK 52), `react-webcam`, `react-qr-barcode-scanner` |
| PDF | `expo-print`, `html2pdf.js`, `html2canvas` (los 2 últimos son de web/CRA) |
| Iconos | `react-native-vector-icons` + `src/components/icons/icons.jsx` propio |
| UI extra | `@react-navigation/drawer`, `react-native-calendars`, `react-native-keyboard-controller`, `expo-linear-gradient` |

### Carpetas

```
app/                      rutas (expo-router). Cada archivo = pantalla/route.
  _layout.jsx             root: <Provider> + <PersistGate> + LoadUser + <Stack>
  index.jsx               chequea sesión -> /drawer o /login
  login.jsx               login + registro (tabs)
  drawer/                 app autenticada (Drawer nav), pantallas filtradas por rol
    _layout.jsx           getAllowedScreens(user) + <Drawer> + CustomDrawerContent
    index, billDrawer, productsDrawer, addProductsColletionDrawer,
    billsGenerateDrawer, settingsStoreDrawer, stocktaking, catalog, addToCompanyDrawer
  catalog/                catálogo PÚBLICO (sin auth): [myCatalog], productDetail, car
  modals/                 modales como rutas
  products/ myStoreSettings/ stockTaking/ billsGenerate/   subsecciones
  profile.jsx  badRequest.jsx

src/
  components/<feature>/   implementación real (cada ruta de app/ es un wrapper fino)
    axios/generalAxiosRequest.jsx    get/post/patch/delete/postFormData + expiredGetToken
    <feature>/axiosRequest.jsx       ~7 archivos: handleXxx(url, token) por feature
    token/{token,localstorage}.jsx   auth: refresh manual + storage
    themeStyles/{theme,alerts,...}.jsx
    icons/icons.jsx                  ~170 líneas de funciones iconXxx()
  redux/{store,userSlice,viewsPermissions}.jsx

App.js  src/components/Main.jsx      MUERTOS (entry real: expo-router/entry)
dist/                                build commiteado (debería estar en .gitignore)
```

### Flujo de navegación

`index` → lee `username`+`token`+`user` → `/drawer` o (`deleteTokenStorage()` +
`/login`). El drawer arma sus pantallas con `getAllowedScreens(user.typeUser)`
(`creator` / `admin` / `worker` / `cliente`). Cada pantalla además llama a un hook
`useUserC*AuthRedirect()` que revalida el rol.

---

## 3. Problemas — CRÍTICOS (rompen build / release)

### 3.1 No hay `app.json` / `app.config.js`
No existe ningún archivo de configuración de Expo. Consecuencias:
- `expo start` arranca con defaults efímeros; `expo export` / EAS build **fallan**.
- **expo-router sin `scheme`** → deep links y `Linking` rotos.
- Sin `plugins: ["expo-router", "expo-camera", …]`, sin permisos de cámara
  declarados (`NSCameraUsageDescription`, `android.permissions.CAMERA`) → el
  scanner de códigos de barras **crashea en build nativo**.
- Sin `name`, `slug`, `version`, `icon`, `splash`, `newArchEnabled`.

### 3.2 `babel.config.js` sin el plugin de reanimated
```js
return { presets: ['babel-preset-expo'] };   // falta plugins
```
`react-native-reanimated` (dep, lo usan el drawer, `keyboard-controller`,
`calendars`) **exige** `plugins: ['react-native-reanimated/plugin']` **al final**.
Sin él: animaciones rotas o crash en release.

### 3.3 Restos de Create-React-App
- `App.js` está **roto** (importa `store` como default —no existe— y usa
  `<Provider>` sin importarlo) y `src/components/Main.jsx` no se usan: el entry es
  `expo-router/entry`.
- Deps que sobran e inflan `node_modules` / confunden el bundler:
  `react-scripts` (¡CRA entero!), `react-dom`, `react-webcam`,
  `react-qr-barcode-scanner`, `html2pdf.js`, `html2canvas`, y
  `@react-native-community/masked-view` (deprecado → `@react-native-masked-view/masked-view`).

### 3.4 Sin cliente API único ni interceptor
- `src/components/axios/generalAxiosRequest.jsx` exporta `getRequest`,
  `postRequest`, `patchRequest`, `deleteRequest`, `postRequestFormData` — cada uno
  recibe `token` por parámetro y arma headers a mano, todos con
  `withCredentials: true`.
- ~7 `axiosRequest.jsx` (uno por feature; `BillsGenerate/axiosReques.jsx` con
  typo) definen `handleXxx(url, token, …)` que construyen `baseUrl + path` y
  llaman a los wrappers. **El token viaja como argumento en toda la app** y cada
  pantalla hace `await expiredGetToken()` antes de cada request.
- **Un interceptor de axios** (Authorization automático + `401 → refresh → retry`)
  eliminaría cientos de líneas y todos los `expiredGetToken()` dispersos.

### 3.5 `baseUrl` hardcodeado
Repetido en `generalAxiosRequest.jsx`, `token.jsx` y `catalog/axiosRequest.jsx`.
Debe salir de `EXPO_PUBLIC_API_URL` / `app.config` con dev vs prod.

---

## 4. Problemas — ALTOS

### 4.1 Auth frágil y con bugs
Repartida en `token.jsx`, `localstorage.jsx`,
`generalAxiosRequest.expiredGetToken`, `app/_layout.jsx::LoadUser`,
`app/index.jsx`, `redux/viewsPermissions.jsx`.

- `localstorage.save()` en **web** guarda el usuario bajo la clave literal
  `"keyUser"` en vez de la constante `keyUser` (`"user"`). Se escribe con una
  clave y se lee con otra.
- `deleteTokenStorage()` borra `"time"`, pero la clave real es `"tokenExpiration"`
  → nunca se limpia la expiración al hacer logout.
- `Storage.removeItem` (web): `catch {}` sin binding, pero el cuerpo referencia
  `e` → `ReferenceError` si alguna vez falla.
- `Promise.all([localStorage.setItem(...)])` — `setItem` es síncrono, no promesa.
- `handleLogin`: `throw error.response.data.error` → crashea con error de red
  (`error.response` es `undefined`).
- `_layout.jsx::LoadUser`: `useEffect` depende de `userRedux` y despacha
  `setUser` → riesgo de re-render loop (mitigado por comparación `JSON.stringify`,
  frágil); cualquier error de parseo → `router.replace("/login")`.
- 3 hooks `useUserC / useUserCA / useUserCAW AuthRedirect` **idénticos** salvo la
  lista de roles.
- El guard de auth está en 4+ lugares (index, `_layout` del drawer, cada hook,
  cada pantalla). Debería ser **un** layout/guard.

### 4.2 Manejo de errores inconsistente en la capa API
Unos `throw error`, otros `throw error.response.data.error`, otros `return null`,
`return false`, o silencio total (`handleDeleteTypeProduct` traga todo). Las
pantallas reciben a veces un `Error`, a veces un string, a veces `null`.

### 4.3 `withCredentials: true` en todas las requests
Con auth por Bearer no hay cookies → preflight CORS extra y posible conflicto con
`Access-Control-Allow-Origin: *` del backend.

### 4.4 Componentes gigantes
`addProductsColletion.jsx` 651 · `productDetail.jsx` 590 · `bill.jsx` 537 ·
`modalCar.jsx` 407 · `modalBarCode.jsx` 398. Mezclan fetching + estado + UI +
estilos en un solo archivo.

### 4.5 Estado de servidor a mano en cada pantalla
Patrón repetido: `useState` (list, loading, error, nextPage) + `useFocusEffect` +
fetch + `debounce` manual + paginación manual. En `bill.jsx` el debounce usa
**`let timeout` a nivel de módulo** → variable compartida entre montajes.
**RTK Query** (ya hay Redux Toolkit) o **@tanstack/react-query** elimina casi todo
eso y aporta caché, refetch, y loading/error unificados.

---

## 5. Problemas — MEDIOS (base del rediseño)

| # | Tema | Detalle |
|---|---|---|
| 5.1 | **"Theme" no es un sistema** | `theme.jsx` es un objeto plano con estilos ya compuestos (`button`, `pressable`, `textInputGlobal`…) + colores hex sueltos. Sin escala de spacing, radii ni tipografía; sin modo claro; `fontFamily: ""`. Mezcla `#hex` / `rgb()` / nombres. Sombras iOS sin equivalente `boxShadow` web. Bloques de estilo comentados. |
| 5.2 | **Sin librería de componentes** | Cada pantalla reimplementa botón, input, card, modal, estado vacío, loader. No hay `<Button>`, `<TextField>`, `<Screen>`, `<Card>`, `<EmptyState>`, `<Loader>`. |
| 5.3 | **Iconos** | `react-native-vector-icons` (necesita linking / config de fuentes) + `icons.jsx` propio de 170 líneas. Expo trae `@expo/vector-icons` sin config. |
| 5.4 | **UI / responsive** | `Alert` de RN usado en web (mal soporte); `Dimensions.get('window')` capturado una vez (no reacciona a rotación / resize web); anchos fijos `width * 0.8`; `Platform.OS === 'web' ? 350 : …` disperso. |
| 5.5 | **TS a medias** | `typescript` en `^5.3.3` (deps) y `^4.9.5` (devDeps) — conflicto; `tsconfig.json` presente pero todo es `.jsx`. |
| 5.6 | **ESLint duplicado** | `.eslintrc.js` (`extends: ["expo","prettier"]`) **y** `eslint.config.mjs` (flat, `eslint-config-standard` — no está en deps). Con ESLint 9 gana el flat; `npm run lint` probablemente falla. |
| 5.7 | **Repo sucio** | `dist/` commiteado, carpeta llamada `#`, `Nuevo Documento de texto.txt`. |

---

## 6. Lo que está bien (conservar)

- **expo-router file-based** con layouts por carpeta — estructura correcta.
- **`getAllowedScreens(role)`** — filtrado de pantallas del drawer por rol, buena
  idea y bien resuelto.
- **redux-persist** con storage adaptado web (`localStorage`) / móvil (`SecureStore`).
- Separación **rutas (`app/`) vs implementación (`src/components/`)**.
- **Catálogo público** como sección aparte sin auth.
- Utilidades: `pesosFormat`, debounce en búsquedas, `expiredGetToken`.

---

## 7. Plan por fases

### Fase 0 — Arreglos que rompen build / release  · **HECHA (2026-09-06, rama `optimizacion/fase-0-build`)**
- [x] Creado **`app.json`**: `name`, `slug`, `scheme: "mystockapp"`, `version`,
      `icon`, `splash`, `ios/android.package = site.mystockapp.app`,
      `plugins: ["expo-router", "expo-secure-store", "expo-camera"(+permiso),
      "expo-image-picker"(+permisos)]`, `extra.apiUrl`. `npx expo config` valida OK.
- [x] `babel.config.js`: añadido `plugins: ['react-native-reanimated/plugin']`.
- [x] Borrados `App.js`, `src/components/Main.jsx` (código muerto). Quitadas de
      `package.json` las deps no usadas: `react-scripts` (CRA entero),
      `react-qr-barcode-scanner`, `@react-native-community/masked-view`,
      `expo-barcode-scanner`. `npm install` → **removed 641 packages**.
      `react-webcam` y `html2pdf.js` se **conservan** (sí se usan en
      `modalBarCode.jsx` / `productDetail.jsx`); su migración a `expo-camera` /
      `expo-print` va en Fase 3.
- [x] Quitado el duplicado `typescript@^4.9.5` de devDependencies (queda `^5.3.3`).
- [x] Borrado `eslint.config.mjs` (flat config muerta que importaba
      `eslint-config-standard`, no instalado). Se **conserva `.eslintrc.js`**
      (`extends: ["expo","prettier"]`), que es lo correcto para ESLint 8.57 +
      `eslint-config-expo@8`.
- [x] Borrada la carpeta `#` (solo contenía un `.expo` vacío). `dist/` ya estaba
      en `.gitignore` y no trackeado.
- [x] `.env.example` con `EXPO_PUBLIC_API_URL` (para Fase 1).

### Fase 1 — Capa de datos y auth  · **NÚCLEO HECHO (2026-09-06)**
- [x] **`src/api/http.js`**: instancia axios (`baseURL` de `EXPO_PUBLIC_API_URL`,
      fallback a la URL actual), **interceptor request** (mete `Authorization`,
      refresca preventivamente si el access venció, respeta `skipAuth`),
      **interceptor response** (`401 → refresh 1 vez, dedupe con promesa
      compartida → retry`; si falla → `clearSession()` + `/login`). **Sin
      `withCredentials`.** Errores normalizados a `ApiError { status, message,
      fields, raw }`. `refreshSession()` usa axios crudo (no recursión).
- [x] **`src/auth/session.js`**: `saveSession / getAccess / getRefresh / getUser /
      getAccessExp / isAccessExpired / clearSession`, **una sola convención de
      claves** (se conservan las claves existentes → sin migración ni logout al
      desplegar). Arreglados los bugs: `"keyUser"` literal, `"time"` vs
      `"tokenExpiration"`, `catch` sin `e`, `handleLogin` que crasheaba con error
      de red.
- [x] **`viewsPermissions.jsx`** → un solo `useRequireRole(roles)` + los 3
      nombres viejos como alias.
- [x] `app/_layout.jsx::LoadUser`: `useEffect` con deps `[]` (una vez) en vez de
      `[userRedux]` → sin riesgo de bucle.
- [x] **Shim de compatibilidad** (`generalAxiosRequest.jsx`, `token.jsx`,
      `localstorage.jsx`): `getRequest/postRequest/…`, `expiredGetToken`,
      `deleteTokenStorage`, `expiredTimeToken`, `Storage`, `isWeb` siguen
      exportándose → las ~29 pantallas **no se tocaron**. El `token` que pasan
      se ignora.
- [x] `sesion/axiosRequest.jsx`: `handleLogin/Logout/Register` sobre el cliente
      nuevo, con `skipAuth`.
- [ ] **Pendiente (limpieza)**: unificar los ~7 `axiosRequest.jsx` de feature en
      `src/api/<feature>.js` y quitar el `token` + los `expiredGetToken()` de las
      52 pantallas. Se hará junto con Fase 3 (reescritura de pantallas).
- [ ] **RTK Query / @tanstack/react-query**: diferido a Fase 3 (reescribe el
      fetching de cada pantalla).

### Fase 2 — Sistema de diseño  · **HECHA (2026-09-06)**  ·  verificado con `expo export --platform web` (bundle OK) + eslint limpio
- [x] **`src/theme/tokens.js`**: paleta (marca **índigo** `#4f46e5`, acento **teal**,
      neutros slate, semánticos), temas **`light` + `dark`**, escalas `spacing`
      (4-pt), `radii`, `typography` (size/weight/lineHeight), `shadow(level)` con
      `boxShadow` para web + `shadow*/elevation` para nativo.
- [x] **`src/theme/ThemeProvider.jsx`**: `<ThemeProvider>` + `useTheme()`, sigue
      `useColorScheme()` (`mode: "system" | "light" | "dark"`, con `setMode`).
- [x] **`src/ui/`** (todos consumen `useTheme()`): `Text` (variants + color/muted/
      weight), `Button` (primary/secondary/ghost/danger · sm/md/lg · loading),
      `TextField` (label/error/helper/adornos), `Card` (level 0–3), `Screen`
      (SafeArea + fondo + scroll opc.), `Badge` (tones), `Loader`, `EmptyState`,
      `Divider`, `Icon` (wrapper de `@expo/vector-icons`). Barrel en `src/ui/index.js`.
- [x] **`Toast`** (`ToastProvider` + `useToast()` → `.success/.error/.info/.show`):
      reemplaza `Alert` (que en web funciona mal). Montado en `app/_layout.jsx`.
- [x] `@expo/vector-icons` añadido a `dependencies` (ya venía con Expo).
- [x] `ThemeProvider` + `ToastProvider` conectados en `app/_layout.jsx` (envuelven
      el `<Stack>`; las pantallas actuales no los consumen todavía → sin cambios
      de comportamiento).
- [ ] Pendiente (Fase 3): borrar `react-native-vector-icons` + el `icons.jsx`
      propio cuando las pantallas migren a `<Icon>`; cargar la fuente **Inter**
      con `expo-font` y ponerla en `typography.family`.
- [ ] Pendiente: migrar el `theme.jsx` viejo → las pantallas lo siguen usando
      hasta que se reescriban en Fase 3.

### Fase 3 — Rediseño de pantallas  · **EN CURSO**

**Incremento 1 (2026-09-06)** — infra + login. Verificado: `expo export --platform
web` OK + eslint limpio.
- [x] **React Query**: `@tanstack/react-query` instalado, `src/api/queryClient.js`,
      `<QueryClientProvider>` en `app/_layout.jsx`.
- [x] **Fuente Inter** (`@expo-google-fonts/inter`): se carga en `_layout.jsx`
      (bloquea el render hasta lista), `typography.family/Medium/Bold` la usan.
- [x] **`src/api/products.js`**: API de productos limpia sobre el cliente único
      (plantilla para migrar el resto de `axiosRequest.jsx` de feature).
- [x] **Login + Registro rediseñados** (`app/login.jsx`, `loginView.jsx`,
      `registerView.jsx`) sobre `src/ui/` — segmented control, `TextField` con
      iconos y toggle de contraseña, `Button` con loading, errores por campo +
      `useToast`. Usa `handleLogin/Register` de Fase 1.
- [x] `.eslintrc.js`: `env: { browser: true }` (RN/Hermes tiene `setTimeout`,
      `URLSearchParams`, `localStorage` en web).

**Incremento 2 (2026-09-06)** — navegación por tabs + home. Verificado:
`expo export --platform web` OK + eslint limpio.
- [x] **`app/drawer/_layout.jsx`**: de `<Drawer>` (expo-router/drawer) a
      `<Tabs>` (expo-router). Config `NAV` con `roles` por pantalla + flag
      `primary`. 5 tabs visibles: Inicio · Facturar · Productos · Catálogo · Más
      (cada una filtrada por rol vía `href: null`). El resto de pantallas siguen
      siendo rutas navegables pero fuera de la barra. `tabBarStyle`/`headerStyle`
      tematizados con `useTheme()`. Export `allowedFor(role)`.
- [x] **`app/drawer/more.jsx`** (nueva): pantalla "Más" — tarjeta de usuario
      (nombre/email/rol como `Badge`), lista de pantallas secundarias permitidas
      por rol (`ListItem` + `Divider`) y **Cerrar sesión** (`handleLogout`).
- [x] **`app/drawer/index.jsx`** reescrita sobre `src/ui/`: saludo + `Badge` de
      rol + grid de accesos rápidos filtrados por rol. Sin `LinearGradient` ni
      `react-native-reanimated`; chequeo ligero de token con `expiredGetToken`.
- [x] **`src/ui/ListItem.jsx`** (nueva) + barrel: fila icono + título +
      subtítulo + chevron/acción, variante `danger`.
- Nota: `src/components/customDrawer.jsx` queda huérfano (se borra al limpiar
  en el último incremento).

**Incremento 3 (2026-09-06)** — POS / Facturar. Verificado: `expo export
--platform web` OK + eslint limpio.
- [x] **`src/hooks/useCart.js`** (nuevo): estado del carrito sobre el storage
      (`arrayCar`, misma clave/forma de item). `items/count/total`, `add`,
      `setQty`, `remove`, `clear`, recarga en `useFocusEffect`. Suma cantidad si
      el producto ya está. Helpers sueltos `readCart/writeCart/addToCart`.
- [x] **`src/api/billing.js`** (nuevo): `createInvoice(detalles)`,
      `lookupBarcodeText`, `lookupBarcodeImage` sobre el cliente único.
- [x] **`src/components/billing/bill.jsx`** reescrito (537→~250 líneas) sobre
      `src/ui/` + React Query (`useQuery` con debounce 400ms → `searchAvailable
      Products`). Grid de `Card` con imagen/precio/stock (`Badge`), tap → `Sheet`
      con `Stepper` (tope = stock) → `add` + `toast`. FAB carrito con badge de
      `count`. Sin `Modal` casero, sin `theme.jsx`/`icons.jsx`. Mantiene
      `getArrayCar` exportado (compat con `modalBarCode.jsx`).
- [x] **`src/components/billing/modalCar.jsx`** reescrito (407→~210 líneas)
      sobre `src/ui/`: filas `Card` con `Stepper`+eliminar, `Card` de totales
      fija, `Limpiar`/`Facturar`, confirmación en `Sheet`, error de stock
      inline (`Badge`) + `toast`. Usa `createInvoice` + `useCart`.
- [x] **`src/ui/Sheet.jsx`** + **`src/ui/Stepper.jsx`** (nuevos) + barrel.
- [x] **`src/api/http.js`**: `toApiError` ahora expone `d.error` como `fields`
      cuando es objeto (validación de stock) y arma un mensaje legible.
- Nota: `src/components/billing/axiosRequest.jsx` sigue vivo (lo usa
  `modalBarCode.jsx`); se borra cuando se rediseñe el escáner.

**Incremento 4 (2026-09-06)** — Productos (lista / detalle / editar / stock).
Verificado: `expo export --platform web` OK + eslint limpio.
- [x] **`src/api/products.js`**: + `patchProductForm(id, fd)` (PATCH multipart),
      `updateStock(id, unidades)`.
- [x] **`src/features/products/barcodePdf.js`** (nuevo): `downloadBarcodePdf`
      (+ `SIZE_OPTIONS`). Solo web; `html2pdf.js` con `import()` diferido (ya no
      se importa estáticamente en nativo). Saca ~120 líneas de `productDetail`.
- [x] **`src/components/colletion/product/product.jsx`** reescrito (281→~195)
      sobre `src/ui/` + **`useInfiniteQuery`** (scroll infinito real, debounce
      400ms). Filas `Card` con imagen/precio/`Badge` de stock. Filtro (`order`
      0–5) desde `modalFilterProductIcon` vía `useLocalSearchParams`.
- [x] **`src/components/colletion/product/productDetail.jsx`** reescrito
      (590→~290) sobre `src/ui/` + `useQuery` (producto + barcode). Galería,
      valores (mayor/costos solo `creator`), stock con botones Ingresar/Retirar
      → `modalUpdateProductDrawer`. Eliminar en `Sheet` de confirmación +
      `toast`. PDF en `Sheet` de tamaños (solo web). Quita el bug de `handlePrint`
      indefinido.
- [x] **`app/products/editProduct.jsx`** reescrito sobre `src/ui/`: `TextField`s,
      `Toggle` publicar, `ImagePickerWeb` (sin tocar), sin `alert()` de debug.
      PATCH JSON si no hay imágenes nuevas, multipart si las hay. Invalida
      `["product"]` y `["products"]` en React Query.
- [x] **`app/modals/modalUpdateProductDrawer.jsx`** reescrito (~280→~135) sobre
      `src/ui/` + `Stepper`. Calcula el nuevo total, confirma en `Sheet`, llama
      `updateStock`. Corrige los bugs de `parseInt(typeof ...)`.
- [x] **`app/drawer/productsDrawer.jsx`**: segmented control (Productos/Tipos)
      con tokens. `typeProduct.jsx` sigue con el estilo viejo (fuera de alcance).
- [x] **`src/ui/Toggle.jsx`** (nuevo) + barrel.
- Nota: `product/modalUpdateProduct.jsx` (stub "Hello") y `product/viewBarCode.jsx`
  quedan huérfanos; se borran en el incremento de limpieza.

**Incremento 5 (2026-09-06)** — Alta de producto. Verificado: `expo export
--platform web` OK + eslint limpio.
- [x] **`src/components/colletion/addProductsColletion.jsx`** reescrito
      (651→~340) sobre `src/ui/` + React Query. `useMutation` para crear
      (`createProduct`) y para el precio sugerido (`suggestRetailPrice`).
      Validación local que replica las reglas del serializer (nombre/detalles
      obligatorios, valor_mayor>0, valor>0, valor≥valor_mayor, unidades>0, tipo).
      Errores por campo desde `ApiError.fields`. Sin `console.log`/`alert` de
      debug. Confirmación en `Sheet`. Selector de tipo = `TypeProductPicker`
      (Sheet + `useInfiniteQuery` sobre `listTypeProducts`) — reemplaza a
      `modalAddProductColletion.jsx` (queda huérfano).
- [x] **`src/api/products.js`**: + `createProduct(fd)`, `listTypeProducts(url)`.
- [x] **`src/api/pricing.js`** (nuevo): `suggestRetailPrice({ valorMayor, margen })`.
- Nota: `modalAddProductColletion.jsx` queda huérfano; se borra en la limpieza.
  `componentWebimage.jsx` (subida de imágenes) se conserva sin cambios.

**Incremento 6 (2026-09-06)** — Tipos de producto. Verificado: `expo export
--platform web` OK + eslint limpio.
- [x] **`src/components/colletion/typeProduct/typeProduct.jsx`** reescrito
      (277→~185) sobre `src/ui/` + `useInfiniteQuery` (búsqueda con debounce,
      scroll infinito). Filas `Card`, eliminar en `Sheet` que **avisa que borra
      en cascada los productos del tipo** (comportamiento del backend). Delete
      vía `useMutation` → invalida `["typeProducts"]` + `["products"]` + `toast`.
- [x] **`src/components/colletion/typeProduct/modalAddTypeProduct.jsx`** reescrito
      (~130→~65) sobre `src/ui/` + `useMutation` (`createTypeProduct`). Al crear:
      invalida, `toast`, y `router.back()` si se puede (sirve para el modal y
      para la ruta abierta desde el picker de alta).
- [x] **`src/api/products.js`**: + `filterTypeProducts({q,page})` (normaliza el
      404 de "sin resultados" a lista vacía), `createTypeProduct`,
      `deleteTypeProduct`.
- [x] `app/products/addTypeProductDrawer.jsx`: quitado `export default function()`
      anónimo + imports muertos.
- Con esto la **pestaña Productos queda 100% migrada** (productos + tipos).

**Pendiente del incremento:**
- [ ] Resto de pantallas sobre `src/ui/` + React Query: inventario, catálogo
      público, ajustes de tienda, perfil, QR aliado, **escáner de código de
      barras** (`modalBarCode`, quitar `react-webcam` →
      `expo-camera`/`expo-image-picker`).
- [ ] Romper el resto de componentes de 400–650 líneas + hooks
      (`useProductSearch`).
- [ ] Al migrar todo: borrar `react-native-vector-icons` + `icons.jsx`,
      `themeStyles/theme.jsx` y los `axiosRequest.jsx` de feature.

### Fase 4 — Calidad
- [ ] TS: migración incremental (`allowJs`, por módulo) **o** quitar
      `typescript`/`tsconfig` si no se va a usar. Fijar **una** versión.
- [ ] Tests: `jest-expo` + `@testing-library/react-native`. Prioridad: interceptor
      `401→refresh`, guards de rol, carrito de facturar, formato de pesos.
- [ ] CI (GitHub Actions): `npm ci`, `lint`, `tsc --noEmit` (si TS), `test`,
      `expo export` de humo.

---

## 8. Dirección de rediseño propuesta (para aprobar)

App tipo **"panel de tienda"**: limpia, moderna, **mobile-first**.

- **Layout**: tabs inferiores en móvil; contenido en tarjetas con esquinas
  12–16 px y sombras suaves; márgenes y gutters consistentes (escala 4-pt).
- **Color**: superficies neutras (gris muy claro / casi blanco en claro; grafito
  en oscuro) + **un color de marca** — propongo un **índigo** afinado
  (`#4f46e5`-ish) con acento **teal** para acciones secundarias, en vez del
  `#5e5ce6` plano actual. Estados: verde éxito, ámbar advertencia, rojo peligro.
- **Tipografía**: **Inter** (vía `expo-font`), escala clara (display / title /
  body / caption), pesos 400/500/700.
- **Componentes**: botones con estados (idle/press/loading/disabled), inputs con
  label flotante + mensaje de error, cards de producto con imagen + precio +
  stock, estados vacíos y de carga con ilustración simple.
- **POS de facturar**: la pantalla estrella — buscador arriba, resultados en
  lista, botón de escáner, **carrito como bottom-sheet** con total en vivo y CTA
  de confirmar.
- **Modo oscuro** real (no el único modo actual): seguir el sistema.

Cuando apruebes la dirección, el siguiente paso es un **mockup visual** (canvas de
diseño) de 4–5 pantallas clave antes de tocar código.

---

## 9. Riesgos / notas

- No puedo ver la UI renderizada en un teléfono; el rediseño visual necesita que
  revises los renders (web con `expo start --web`, o builds de Expo Go) e iteres.
- El repo del front es **independiente** del backend; se trabajará en una rama
  aparte (`rediseño/…`).
- Antes de Fase 3, conviene que el backend esté mergeado a `main` y desplegado,
  para probar el front contra la API real y no contra `api.mystockapp.site` viejo.
