import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { EmailFormData } from '../types';

const EmailForm: React.FC = () => {
  const { emailTemplates, selectedClientIds, clients, isEmailFormOpen, closeEmailForm, sendEmail } = useApp();
  const [formData, setFormData] = useState<EmailFormData>({
    subject: '',
    templateId: emailTemplates.length > 0 ? emailTemplates[0].id : null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; templateId?: string }>({});

  // Get selected clients for display
  const selectedClients = clients.filter(client => selectedClientIds.includes(client.id));

  const validateForm = (): boolean => {
    const newErrors: { subject?: string; templateId?: string } = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.templateId) {
      newErrors.templateId = 'Please select a template';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendEmail(formData);
      // Reset form after successful submission
      setFormData({
        subject: '',
        templateId: emailTemplates.length > 0 ? emailTemplates[0].id : null,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEmailFormOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Compose Email</h2>
          <button 
            onClick={closeEmailForm}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                Recipients ({selectedClientIds.length})
              </label>
              <div className="p-3 bg-gray-50 rounded-md max-h-24 overflow-y-auto">
                {selectedClients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedClients.slice(0, 5).map(client => (
                      <div key={client.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {client.name}
                      </div>
                    ))}
                    {selectedClients.length > 5 && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        +{selectedClients.length - 5} more
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No clients selected</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full px-4 py-2 border ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter email subject"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">
                Email Template
              </label>
              {emailTemplates.length > 0 ? (
                <select
                  id="templateId"
                  value={formData.templateId || ''}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className={`w-full px-4 py-2 border ${
                    errors.templateId ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="" disabled>Select a template</option>
                  {emailTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.templateName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                  No emailTemplates available. Please upload HTML emailTemplates first.
                </div>
              )}
              {errors.templateId && (
                <p className="mt-1 text-sm text-red-500">{errors.templateId}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeEmailForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || emailTemplates.length === 0 || selectedClientIds.length === 0}
                className={`px-4 py-2 text-white rounded-md ${
                  isSubmitting || emailTemplates.length === 0 || selectedClientIds.length === 0
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors flex items-center`}
              >
                {isSubmitting ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailForm;