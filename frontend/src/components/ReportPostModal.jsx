import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const reasons = [
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'harmful', label: 'Harmful or Dangerous' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' }
];

const ReportPostModal = ({ isOpen, onClose, post }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    
    try {
      setLoading(true);
      await axiosInstance.post(`/posts/${post._id}/report`, { 
        reason, 
        details 
      });
      
      toast.success('Post reported successfully');
      onClose();
      setReason('');
      setDetails('');
    } catch (error) {
      console.error('Error reporting post:', error);
      if (error.response?.data?.message === 'You have already reported this post') {
        toast.error('You have already reported this post');
      } else {
        toast.error('Failed to report post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Report Post
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-warning/10 border-l-4 border-warning p-4 mb-4 text-sm">
            <p>Please report this content only if you believe it violates our community guidelines. False reports may result in action against your account.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Reason for reporting*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>Select a reason</option>
                {reasons.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Additional details</span>
                <span className="label-text-alt">Optional</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="textarea textarea-bordered h-24"
                placeholder="Please provide any additional context that might help us understand the issue..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                )}
                Report Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportPostModal;
