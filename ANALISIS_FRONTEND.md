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

### Fase 1 — Capa de datos y auth
- [ ] **`src/api/client.js`**: instancia axios con `baseURL` de env, **interceptor
      request** (Authorization desde storage), **interceptor response**
      (`401 → refresh 1 vez → retry`; si falla → `clearSession()` + `/login`).
      Sin `withCredentials`. Errores normalizados a `ApiError { status, message, fields }`.
- [ ] Quitar el parámetro `token` de todos los `handleXxx` — que solo construyan
      URL + payload. Unificar los ~7 `axiosRequest.jsx` en `src/api/<feature>.js`.
- [ ] **`src/auth/session.js`**: save/load/clear atómico, una sola convención de
      claves. Arreglar bugs (`keyUser`, `time` vs `tokenExpiration`, `catch` sin `e`,
      `handleLogin` con error de red).
- [ ] **Un guard**: `app/(app)/_layout.jsx` exige sesión; `viewsPermissions` → un
      hook `useRequireRole(roles)`.
- [ ] **RTK Query** o **@tanstack/react-query** para el estado de servidor →
      borra los `useState/useFocusEffect/debounce/paginación` repetidos.

### Fase 2 — Sistema de diseño (base del rediseño)
- [ ] **`src/theme/tokens.js`**: `colors` (escala neutra + de marca + semánticos
      success/warning/danger), `spacing` (escala 4-pt), `radii`, `typography`
      (escala + pesos), `shadows` (con equivalente `boxShadow` web). **Modo claro +
      oscuro** con `useColorScheme` y un `<ThemeProvider>`.
- [ ] **`src/ui/`**: `Screen`, `Text` (variants), `Button` (variant/size/loading),
      `TextField`, `Card`, `Badge`, `EmptyState`, `Loader`, `Sheet`/`Dialog`,
      `ListItem`. Todos consumen tokens.
- [ ] Iconos → `@expo/vector-icons`; borrar `react-native-vector-icons` y reducir
      `icons.jsx` a un mapa de nombres.
- [ ] `Alert` → componente `Dialog`/`Toast` que funcione en web y móvil.

### Fase 3 — Rediseño de pantallas
- [ ] Navegación: **tabs inferiores** para móvil (Facturar · Productos · Inventario ·
      Catálogo · Más) + drawer solo en web/tablet. Mantener el filtrado por rol.
- [ ] Rehacer sobre `src/ui/`, pantalla por pantalla: login/registro, home,
      **facturar (POS)**, productos (lista + alta + detalle + editar), inventario,
      catálogo público, ajustes de tienda, perfil, QR aliado.
- [ ] Romper los componentes de 400–650 líneas en subcomponentes + hooks
      (`useCart`, `useProductSearch`, …).
- [ ] El **POS de facturar**: flujo de una pantalla → buscar / escanear → carrito
      (sheet inferior) → confirmar, con feedback claro de stock.

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
