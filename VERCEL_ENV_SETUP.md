# 🔧 Variables de Entorno para Vercel

## Configurar en Vercel Dashboard

Ve a: **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

### Variables Requeridas (4 en total)

Para cada variable, marca las **3 casillas** (Production, Preview, Development):

#### 1. **NEXT_PUBLIC_PI_API_KEY**
```
Valor: 1bak6gsn4dcir2z5lmrvnyuug29nni
```
*(O el valor de tu archivo .env.local)*

#### 2. **PI_API_KEY**
```
Valor: 1bak6gsn4dcir2z5lmrvnyuug29nni
```
*(Mismo valor que NEXT_PUBLIC_PI_API_KEY)*

#### 3. **NEXT_PUBLIC_SUPABASE_URL**
```
Valor: https://xxxxxxxxxxxxx.supabase.co
```
*(Copia el valor de tu .env.local)*

#### 4. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Copia el valor de tu .env.local - es una clave muy larga)*

---

## Pasos para Agregar Variables

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Click en **Settings** (arriba)
4. Click en **Environment Variables** (menú lateral)
5. Para cada variable:
   - Click en **"Add New"**
   - **Name**: Copia el nombre exacto (ej: `NEXT_PUBLIC_PI_API_KEY`)
   - **Value**: Copia el valor de tu `.env.local`
   - **Environments**: ✅ Marca **Production, Preview, Development**
   - Click en **"Save"**
6. Repite para las 4 variables

---

## Después de Agregar las Variables

### Hacer Redeploy:
1. Ve a **"Deployments"**
2. Click en el menú **⋯** del deployment más reciente
3. Click en **"Redeploy"**
4. Confirma

⏱️ Espera 2-3 minutos mientras Vercel reconstruye tu app con las nuevas variables.

---

## Verificar que Funcionó

Una vez completado el deployment:
1. Ve a **"Functions"** en Vercel
2. Busca `/api/pi/approve` y `/api/pi/complete`
3. Deberían aparecer sin errores
4. Abre tu app en Pi Browser y prueba un pago

---

## 🆘 Si tienes problemas

- Verifica que copiaste los valores exactos de tu `.env.local`
- Asegúrate de marcar las 3 casillas de environments
- Espera 5 minutos después del redeploy
- Revisa los logs en **Vercel → Functions**
