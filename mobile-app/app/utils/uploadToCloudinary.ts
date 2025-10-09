// Use local config -- this mirrors .env values and avoids Metro @env resolution issues
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from "../config/env";

/**
 * Upload une image vers Cloudinary et retourne l’URL sécurisée.
 * @param uri URI locale de la photo (ex: file:///data/user/0/...)
 * @returns L’URL HTTPS hébergée sur Cloudinary
 */
export async function uploadToCloudinary(uri: string): Promise<string> {
  if (!CLOUDINARY_UPLOAD_URL || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary non configuré. Vérifie ton fichier .env");
  }

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "observation.jpg",
  } as any);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // Cloudinary returns { error: { message: '...' } } on failure
    if (data && data.error && data.error.message) {
      console.error("Cloudinary error:", data.error.message);
      throw new Error(`Cloudinary error: ${data.error.message}`);
    }

    if (!data.secure_url) {
      console.error("Cloudinary unexpected response:", data);
      throw new Error("Échec de l'upload Cloudinary");
    }

    console.log("☁️ Cloudinary URL:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Erreur Cloudinary:", error);
    throw error;
  }
}
