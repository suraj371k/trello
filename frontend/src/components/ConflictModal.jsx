import React from "react";
import { X, AlertTriangle, RefreshCw, Save } from "lucide-react";
import useTaskStore from "../store/taskStore";
import toast from "react-hot-toast";

const ConflictModal = ({ isOpen, onClose, conflictData, clientData, onResolve }) => {
  const { forceUpdateTask, clearConflict } = useTaskStore();

  if (!isOpen || !conflictData) return null;

  const handleOverwrite = async () => {
    try {
      const result = await forceUpdateTask(conflictData.serverTask._id, clientData);
      if (result) {
        toast.success("Task updated successfully (overwrote conflicting changes)");
        clearConflict();
        onResolve && onResolve(result);
        onClose();
      }
    } catch (error) {
      toast.error("Failed to overwrite task");
    }
  };

  const handleKeepServer = () => {
    // Update local state with server version
    onResolve && onResolve(conflictData.serverTask);
    clearConflict();
    onClose();
    toast.success("Kept server version of the task");
  };

  const handleCancel = () => {
    clearConflict();
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Version Conflict Detected</h2>
            <p className="text-sm text-gray-600">
              This task has been modified by another user while you were editing it.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Conflict Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Conflict Details</span>
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Your version: {conflictData.clientVersion}</p>
              <p>• Server version: {conflictData.currentVersion}</p>
              <p>• Last modified: {formatDate(conflictData.serverTask.updatedAt)}</p>
              {conflictData.serverTask.lastEditedBy && (
                <p>• Modified by: {conflictData.serverTask.lastEditedBy.username}</p>
              )}
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Server Version */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                Server Version (Current)
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <p className="text-gray-900">{conflictData.serverTask.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900">{conflictData.serverTask.description || "No description"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    conflictData.serverTask.priority === "Low"
                      ? "bg-blue-100 text-blue-800"
                      : conflictData.serverTask.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : conflictData.serverTask.priority === "High"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {conflictData.serverTask.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    conflictData.serverTask.status === "Todo"
                      ? "bg-gray-100 text-gray-800"
                      : conflictData.serverTask.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {conflictData.serverTask.status}
                  </span>
                </div>
                {conflictData.serverTask.dueDate && (
                  <div>
                    <span className="font-medium text-gray-700">Due Date:</span>
                    <p className="text-gray-900">{formatDate(conflictData.serverTask.dueDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Your Version */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Save className="w-4 h-4 text-green-600" />
                Your Version (Pending)
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <p className="text-gray-900">{clientData.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900">{clientData.description || "No description"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    clientData.priority === "Low"
                      ? "bg-blue-100 text-blue-800"
                      : clientData.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : clientData.priority === "High"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {clientData.priority}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    clientData.status === "Todo"
                      ? "bg-gray-100 text-gray-800"
                      : clientData.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {clientData.status}
                  </span>
                </div>
                {clientData.dueDate && (
                  <div>
                    <span className="font-medium text-gray-700">Due Date:</span>
                    <p className="text-gray-900">{formatDate(clientData.dueDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleKeepServer}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Keep Server Version
            </button>
            <button
              onClick={handleOverwrite}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Overwrite Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal; 