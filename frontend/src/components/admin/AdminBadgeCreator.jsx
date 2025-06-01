import React, { useState } from 'react';
import { Award, Plus, Save } from 'lucide-react';
import { axiosInstance } from "../../lib/axios";
import toast from 'react-hot-toast';

const AdminBadgeCreator = ({ onCreateSuccess }) => {
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: 'default-badge.png',
    cost: 100,
    category: 'beginner',
    isAvailable: true,
    validUntil: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBadgeForm({
      ...badgeForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/admin/badge', badgeForm);
      toast.success('Badge created successfully!');
      setBadgeForm({
        name: '',
        description: '',
        icon: 'default-badge.png',
        cost: 100,
        category: 'beginner',
        isAvailable: true,
        validUntil: ''
      });
      
      if (onCreateSuccess) {
        onCreateSuccess();
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      toast.error('Failed to create badge');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Award className="w-6 h-6 text-primary" /> Create New Badge
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label font-medium">
                <span className="label-text">Badge Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={badgeForm.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="e.g., Eco Champion"
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label font-medium">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={badgeForm.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-24"
                placeholder="What makes this badge special?"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label font-medium">
                  <span className="label-text">Category</span>
                </label>
                <select
                  name="category"
                  value={badgeForm.category}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                  <option value="special">Special</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label font-medium">
                  <span className="label-text">Cost (Eco Points)</span>
                </label>
                <input
                  type="number"
                  name="cost"
                  value={badgeForm.cost}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label font-medium">
                  <span className="label-text">Icon</span>
                </label>
                <input
                  type="text"
                  name="icon"
                  value={badgeForm.icon}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="icon-name.png"
                />
                <label className="label">
                  <span className="label-text-alt">Will use default if empty</span>
                </label>
              </div>
              
              <div className="form-control">
                <label className="label font-medium">
                  <span className="label-text">Valid Until (Optional)</span>
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={badgeForm.validUntil}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">Leave empty for no expiration</span>
                </label>
              </div>
            </div>
            
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={badgeForm.isAvailable}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Make badge available immediately</span>
              </label>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Create Badge
              </button>
            </div>
          </form>
        </div>
        
        <div className="lg:col-span-5">
          <div className="bg-base-200 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Badge Preview</h3>
            
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`
                  w-32 h-32 rounded-full flex items-center justify-center
                  ${badgeForm.category === 'beginner' ? 'bg-green-100' :
                    badgeForm.category === 'intermediate' ? 'bg-blue-100' :
                    badgeForm.category === 'advanced' ? 'bg-purple-100' :
                    badgeForm.category === 'expert' ? 'bg-amber-100' :
                    badgeForm.category === 'special' ? 'bg-rose-100' : 'bg-gray-100'}
                `}>
                  <Award className={`
                    w-16 h-16
                    ${badgeForm.category === 'beginner' ? 'text-green-700' :
                      badgeForm.category === 'intermediate' ? 'text-blue-700' :
                      badgeForm.category === 'advanced' ? 'text-purple-700' :
                      badgeForm.category === 'expert' ? 'text-amber-700' :
                      badgeForm.category === 'special' ? 'text-rose-700' : 'text-gray-700'}
                  `} />
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-bold text-lg">
                  {badgeForm.name || 'Badge Name'}
                </h4>
                <p className="text-sm text-base-content/70 mt-1">
                  {badgeForm.description || 'Badge description will appear here'}
                </p>
                <div className="mt-2 flex justify-center gap-2">
                  <span className="badge badge-sm capitalize">
                    {badgeForm.category}
                  </span>
                  <span className="badge badge-sm badge-primary">
                    {badgeForm.cost} points
                  </span>
                </div>
              </div>
              
              {badgeForm.validUntil && (
                <div className="text-center text-xs text-base-content/60">
                  Available until: {new Date(badgeForm.validUntil).toLocaleDateString()}
                </div>
              )}
              
              {!badgeForm.isAvailable && (
                <div className="text-center text-xs text-base-content/60 mt-1">
                  (Not available for purchase)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBadgeCreator;
