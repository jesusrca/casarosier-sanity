import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface AutocompleteOption {
  name: string;
  path: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPath?: (path: string) => void;
  options: AutocompleteOption[];
  placeholder: string;
  className?: string;
  type?: 'name' | 'path';
}

export function AutocompleteInput({
  value,
  onChange,
  onSelectPath,
  options,
  placeholder,
  className = '',
  type = 'name'
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo filtrar y mostrar si el usuario ha interactuado con el campo
    if (hasInteracted) {
      if (value && value.length > 0) {
        const filtered = options.filter(option => {
          const searchField = type === 'name' ? option.name : option.path;
          return searchField.toLowerCase().includes(value.toLowerCase());
        });
        setFilteredOptions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        // Si el campo está vacío pero se ha hecho clic, mostrar todas las opciones
        setFilteredOptions(options);
        setShowSuggestions(options.length > 0);
      }
    } else {
      // Si no ha interactuado, no mostrar sugerencias
      setFilteredOptions([]);
      setShowSuggestions(false);
    }
  }, [value, options, type, hasInteracted]);

  // Update dropdown position when showing
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const updatePosition = () => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.left + window.scrollX,
            width: rect.width
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both container and dropdown
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHasInteracted(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: AutocompleteOption) => {
    if (type === 'name') {
      onChange(option.name);
      if (onSelectPath) {
        onSelectPath(option.path);
      }
    } else {
      onChange(option.path);
    }
    setShowSuggestions(false);
    // Reset interaction state when selection is made
    setHasInteracted(false);
  };

  const handleFocus = () => {
    setHasInteracted(true);
    // Trigger showing suggestions after state is updated
    setTimeout(() => {
      if (value && value.length > 0) {
        const filtered = options.filter(option => {
          const searchField = type === 'name' ? option.name : option.path;
          return searchField.toLowerCase().includes(value.toLowerCase());
        });
        if (filtered.length > 0) {
          setFilteredOptions(filtered);
          setShowSuggestions(true);
        }
      } else {
        setFilteredOptions(options);
        setShowSuggestions(options.length > 0);
      }
    }, 0);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onClick={handleFocus}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && filteredOptions.length > 0 && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[99999] bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            style={{ 
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            {filteredOptions.map((option, index) => (
              <button
                key={`${option.path}-${index}`}
                type="button"
                onMouseDown={(e) => {
                  // Prevent the handleClickOutside from firing
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option);
                }}
                className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-primary/20"
              >
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{option.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.path}</div>
                </div>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}