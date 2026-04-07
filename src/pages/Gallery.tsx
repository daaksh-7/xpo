import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

type UploadedPhoto = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  category?: string;
};

const galleryCategories = [
  { label: "All", value: "all" },
  { label: "Workshops", value: "workshops" },
  { label: "Hackathons", value: "hackathons" },
  { label: "Technical Events", value: "technical-events" },
  { label: "Projects", value: "projects" },
  { label: "Fun Activities", value: "fun-activities" },
];

const Gallery = () => {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(galleryCategories[0].value);

  const loadPhotos = async (category: string) => {
    setIsLoading(true);
    setPhotos([]);
    try {
      const query =
        category && category !== "all"
          ? `?category=${encodeURIComponent(category)}`
          : "";
      const response = await fetch(`/api/gallery${query}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load gallery.");
      }

      setPhotos(Array.isArray(payload?.photos) ? payload.photos : []);
      setErrorMessage("");
    } catch (error) {
      setPhotos([]);
      setErrorMessage(error instanceof Error ? error.message : "Could not load gallery photos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos(activeCategory);
  }, [activeCategory]);

  return (
    <Layout>
      <section className="pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-4">Moments captured from our journey</p>
            <div className="h-1 w-28 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mt-6" />

            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              {galleryCategories.map((category) => {
                const isActive = category.value === activeCategory;
                return (
                  <Button
                    key={category.value}
                    type="button"
                    variant={isActive ? "gradient" : "hero-outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => setActiveCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                );
              })}
            </div>

            {errorMessage && <p className="text-sm text-destructive mt-6">{errorMessage}</p>}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-12">Loading gallery photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">No photos yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <article
                  key={photo.id}
                  className="gradient-border p-3 card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative rounded-lg overflow-hidden bg-card">
                    <img src={photo.url} alt={photo.name} className="w-full h-56 object-cover" loading="lazy" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 truncate" title={photo.name}>
                    {photo.name}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
