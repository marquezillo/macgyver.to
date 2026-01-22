# Modelos de Gemini para Generación de Imágenes

## Nano Banana (Capacidades nativas de generación de imágenes de Gemini)

### Modelos disponibles:

1. **Nano Banana** - `gemini-2.5-flash-image`
   - Diseñado para velocidad y eficiencia
   - Optimizado para tareas de alto volumen y baja latencia

2. **Nano Banana Pro** - `gemini-3-pro-image-preview`
   - Diseñado para producción de recursos profesionales
   - Utiliza razonamiento avanzado ("Pensar")
   - Sigue instrucciones complejas
   - Renderiza texto de alta fidelidad

### Ejemplo de uso (Python):

```python
from google import genai
from google.genai import types
from PIL import Image

client = genai.Client()

prompt = "Create a picture of a nano banana dish in a fancy restaurant"
response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt],
)

for part in response.parts:
    if part.text is not None:
        print(part.text)
    elif part.inline_data is not None:
        image = part.as_image()
        image.save("generated_image.png")
```

### Configuración:

- `response_modalities`: ['TEXT', 'IMAGE']
- `aspect_ratio`: "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
- `image_size`: "1K", "2K", "4K"

## Imagen (Modelo separado)

- Modelo: `imagen-4.0-generate-001`
- Usa `client.models.generate_images()` en lugar de `generate_content()`
- Solo admite instrucciones en inglés
