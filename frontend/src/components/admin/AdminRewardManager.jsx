import { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';
import { Gift, PlusCircle, Save, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { compressImage } from '../../utils/imageCompression';
import { formatFileSize, validateFileSize, validateFileType } from '../../utils/fileUtils';

const DEFAULT_FORM = {
  name: '',
  description: '',
  pointCost: 100,
  category: 'merchandise',
  image: '',
  quantity: -1,
  expiresAt: '',
};

const AdminRewardManager = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/rewards');
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!validateFileType(file, ['image/jpeg', 'image/png', 'image/webp'])) {
        toast.error('Only JPEG, PNG, and WebP images are allowed');
        return;
      }

      // Validate file size (10MB limit)
      if (!validateFileSize(file, 10 * 1024 * 1024)) {
        toast.error(`File size too large (max ${formatFileSize(10 * 1024 * 1024)})`);
        return;
      }

      try {
        // Compress the image
        const compressedImage = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          outputFormat: 'image/jpeg'
        });
        
        setFormData(prev => ({ ...prev, image: compressedImage }));
        setPreviewImage(compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error(`Failed to process image. ${error.message}`);
        
        // Fallback to original image if compression fails
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, image: reader.result }));
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.pointCost <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/admin/rewards/${editingId}`, formData);
        toast.success('Reward updated successfully');
      } else {
        await axiosInstance.post('/admin/rewards', formData);
        toast.success('Reward created successfully');
      }
      
      resetForm();
      fetchRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'create'} reward`);
    }
  };

  const handleEdit = (reward) => {
    setEditingId(reward._id);
    setFormData({
      name: reward.name,
      description: reward.description,
      pointCost: reward.pointCost,
      category: reward.category,
      image: reward.image,
      quantity: reward.quantity,
      expiresAt: reward.expiresAt ? new Date(reward.expiresAt).toISOString().split('T')[0] : '',
    });
    setPreviewImage(reward.image);
    setShowForm(true);
  };

  const handleDelete = async (rewardId) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      await axiosInstance.delete(`/admin/rewards/${rewardId}`);
      toast.success('Reward deleted successfully');
      fetchRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      
      if (error.response?.data?.pendingCount) {
        toast.error(`Cannot delete: ${error.response.data.pendingCount} pending redemptions`);
      } else {
        toast.error('Failed to delete reward');
      }
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setPreviewImage('');
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'merchandise': 'Merchandise',
      'discount': 'Discount',
      'experience': 'Experience',
      'donation': 'Donation',
      'other': 'Other'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" /> Reward Management
        </h2>
        
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : (
            <>
              <PlusCircle className="w-4 h-4 mr-1" />
              Add New Reward
            </>
          )}
        </button>
      </div>
      
      {showForm && (
        <div className="bg-base-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Edit' : 'Create'} Reward
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name*</span>
                </label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Eco-friendly T-shirt"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="merchandise">Merchandise</option>
                  <option value="discount">Discount</option>
                  <option value="experience">Experience</option>
                  <option value="donation">Donation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Point Cost*</span>
                </label>
                <input 
                  type="number"
                  name="pointCost"
                  value={formData.pointCost}
                  onChange={handleChange}
                  min="1"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quantity</span>
                  <span className="label-text-alt">(-1 for unlimited)</span>
                </label>
                <input 
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="-1"
                  className="input input-bordered w-full"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Expiration Date</span>
                  <span className="label-text-alt">(Optional)</span>
                </label>
                <input 
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Image</span>
                  <span className="label-text-alt">(Optional)</span>
                </label>
                <input 
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                />
                {(previewImage || formData.image) && (
                  <div className="mt-2">
                    <img 
                      src={previewImage || formData.image}
                      alt="Reward preview"
                      className="w-24 h-24 object-cover rounded-lg border border-base-300"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description*</span>
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what users will receive when redeeming this reward"
                className="textarea textarea-bordered w-full h-24"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                className="btn btn-ghost"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
              >
                <Save className="w-4 h-4 mr-1" />
                {editingId ? 'Update' : 'Create'} Reward
              </button>
            </div>
          </form>
        </div>
      )}
      
      {rewards.length === 0 ? (
        <div className="text-center py-10">
          <Gift className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-bold">No Rewards Available</h3>
          <p className="text-base-content/70">
            Create rewards for users to redeem with their eco points
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Reward</th>
                <th>Category</th>
                <th>Points</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map(reward => (
                <tr key={reward._id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded">
                          <img 
                            src={reward.image || "/gift-placeholder.png"} 
                            alt={reward.name}
                            onError={(e) => { e.target.src = "/avatar.png" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{reward.name}</div>
                        <div className="text-xs text-base-content/70 line-clamp-1">
                          {reward.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge">
                      {getCategoryLabel(reward.category)}
                    </span>
                  </td>
                  <td className="font-semibold">
                    {reward.pointCost} pts
                  </td>
                  <td>
                    {!reward.available ? (
                      <span className="badge badge-outline badge-error">Unavailable</span>
                    ) : reward.quantity === -1 ? (
                      <span className="badge badge-outline badge-success">Unlimited</span>
                    ) : reward.quantity === 0 ? (
                      <span className="badge badge-outline badge-error">Out of Stock</span>
                    ) : (
                      <span className="badge badge-outline badge-success">
                        {reward.quantity} left
                      </span>
                    )}
                    {reward.expiresAt && (
                      <div className="text-xs text-base-content/70 mt-1">
                        Expires: {format(new Date(reward.expiresAt), 'MMM d, yyyy')}
                      </div>
                    )}
                    {reward.redemptions?.length > 0 && (
                      <div className="text-xs mt-1">
                        {reward.redemptions.length} redemptions
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(reward)}
                        className="btn btn-xs btn-ghost"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(reward._id)}
                        className="btn btn-xs btn-error btn-ghost"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRewardManager;
