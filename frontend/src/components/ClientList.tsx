import React, { useState, useMemo } from 'react';
import { Check, ChevronLeft, ChevronRight, Mail, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { EmailStatus } from '../enums';

const ClientList: React.FC = () => {
  const { 
    clients, 
    selectedClientIds, 
    toggleClientSelection, 
    selectAllClients,
    openEmailForm,
    currentPage,
    setCurrentPage,
    itemsPerPage
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter clients based on search and department
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = searchTerm === '' || 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      
      return matchesSearch;
    });
  }, [clients, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  // Check if all current page clients are selected
  const areAllCurrentSelected = currentClients.length > 0 && 
    currentClients.every(client => selectedClientIds.includes(client.id));

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Client Management</h2>
          <p className="text-gray-600 mt-1">
            Select clients to send emails ({filteredClients.length} clients total)
          </p>
        </div>
        
        {selectedClientIds.length > 0 && (
          <button 
            onClick={openEmailForm}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Selected ({selectedClientIds.length})
          </button>
        )}
      </div>
      
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 w-14">
                <button 
                  onClick={selectAllClients}
                  className={`w-5 h-5 rounded border ${
                    areAllCurrentSelected 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-300'
                  } flex items-center justify-center transition-colors`}
                >
                  {areAllCurrentSelected && <Check className="w-4 h-4" />}
                </button>
              </th>
              <th className="p-4 text-sm font-medium text-gray-500">Name</th>
              <th className="p-4 text-sm font-medium text-gray-500">Email</th>
              <th className="p-4 text-sm font-medium text-gray-500">Last email sent date</th>
              <th className="p-4 text-sm font-medium text-gray-500">Last email sent status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentClients.map(client => (
              <tr 
                key={client.id} 
                className={`${
                  selectedClientIds.includes(client.id) 
                    ? 'bg-blue-50' 
                    : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <td className="p-4">
                  <button 
                    onClick={() => toggleClientSelection(client.id)}
                    className={`w-5 h-5 rounded border ${
                      selectedClientIds.includes(client.id) 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300'
                    } flex items-center justify-center transition-colors`}
                  >
                    {selectedClientIds.includes(client.id) && <Check className="w-4 h-4" />}
                  </button>
                </td>
                <td className="p-4 font-medium text-gray-800">{client.name}</td>
                <td className="p-4 text-gray-600">{client.email}</td>
                <td className="p-4 text-gray-600">
                  {client.lastEmailSentDate 
                    ? `${client.lastEmailSentDate.getDate()}-${client.lastEmailSentDate.getMonth() + 1}-${client.lastEmailSentDate.getFullYear()}`
                    : 'N/A'}
                  </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full text-gray-700 
                    ${client.lastEmailSentStatus === EmailStatus.SENT ? 
                    'bg-blue-100' 
                    : 
                    client.lastEmailSentStatus === EmailStatus.OPENED ? 
                    'bg-green-100' 
                    : 
                    ''}`}
                    >
                    {client.lastEmailSentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredClients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No clients found matching your search criteria
        </div>
      ) : (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredClients.length)} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`p-2 rounded ${
                currentPage >= totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;