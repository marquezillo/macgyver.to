// Script para probar la búsqueda de imágenes de yoga
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

async function testUnsplash(query) {
  console.log("\n=== UNSPLASH ===");
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Total results:", data.total);
    if (data.results && data.results.length > 0) {
      console.log("First image URL:", data.results[0].urls.regular.substring(0, 80) + "...");
    } else {
      console.log("No results found");
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

async function testPexels(query) {
  console.log("\n=== PEXELS ===");
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Total results:", data.total_results);
    if (data.photos && data.photos.length > 0) {
      console.log("First image URL:", data.photos[0].src.large.substring(0, 80) + "...");
    } else {
      console.log("No results found");
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

async function testPixabay(query) {
  console.log("\n=== PIXABAY ===");
  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=3&image_type=photo`
    );
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Total results:", data.totalHits);
    if (data.hits && data.hits.length > 0) {
      console.log("First image URL:", data.hits[0].largeImageURL.substring(0, 80) + "...");
    } else {
      console.log("No results found");
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

const query = "yoga meditation studio";
console.log("Testing image search for:", query);

await testUnsplash(query);
await testPexels(query);
await testPixabay(query);
