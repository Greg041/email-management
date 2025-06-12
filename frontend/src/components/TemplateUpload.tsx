import React, { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { useApp } from "../contexts/AppContext";

const EmailTemplateUpload: React.FC = () => {
  const { emailTemplates, addEmailTemplate, deleteEmailTemplate } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      if (file.type === "text/html" || file.name.endsWith(".html")) {
        const formData = new FormData();
        formData.append("file", file);
        addEmailTemplate(formData);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Email EmailTemplates
        </h2>
        <p className="text-gray-600 mt-1">
          Upload HTML files to use as email templates
        </p>
      </div>

      <div
        className={`p-10 border-2 border-dashed rounded-md mx-6 my-6 flex flex-col items-center justify-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-blue-500 mb-4" />
        <p className="text-gray-700 font-medium mb-2">
          Drag and drop HTML files here
        </p>
        <p className="text-gray-500 mb-4">or</p>
        <button
          onClick={handleButtonClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Browse Files
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".html"
          className="hidden"
          multiple
        />
      </div>

      <div className="px-6 pb-6">
        <h3 className="font-medium text-gray-700 mb-3">
          Uploaded EmailTemplates
        </h3>

        {emailTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
            No templates uploaded yet
          </div>
        ) : (
          <div className="space-y-3">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {template.templateName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Uploaded on{" "}
                    {new Date(template.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteEmailTemplate(template.id)}
                  className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Delete template"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateUpload;
