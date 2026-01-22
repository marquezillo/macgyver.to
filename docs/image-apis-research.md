# APIs de Bancos de Imágenes - Investigación

## APIs GRATUITAS (Prioridad Alta)

### 1. Unsplash API ⭐ (Ya integrado)
- **URL:** https://unsplash.com/developers
- **Límite gratuito:** 50 requests/hora (demo), 5000/hora (producción)
- **Licencia:** Gratis, sin atribución requerida
- **Colección:** 3+ millones de imágenes de alta calidad
- **Documentación:** https://unsplash.com/documentation
- **SDKs:** PHP, Ruby, JavaScript, iOS, Android
- **Pros:** Alta calidad, comunidad activa, fácil integración
- **Contras:** Solo fotos (no videos)

### 2. Pexels API ⭐ (Ya integrado)
- **URL:** https://www.pexels.com/api/
- **Límite gratuito:** 200 requests/hora, 20,000/mes
- **Licencia:** Gratis, sin atribución requerida
- **Colección:** Millones de fotos y videos curados
- **Documentación:** https://www.pexels.com/api/documentation/
- **SDKs:** Ruby, JavaScript, DotNet
- **Pros:** Incluye videos, curado manualmente, parte de Canva
- **Contras:** Colección más pequeña que comerciales

### 3. Pixabay API ⭐ (Pendiente de integrar)
- **URL:** https://pixabay.com/api/docs/
- **Límite gratuito:** 100 requests/minuto
- **Licencia:** Gratis, requiere mención de Pixabay
- **Colección:** 4.3+ millones de imágenes, videos y música
- **Documentación:** https://pixabay.com/api/docs/
- **Pros:** Gran variedad, incluye vectores y videos
- **Contras:** Requiere mención, no hotlinking (descargar primero)

### 4. Lorem Picsum (Placeholder)
- **URL:** https://picsum.photos/
- **Límite:** Ilimitado
- **Uso:** Imágenes placeholder aleatorias
- **Ejemplo:** https://picsum.photos/800/600

### 5. Pravatar (Avatares)
- **URL:** https://pravatar.cc/
- **Límite:** Ilimitado
- **Uso:** Avatares aleatorios para testimonios
- **Ejemplo:** https://i.pravatar.cc/150?u=1

### 6. UI Faces (Avatares)
- **URL:** https://uifaces.co/
- **Uso:** Avatares para UI/UX

### 7. RandomUser API (Personas ficticias)
- **URL:** https://randomuser.me/
- **Uso:** Genera usuarios con foto, nombre, email

---

## APIs COMERCIALES (Referencia)

### 8. Adobe Stock API
- **Colección:** 200+ millones de assets
- **Costo:** Desde $29.99/mes
- **Uso:** Búsqueda gratuita, licenciamiento de pago

### 9. Shutterstock API
- **Colección:** 460+ millones de assets
- **Costo:** Contactar ventas
- **Uso:** Empresas grandes (Facebook, Google, Microsoft)

### 10. Getty Images API
- **Colección:** 477+ millones de assets
- **Costo:** Solo clientes existentes
- **Uso:** Editorial, noticias, deportes

### 11. Vecteezy API
- **Colección:** 50+ millones de assets
- **Costo:** Desde $40/mes
- **Uso:** Vectores, fotos, videos

### 12. Storyblocks API
- **Uso:** Videos y audio principalmente
- **Costo:** Precio fijo negociable

---

## GENERACIÓN CON IA (Fallback)

### 13. Gemini AI (Configurado)
- **Modelo:** gemini-2.0-flash-exp-image-generation
- **Uso:** Cuando no hay resultados en bancos gratuitos
- **Costo:** Créditos de API

### 14. DALL-E 3 (OpenAI)
- **Uso:** Alternativa a Gemini
- **Costo:** Créditos de API

---

## ESTRATEGIA DE BÚSQUEDA HÍBRIDA

```
1. Unsplash (gratis, alta calidad)
   ↓ si no hay resultados
2. Pexels (gratis, curado)
   ↓ si no hay resultados
3. Pixabay (gratis, gran variedad)
   ↓ si no hay resultados
4. Gemini AI (generación)
   ↓ si falla
5. Unsplash Source URL (fallback garantizado)
```

---

## NOTAS IMPORTANTES

- **Unsplash Source:** `https://source.unsplash.com/1600x900/?keyword` siempre funciona como fallback
- **Pravatar:** Ideal para testimonios y avatares de equipo
- **Pixabay:** Requiere descargar imágenes (no hotlinking directo)
- **Rate limits:** Implementar caché para evitar exceder límites
