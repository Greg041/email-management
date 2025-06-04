import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { EmailTemplate, EmailFormData, Client, ClientRaw, EmailTemplateRaw } from '../types';

interface AppContextType {
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: EmailTemplate) => void;
  deleteEmailTemplate: (id: string) => void;
  clients: Client[];
  selectedClientIds: string[];
  toggleClientSelection: (clientId: string) => void;
  selectAllClients: () => void;
  deselectAllClients: () => void;
  isEmailFormOpen: boolean;
  openEmailForm: () => void;
  closeEmailForm: () => void;
  sendEmail: (data: EmailFormData) => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Fetch clients from backend API
    fetch('http://localhost:3000/api/clients')
      .then(res => res.json())
      .then((data: ClientRaw[]) => {
        const clients: Client[] = data.map((client: ClientRaw) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          lastEmailSentDate: client.lastEmailSentDate && new Date(client.lastEmailSentDate),
          lastEmailSentStatus: client.lastEmailSentStatus ?? null,
        } as Client));
        setClients(clients)  
      })
      .catch(console.error);
    
    // Fetch emailTemplates from backend API
    fetch('http://localhost:3000/api/emails/templates')
      .then(res => { 
        if (res.ok) {
          return res.json()
        } else { 
          throw new Error('Failed to fetch email templates'); 
        } 
      })
      .then((data: EmailTemplateRaw[]) => {
        const emailTemplates: EmailTemplate[] = data.map((template: EmailTemplateRaw) => ({
          id: template.id,
          templateName: template.templateName,
          uploadedAt: new Date(template.uploadedAt),
        } as EmailTemplate));
        setEmailTemplates(emailTemplates);
        })
      .catch(console.error);
  }, []);

  const addEmailTemplate = async (template: EmailTemplate) => {
    setEmailTemplates([...emailTemplates, template]);
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates(emailTemplates.filter(template => template.id !== id));
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds(prevSelected => 
      prevSelected.includes(clientId)
        ? prevSelected.filter(id => id !== clientId)
        : [...prevSelected, clientId]
    );
  };

  const selectAllClients = () => {
    const allClientIds = clients.map(client => client.id);
    
    // If all clients are already selected, deselect all
    if (allClientIds.every(id => selectedClientIds.includes(id))) {
      setSelectedClientIds([]);
    } else {
      // Otherwise, select all clients
      setSelectedClientIds(allClientIds);
    }
  };

  const deselectAllClients = () => {
    setSelectedClientIds([]);
  };

  const openEmailForm = () => {
    setIsEmailFormOpen(true);
  };

  const closeEmailForm = () => {
    setIsEmailFormOpen(false);
  };

  const sendEmail = async (data: EmailFormData) => {
    // In a real app, this would send the email via an API call
    console.log('Sending email with data:', data);
    console.log('To clients:', selectedClientIds.map(id => clients.find(client => client.id === id)));
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Close form and clear selections after "sending"
    closeEmailForm();
    setSelectedClientIds([]);
  };

  return (
    <AppContext.Provider
      value={{
        emailTemplates,
        addEmailTemplate,
        deleteEmailTemplate,
        clients,
        selectedClientIds,
        toggleClientSelection,
        selectAllClients,
        deselectAllClients,
        isEmailFormOpen,
        openEmailForm,
        closeEmailForm,
        sendEmail,
        currentPage,
        setCurrentPage,
        itemsPerPage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};