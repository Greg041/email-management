import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  EmailTemplate,
  EmailFormData,
  Client,
  ClientRaw,
  EmailTemplateRaw,
  GenericResponse,
  ToastProps,
} from "../types";
import { ResponseStatusType } from "../enums";

interface AppContextType {
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (fileFormData: FormData) => void;
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
  toast: ToastProps | null;
  setToast: (toast: ToastProps | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    // Fetch clients from backend API
    fetch("http://localhost:3000/api/clients")
      .then((res) => res.json())
      .then((data: ClientRaw[]) => {
        const clients: Client[] = data.map(
          (client: ClientRaw) =>
            ({
              id: client.id,
              name: client.name,
              email: client.email,
              lastEmailSentDate:
                client.lastEmailSentDate && new Date(client.lastEmailSentDate),
              lastEmailSentStatus: client.lastEmailSentStatus ?? null,
            } as Client)
        );
        setClients(clients);
      })
      .catch(console.error);

    // Fetch emailTemplates from backend API
    fetch("http://localhost:3000/api/emails/templates")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to fetch email templates");
        }
      })
      .then((data: EmailTemplateRaw[]) => {
        const emailTemplates: EmailTemplate[] = data.map(
          (template: EmailTemplateRaw) =>
            ({
              id: template.id,
              templateName: template.templateName,
              uploadedAt: new Date(template.uploadedAt),
            } as EmailTemplate)
        );
        setEmailTemplates(emailTemplates);
      })
      .catch(console.error);
  }, []);

  const addEmailTemplate = async (fileFormData: FormData) => {
    const response = await fetch("http://localhost:3000/api/emails/templates", {
      method: "POST",
      body: fileFormData,
    });

    if (!response.ok) {
      if (response.status < 500) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to upload template";
        setToast({
          type: ResponseStatusType.ERROR,
          message: errorMessage,
        });
      } else {
        setToast({
          type: ResponseStatusType.ERROR,
          message: "Server error, please try again later or contact support.",
        });
      }
    } else {
      const data: EmailTemplate = await response.json();
      setEmailTemplates([
        ...emailTemplates,
        {
          id: data.id,
          templateName: data.templateName,
          uploadedAt: new Date(data.uploadedAt),
        },
      ]);
      setToast({
        type: ResponseStatusType.SUCCESS,
        message: "Template uploaded successfully",
      });
    }
  };

  const deleteEmailTemplate = async (id: string) => {
    // Call backend API to delete template in DDBB
    await fetch(`http://localhost:3000/api/emails/templates/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to delete email templates");
        }
      })
      .then((data: GenericResponse) => {
        console.log(data.message);
        // Update state to remove the deleted template
        setEmailTemplates(
          emailTemplates.filter((template) => template.id !== id)
        );
      })
      .catch(console.error);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prevSelected) =>
      prevSelected.includes(clientId)
        ? prevSelected.filter((id) => id !== clientId)
        : [...prevSelected, clientId]
    );
  };

  const selectAllClients = () => {
    const allClientIds = clients.map((client) => client.id);

    // If all clients are already selected, deselect all
    if (allClientIds.every((id) => selectedClientIds.includes(id))) {
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

  const sendEmail = async (data: EmailFormData): Promise<void> => {
    // Get the emaiils of selected clients
    data.recipientEmails = clients
      .map((client) =>
        selectedClientIds.includes(client.id) ? client.email : null
      )
      .filter((email) => email !== null);

    // Fetch email sending
    const response = await fetch("http://localhost:3000/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status < 500) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to send email";
        setToast({
          type: ResponseStatusType.ERROR,
          message: errorMessage,
        });
      } else {
        setToast({
          type: ResponseStatusType.ERROR,
          message: "Server error, please try again later or contact support.",
        });
      }
    } else {
      const responseData: GenericResponse = await response.json();
      setToast({
        type: ResponseStatusType.SUCCESS,
        message: responseData.message,
      });
    }
    // Close form and clear selections after
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
        itemsPerPage,
        toast,
        setToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
