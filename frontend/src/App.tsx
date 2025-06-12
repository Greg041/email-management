import { useState } from "react";
import { AppProvider } from "./contexts/AppContext";
import TemplateUpload from "./components/TemplateUpload";
import ClientList from "./components/ClientList";
import EmailForm from "./components/EmailForm";
import Navigation from "./components/Navigation";
import Toast from "./components/Toast";

function App() {
  const [activeTab, setActiveTab] = useState<"templates" | "users">(
    "templates"
  );

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <Toast />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            {activeTab === "templates" ? <TemplateUpload /> : <ClientList />}
          </div>

          <EmailForm />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
