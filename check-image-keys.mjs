// Script para verificar las API keys de imágenes
console.log("=== Verificación de API Keys de Imágenes ===");
console.log("UNSPLASH_ACCESS_KEY:", process.env.UNSPLASH_ACCESS_KEY ? "✅ Configurada (" + process.env.UNSPLASH_ACCESS_KEY.substring(0, 10) + "...)" : "❌ No configurada");
console.log("PEXELS_API_KEY:", process.env.PEXELS_API_KEY ? "✅ Configurada (" + process.env.PEXELS_API_KEY.substring(0, 10) + "...)" : "❌ No configurada");
console.log("PIXABAY_API_KEY:", process.env.PIXABAY_API_KEY ? "✅ Configurada (" + process.env.PIXABAY_API_KEY.substring(0, 10) + "...)" : "❌ No configurada");
