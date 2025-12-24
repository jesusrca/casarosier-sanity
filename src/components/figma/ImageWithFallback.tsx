import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, loading = 'lazy', ...rest } = props

  // Si no hay src o está vacío, mostrar solo el placeholder
  if (!src || src.trim() === '') {
    return (
      <div
        className={`bg-[#F3F2EF] ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt={alt || 'No image'} className="opacity-30" {...rest} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative inline-block w-full" style={style}>
      {/* Placeholder mientras carga */}
      {isLoading && !didError && (
        <div
          className={`absolute inset-0 bg-[#F3F2EF] animate-pulse ${className ?? ''}`}
          style={style}
        />
      )}
      
      {/* Imagen con error */}
      {didError ? (
        <div
          className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
          style={style}
        >
          <div className="flex items-center justify-center w-full h-full">
            <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
          </div>
        </div>
      ) : (
        /* Imagen real con lazy loading */
        <img 
          src={src} 
          alt={alt} 
          loading={loading}
          decoding="async"
          className={`${className ?? ''} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          style={style} 
          {...rest} 
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  )
}