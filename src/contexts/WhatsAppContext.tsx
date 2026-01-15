import { createContext, useContext, useState, ReactNode } from 'react';

interface WhatsAppContextType {
  phoneNumber: string | null;
  setPhoneNumber: (number: string | null) => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  return (
    <WhatsAppContext.Provider value={{ phoneNumber, setPhoneNumber }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}
