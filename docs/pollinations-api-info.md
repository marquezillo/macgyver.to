# Pollinations.ai API - Información

## Resumen
Pollinations.ai es una plataforma de IA open-source que ofrece una API unificada para generación de imágenes, texto y audio.

## Endpoint Principal
```
https://gen.pollinations.ai
```

## Generación de Imágenes

### Endpoint Simple (GET)
```
https://gen.pollinations.ai/image/{prompt}?model=flux&key=YOUR_API_KEY
```

### Parámetros disponibles:
- `model` - Modelo a usar (flux, turbo, gptimage, nanobanana, etc.)
- `width` - Ancho en píxeles (default: 1024)
- `height` - Alto en píxeles (default: 1024)
- `seed` - Semilla para reproducibilidad
- `enhance` - Mejorar prompt con IA (true/false)
- `safe` - Filtro de seguridad (true/false)
- `private` - Ocultar de feeds públicos (true/false)

### Modelos de Imagen Disponibles:
1. **flux** - FLUX.1 (default, alta calidad)
2. **turbo** - SDXL Turbo (generación rápida)
3. **gptimage** - GPT Image 1 Mini (OpenAI)
4. **nanobanana** - Gemini 2.5 Flash Image
5. **nanobanana-pro** - Gemini 3 Pro Image (4K)
6. **seedream** - ByteDance ARK
7. **kontext** - FLUX.1 Kontext (edición in-context)
8. **klein** - FLUX.2 (rápido, edición precisa)

## Autenticación

### Tipos de API Keys:
1. **Publishable Keys (pk_)** - Para frontend, rate-limited (1 pollen/IP/hora)
2. **Secret Keys (sk_)** - Para backend, sin límites

### Métodos de autenticación:
```bash
# Header
Authorization: Bearer YOUR_API_KEY

# Query param
?key=YOUR_API_KEY
```

## Pricing (Pollen)
- Sistema de créditos llamado "Pollen"
- Tier gratuito: 1-20 pollen/día según nivel
- Los costos varían por modelo

### Tiers:
- 🦠 Spore: 1 pollen/día (nuevo usuario)
- 🌱 Seed: 3 pollen/día (actividad GitHub)
- 🌸 Flower: 10 pollen/día (app en showcase)
- 🍯 Nectar: 20 pollen/día (contribuidores)

## Ejemplo de Uso (Node.js)

```javascript
// Generación simple de imagen
const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024`;

// Con API key
const response = await fetch(imageUrl, {
  headers: {
    'Authorization': `Bearer ${POLLINATIONS_API_KEY}`
  }
});
```

## Ventajas para nuestro proyecto:
1. **API simple** - Solo una URL GET para generar imágenes
2. **Sin API key para uso básico** - Funciona sin autenticación (con límites)
3. **Múltiples modelos** - FLUX, GPT Image, Gemini, etc.
4. **Open source** - Comunidad activa
5. **Precios transparentes** - Sistema de Pollen

## Integración Propuesta:
Usar Pollinations como alternativa a Gemini para generación de imágenes:
- Modelo `flux` para calidad
- Modelo `turbo` para velocidad
- Sin necesidad de API key para pruebas básicas
