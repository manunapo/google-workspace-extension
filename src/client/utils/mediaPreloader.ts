// Utility for preloading images and videos

export interface PreloadedMedia {
  [url: string]: {
    element: HTMLImageElement | HTMLVideoElement;
    isLoaded: boolean;
    hasError: boolean;
  };
}

class MediaPreloader {
  private preloadedMedia: PreloadedMedia = {};

  private preloadPromises: Map<string, Promise<void>> = new Map();

  // Check if URL is a webm video
  private static isWebmVideo(url: string): boolean {
    return url.toLowerCase().endsWith('.webm');
  }

  // Preload a single media item
  private async preloadMedia(url: string): Promise<void> {
    return new Promise((resolve) => {
      if (MediaPreloader.isWebmVideo(url)) {
        // Preload video
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        const handleLoad = () => {
          this.preloadedMedia[url] = {
            element: video,
            isLoaded: true,
            hasError: false,
          };
          resolve();
        };

        const handleError = () => {
          this.preloadedMedia[url] = {
            element: video,
            isLoaded: false,
            hasError: true,
          };
          resolve(); // Still resolve to not block other preloads
        };

        video.addEventListener('loadedmetadata', handleLoad, { once: true });
        video.addEventListener('error', handleError, { once: true });
        video.src = url;
      } else {
        // Preload image
        const img = new Image();

        const handleLoad = () => {
          this.preloadedMedia[url] = {
            element: img,
            isLoaded: true,
            hasError: false,
          };
          resolve();
        };

        const handleError = () => {
          this.preloadedMedia[url] = {
            element: img,
            isLoaded: false,
            hasError: true,
          };
          resolve(); // Still resolve to not block other preloads
        };

        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });
        img.src = url;
      }
    });
  }

  // Preload multiple media URLs
  async preloadMediaList(urls: string[]): Promise<void> {
    const uniqueUrls = [...new Set(urls)]; // Remove duplicates

    const preloadPromises = uniqueUrls.map(async (url) => {
      // Check if already preloading or preloaded
      if (this.preloadPromises.has(url) || this.preloadedMedia[url]) {
        return this.preloadPromises.get(url) || Promise.resolve();
      }

      const promise = this.preloadMedia(url);
      this.preloadPromises.set(url, promise);

      try {
        await promise;
      } finally {
        this.preloadPromises.delete(url);
      }

      return Promise.resolve();
    });

    await Promise.all(preloadPromises);
  }

  // Check if media is preloaded and ready
  isMediaReady(url: string): boolean {
    const media = this.preloadedMedia[url];
    return media ? media.isLoaded : false;
  }

  // Check if media failed to load
  hasMediaError(url: string): boolean {
    const media = this.preloadedMedia[url];
    return media ? media.hasError : false;
  }

  // Get preloaded media element (for optimization)
  getPreloadedElement(url: string): HTMLImageElement | HTMLVideoElement | null {
    const media = this.preloadedMedia[url];
    return media && media.isLoaded ? media.element : null;
  }

  // Get loading statistics
  getStats(): { total: number; loaded: number; errors: number } {
    const total = Object.keys(this.preloadedMedia).length;
    const loaded = Object.values(this.preloadedMedia).filter(
      (m) => m.isLoaded
    ).length;
    const errors = Object.values(this.preloadedMedia).filter(
      (m) => m.hasError
    ).length;

    return { total, loaded, errors };
  }
}

// Create singleton instance
export const mediaPreloader = new MediaPreloader();

// React hook for using the preloader
export const useMediaPreloader = () => {
  return {
    preloadMediaList: mediaPreloader.preloadMediaList.bind(mediaPreloader),
    isMediaReady: mediaPreloader.isMediaReady.bind(mediaPreloader),
    hasMediaError: mediaPreloader.hasMediaError.bind(mediaPreloader),
    getPreloadedElement:
      mediaPreloader.getPreloadedElement.bind(mediaPreloader),
    getStats: mediaPreloader.getStats.bind(mediaPreloader),
  };
};
