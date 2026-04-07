import { ChangeEvent, useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

type UploadedPhoto = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

const MAX_PHOTOS = 24;
const MAX_FILE_SIZE_MB = 8;

const galleryItems = [
  { title: "Workshop Highlights", emoji: "🎓" },
  { title: "Hackathon Moments", emoji: "💻" },
  { title: "Community Meetups", emoji: "🤝" },
  { title: "Team Collaborations", emoji: "🧠" },
  { title: "Tech Talks", emoji: "🎤" },
  { title: "Club Achievements", emoji: "🏆" },
];

const Gallery = () => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadPhotos = async () => {
    try {
      const response = await fetch("/api/gallery");
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load gallery.");
      }

      setPhotos(Array.isArray(payload?.photos) ? payload.photos : []);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not load gallery photos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    if (photos.length + selectedFiles.length > MAX_PHOTOS) {
      setErrorMessage(`You can keep up to ${MAX_PHOTOS} photos in the gallery.`);
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setErrorMessage(`${oversized.name} is too large. Max size is ${MAX_FILE_SIZE_MB}MB per image.`);
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("photos", file));

    setIsUploading(true);
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Upload failed. Please try again.");
      }

      const newPhotos = Array.isArray(payload?.photos) ? payload.photos : [];
      setPhotos((prev) => [...newPhotos, ...prev]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not upload photos.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (id: string) => {
    setErrorMessage("");
    try {
      const response = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Could not delete photo.");
      }

      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete photo.");
    }
  };

  return (
    <Layout>
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Event <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A visual snapshot of X-Ops community events, learning sessions, and milestones.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="glass border border-border/50 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Add Photos From Your Device</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload JPG, PNG, WEBP, or GIF images. Photos are shared from the server.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="gallery-upload"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <ImagePlus className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Photos"}
                </label>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading}
                />
                <Button type="button" variant="outline" onClick={() => void loadPhotos()} disabled={isUploading}>
                  Refresh
                </Button>
              </div>
            </div>

            {errorMessage && <p className="text-sm text-destructive mt-4">{errorMessage}</p>}
            {isLoading && <p className="text-sm text-muted-foreground mt-4">Loading gallery photos...</p>}

            <p className="text-xs text-muted-foreground mt-4">
              {photos.length} / {MAX_PHOTOS} photos shown
            </p>
          </div>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Uploaded Photos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <article
                  key={photo.id}
                  className="gradient-border p-3 card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative rounded-lg overflow-hidden bg-card">
                    <img src={photo.url} alt={photo.name} className="w-full h-56 object-cover" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => void handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 hover:bg-background flex items-center justify-center border border-border/60"
                      aria-label={`Delete ${photo.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 truncate" title={photo.name}>
                    {photo.name}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Club Highlights</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, index) => (
              <article
                key={item.title}
                className="gradient-border p-8 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground">More event photos and highlights coming soon.</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;