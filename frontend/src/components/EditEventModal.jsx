import { useState, useEffect } from 'react';
import { useEventStore } from '../store/useEventStore';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Image as ImageIcon, 
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditEventModal = ({ event, onClose }) => {
  // Format date and time from ISO string
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    
    const formattedDate = date.toISOString().split('T')[0];
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    return { formattedDate, formattedTime };
  };
  
  const { formattedDate, formattedTime } = formatDateTime(event.date);
  
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    date: formattedDate,
    time: formattedTime,
    category: event.category,
    maxParticipants: event.maxParticipants,
    status: event.status,
    image: event.image || null
  });
  
  const [imagePreview, setImagePreview] = useState(event.image || null);
  const [imageChanged, setImageChanged] = useState(false);
  
  const { updateEvent, loading } = useEventStore();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData({ ...formData, image: e.target.result });
        setImageChanged(true);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Combine date and time
    let dateTime = null;
    if (formData.date && formData.time) {
      dateTime = new Date(`${formData.date}T${formData.time}`);
    }
    
    if (!dateTime || dateTime.toString() === 'Invalid Date') {
      toast.error('Please select a valid date and time');
      return;
    }
    
    const updateData = {
      ...formData,
      date: dateTime,
      maxParticipants: Number(formData.maxParticipants) || 0
    };
    
    // Only include image if it was changed
    if (!imageChanged) {
      delete updateData.image;
    }
    
    const success = await updateEvent(event._id, updateData);
    
    if (success) {
      onClose();
    }
  };
  
  const categoryOptions = [
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'recycling', label: 'Recycling' },
    { value: 'tree-planting', label: 'Tree Planting' },
    { value: 'conservation', label: 'Conservation' },
    { value: 'education', label: 'Education' },
    { value: 'energy', label: 'Energy' },
    { value: 'other', label: 'Other' }
  ];
  
  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-xl flex items-center">
          <CalendarDays className="w-6 h-6 mr-2 text-primary" />
          Edit Event: {event.title}
        </h3>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Event Title*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title" 
                className="input input-bordered w-full"
                required 
              />
            </div>
            
            {/* Location */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Location*</span>
              </label>
              <div className="input-group">
                <span className="btn btn-square btn-ghost">
                  <MapPin className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter the event location" 
                  className="input input-bordered w-full"
                  required 
                />
              </div>
            </div>
            
            {/* Date & Time */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Date*</span>
              </label>
              <input 
                type="date" 
                name="date" 
                value={formData.date}
                onChange={handleChange}
                className="input input-bordered w-full"
                required 
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Time*</span>
              </label>
              <input 
                type="time" 
                name="time" 
                value={formData.time}
                onChange={handleChange}
                className="input input-bordered w-full"
                required 
              />
            </div>
            
            {/* Category & Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Category*</span>
              </label>
              <select 
                name="category" 
                value={formData.category}
                onChange={handleChange}
                className="select select-bordered w-full" 
                required
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Status*</span>
              </label>
              <select 
                name="status" 
                value={formData.status}
                onChange={handleChange}
                className="select select-bordered w-full" 
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Max Participants */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Maximum Participants</span>
                <span className="label-text-alt">(0 = unlimited)</span>
              </label>
              <div className="input-group">
                <input 
                  type="number" 
                  name="maxParticipants" 
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="0"
                  className="input input-bordered w-full"
                />
                <span className="btn btn-square btn-ghost">
                  <Users className="w-5 h-5" />
                </span>
              </div>
            </div>
            
            {/* Description */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Description*</span>
              </label>
              <textarea 
                name="description" 
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your eco-friendly event in detail" 
                className="textarea textarea-bordered w-full h-32"
                required
              ></textarea>
            </div>
            
            {/* Image Upload */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Event Image</span>
                <span className="label-text-alt">(Optional)</span>
              </label>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-base-content/20 rounded-lg p-6">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Event preview" 
                      className="max-h-64 mx-auto rounded-md"
                    />
                    <button 
                      type="button"
                      className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                        setImageChanged(true);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <ImageIcon className="w-16 h-16 text-base-content/30" />
                    <p className="text-sm text-base-content/70">
                      Drag & drop an image or click to browse
                    </p>
                    <input 
                      type="file" 
                      className="file-input file-input-bordered w-full max-w-xs" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-action mt-8">
            <button 
              type="button"
              className="btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default EditEventModal;
