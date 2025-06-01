import React, { useState, useEffect } from 'react';
import { AlertCircle, Send, X } from 'lucide-react';
import { axiosInstance } from "../../lib/axios";
import toast from 'react-hot-toast';

const AdminAlertManager = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertForm, setAlertForm] = useState({
    message: '',
    type: 'warning'
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Check if a user was selected from the user management page
    const savedUser = localStorage.getItem('adminAlertUser');
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
      localStorage.removeItem('adminAlertUser');
    }
    
    // Listen for tab change events
    const handleTabChange = (e) => {
      if (e.detail === 'alerts') {
        // This tab has been selected
      }
    };
    
    window.addEventListener('adminSwitchTab', handleTabChange);
    
    return () => {
      window.removeEventListener('adminSwitchTab', handleTabChange);
    };
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlertForm({
      ...alertForm,
      [name]: value
    });
  };
  
  const clearSelectedUser = () => {
    setSelectedUser(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Please select a user to send an alert to');
      return;
    }
    
    if (!alertForm.message.trim()) {
      toast.error('Please enter an alert message');
      return;
    }
    
    setLoading(true);
    
    try {
      await axiosInstance.post('/admin/send-alert', {
        userId: selectedUser._id,
        message: alertForm.message,
        type: alertForm.type
      });
      
      toast.success('Alert sent successfully');
      setAlertForm({ message: '', type: 'warning' });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending alert:', error);
      toast.error('Failed to send alert');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-primary" /> Send User Alert
      </h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Use this feature to send alerts to users about inappropriate behavior or policy violations. 
              These alerts will appear as system notifications in the user's notification panel.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedUser ? (
              <div className="alert bg-blue-50 text-blue-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img src="/avatar.png" alt={selectedUser.fullName} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedUser.fullName}</p>
                    <p className="text-sm opacity-80">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  className="btn btn-sm btn-circle"
                  onClick={clearSelectedUser}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="alert bg-base-200">
                <AlertCircle className="w-6 h-6" />
                <span>No user selected. Please select a user from the User Management page.</span>
              </div>
            )}
            
            <div className="form-control">
              <label className="label font-medium">
                <span className="label-text">Alert Type</span>
              </label>
              <select
                name="type"
                value={alertForm.type}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="warning">Warning - Policy Violation</option>
                <option value="info">Information - General Notice</option>
                <option value="critical">Critical - Serious Concern</option>
              </select>
            </div>
            
            <div className="form-control">
              <label className="label font-medium">
                <span className="label-text">Message</span>
              </label>
              <textarea
                name="message"
                value={alertForm.message}
                onChange={handleChange}
                className="textarea textarea-bordered h-32"
                placeholder="Enter the alert message to the user..."
                required
              ></textarea>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className={`btn gap-2 ${
                  alertForm.type === 'warning' ? 'btn-warning' :
                  alertForm.type === 'info' ? 'btn-info' :
                  alertForm.type === 'critical' ? 'btn-error' : 'btn-primary'
                }`}
                disabled={loading || !selectedUser}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send Alert
              </button>
            </div>
          </form>
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-base-200 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Alert Preview</h3>
            
            <div className={`
              alert mb-4
              ${alertForm.type === 'warning' ? 'bg-warning/20 text-warning-content' :
                alertForm.type === 'info' ? 'bg-info/20 text-info-content' :
                alertForm.type === 'critical' ? 'bg-error/20 text-error-content' : 'bg-base-300'}
            `}>
              <AlertCircle className="w-6 h-6" />
              <div>
                <div className="font-bold capitalize">{alertForm.type} Alert</div>
                <div className="text-xs">From: System Administrator</div>
              </div>
            </div>
            
            <div className="bg-base-100 rounded-lg p-4 min-h-[100px] break-words">
              {alertForm.message || 'Your alert message will appear here...'}
            </div>
            
            <div className="mt-6">
              <div className="text-xs text-base-content/60">
                This alert will be sent as a notification and will be permanently saved in the user's notification history.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlertManager;
