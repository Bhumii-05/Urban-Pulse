import { useCallback, useRef, useState } from 'react'
import { Camera, ImageOff, X } from 'lucide-react'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

export default function EvidenceUploader({ file, previewUrl, onFileSelect, onRemove, error }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const validateAndSelect = useCallback(
    (selected) => {
      if (!selected) return
      if (!ACCEPTED_TYPES.includes(selected.type)) {
        onFileSelect(null, 'Please upload a JPG or PNG image.')
        return
      }
      if (selected.size > MAX_SIZE_BYTES) {
        onFileSelect(null, 'Image must be 5MB or smaller.')
        return
      }
      onFileSelect(selected, null)
    },
    [onFileSelect]
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    validateAndSelect(e.dataTransfer.files?.[0])
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragOver ? 'border-[#005B4F] bg-[#E6F4F1]' : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <p className="text-sm text-slate-500">Drag &amp; drop image here or take a photo</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#005B4F] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#00473e]"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Camera / Upload
          </button>
          <span className="text-xs text-slate-400">Supported: JPG, PNG, max 5MB</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            className="sr-only"
            aria-label="Upload evidence photo"
            onChange={(e) => {
              validateAndSelect(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        {previewUrl && (
          <div className="shrink-0">
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-slate-200 sm:h-32 sm:w-32">
              <img src={previewUrl} alt="Evidence preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={onRemove}
                aria-label="Remove evidence photo"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            {file && <p className="mt-1 w-28 truncate text-xs text-slate-400">{file.name}</p>}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <ImageOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
