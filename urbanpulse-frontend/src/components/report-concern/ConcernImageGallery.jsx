import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';
import { concernService } from '../../api/concern.service';

function ImageThumbnail({ img, onOpen, altText }) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgUrl = img.image_url || img.url || img.secure_url;

  return (
    <div
      onClick={() => !hasError && onOpen()}
      className={`group relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition hover:ring-2 hover:ring-emerald-500/50 ${
        hasError ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      {!loaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        </div>
      )}

      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center text-slate-400">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="mt-1 text-[9px]">Failed</span>
        </div>
      ) : (
        <>
          <img
            src={imgUrl}
            alt={altText}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setHasError(true)}
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-110 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
            <ZoomIn className="h-4 w-4 text-white drop-shadow" />
          </div>
        </>
      )}
    </div>
  );
}

export default function ConcernImageGallery({ concernId, initialImages = null }) {
  const [images, setImages] = useState(initialImages || []);
  const [loading, setLoading] = useState(!initialImages);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImages() {
      if (initialImages) return;
      setLoading(true);
      setError(null);
      try {
        const data = await concernService.getConcernImages(concernId);
        if (isMounted) {
          setImages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(`Failed to load images for concern #${concernId}:`, err);
        if (isMounted) setError('Could not load evidence images.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (concernId) {
      loadImages();
    }

    return () => {
      isMounted = false;
    };
  }, [concernId, initialImages]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleNext, handlePrev]);

  const activeImage = activeIndex !== null ? images[activeIndex] : null;
  const activeUrl = activeImage ? activeImage.image_url || activeImage.url || activeImage.secure_url : '';

  return (
    <div className="mt-3">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
          Attached Evidence ({images.length})
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          Fetching photo records...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
          No photo attachments found for this report.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {images.map((img, idx) => (
            <ImageThumbnail
              key={img.id || img.public_id || idx}
              img={img}
              altText={`Evidence photo #${idx + 1}`}
              onOpen={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      )}

      {/* Advanced Lightbox Modal */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-white">
                <div className="text-xs font-medium text-slate-300">
                  Photo <span className="text-emerald-400">{activeIndex + 1}</span> of {images.length}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    title="Open original in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={activeUrl}
                    download={`concern-evidence-${activeIndex + 1}.jpg`}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    title="Download Photo"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(null)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    title="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Image Stage */}
              <div className="relative flex min-h-[300px] max-h-[75vh] items-center justify-center overflow-hidden bg-black/50 p-2">
                <img
                  src={activeUrl}
                  alt={`Enlarged evidence photo ${activeIndex + 1}`}
                  className="max-h-[72vh] w-auto max-w-full rounded-lg object-contain select-none shadow-lg"
                />

                {/* Left/Right Navigation Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-emerald-600 focus:outline-none"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 p-2 text-white shadow-lg backdrop-blur-sm transition hover:bg-emerald-600 focus:outline-none"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}