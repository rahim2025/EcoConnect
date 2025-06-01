import { useState, useEffect } from "react";
import { X, Upload, MapPin, DollarSign, Tag, Leaf, Image as ImageIcon } from "lucide-react";
import { useMarketplaceStore } from "../store/useMarketplaceStore";

const CreateMarketplaceItemModal = ({ isOpen, onClose, editItem = null, onSuccess }) => {
  const { createMarketplaceItem, updateMarketplaceItem, categories, getCategories, isCreating, isUpdating } = useMarketplaceStore();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    isEcoFriendly: false,
    ecoFeatures: [],
    allowOffers: true,
    tags: [],
    shippingOptions: {
      pickup: true,
      delivery: false,
      shipping: false
    },
    contactPreferences: {
      showPhone: false,
      showEmail: true,
      messagesOnly: false
    }
  });

  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  const ecoFeaturesOptions = [
    "recycled", "organic", "biodegradable", "energy-efficient", "sustainable", "upcycled"
  ];

  const conditionOptions = [
    { value: "new", label: "New", description: "Brand new, never used" },
    { value: "like-new", label: "Like New", description: "Gently used, excellent condition" },
    { value: "good", label: "Good", description: "Used but well maintained" },
    { value: "fair", label: "Fair", description: "Shows wear but functional" },
    { value: "poor", label: "Poor", description: "Heavy wear, may need repair" }
  ];

  useEffect(() => {
    if (categories.length === 0) {
      getCategories();
    }
  }, [categories, getCategories]);

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title || "",
        description: editItem.description || "",
        price: editItem.price?.toString() || "",
        category: editItem.category || "",
        condition: editItem.condition || "",
        location: editItem.location || "",
        isEcoFriendly: editItem.isEcoFriendly || false,
        ecoFeatures: editItem.ecoFeatures || [],
        allowOffers: editItem.allowOffers !== false,
        tags: editItem.tags || [],
        shippingOptions: editItem.shippingOptions || {
          pickup: true,
          delivery: false,
          shipping: false
        },
        contactPreferences: editItem.contactPreferences || {
          showPhone: false,
          showEmail: true,
          messagesOnly: false
        }
      });
      setImages(editItem.images || []);
    }
  }, [editItem]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleEcoFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      ecoFeatures: prev.ecoFeatures.includes(feature)
        ? prev.ecoFeatures.filter(f => f !== feature)
        : [...prev.ecoFeatures, feature]
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.condition) newErrors.condition = "Condition is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (images.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const itemData = {
        ...formData,
        images,
        price: parseFloat(formData.price)
      };

      if (editItem) {
        await updateMarketplaceItem(editItem._id, itemData);
      } else {
        await createMarketplaceItem(itemData);
      }
      
      onClose();
      resetForm();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "",
      location: "",
      isEcoFriendly: false,
      ecoFeatures: [],
      allowOffers: true,
      tags: [],
      shippingOptions: {
        pickup: true,
        delivery: false,
        shipping: false
      },
      contactPreferences: {
        showPhone: false,
        showEmail: true,
        messagesOnly: false
      }
    });
    setImages([]);
    setTagInput("");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-base-200">
          <h2 className="text-2xl font-bold">
            {editItem ? "Edit Listing" : "Create New Listing"}
          </h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-medium">Title *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter item title"
                className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                maxLength={100}
              />
              {errors.title && <span className="text-error text-sm">{errors.title}</span>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Price * ($)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`input input-bordered w-full pl-10 ${errors.price ? 'input-error' : ''}`}
                />
              </div>
              {errors.price && <span className="text-error text-sm">{errors.price}</span>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Category *</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <span className="text-error text-sm">{errors.category}</span>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Condition *</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className={`select select-bordered w-full ${errors.condition ? 'select-error' : ''}`}
              >
                <option value="">Select condition</option>
                {conditionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              {errors.condition && <span className="text-error text-sm">{errors.condition}</span>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Location *</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  className={`input input-bordered w-full pl-10 ${errors.location ? 'input-error' : ''}`}
                />
              </div>
              {errors.location && <span className="text-error text-sm">{errors.location}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Description *</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item in detail..."
              className={`textarea textarea-bordered w-full h-32 ${errors.description ? 'textarea-error' : ''}`}
              maxLength={1000}
            />
            <div className="flex justify-between">
              {errors.description && <span className="text-error text-sm">{errors.description}</span>}
              <span className="text-sm text-base-content/50">
                {formData.description.length}/1000
              </span>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Images * (Max 6)</span>
            </label>
            <div className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 6}
              />
              <label
                htmlFor="image-upload"
                className={`btn btn-outline gap-2 ${images.length >= 6 ? 'btn-disabled' : 'cursor-pointer'}`}
              >
                <Upload className="w-4 h-4" />
                Upload Images
              </label>
              <p className="text-sm text-base-content/50 mt-2">
                {images.length}/6 images uploaded
              </p>
            </div>
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.images && <span className="text-error text-sm">{errors.images}</span>}
          </div>

          {/* Eco-Friendly Features */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="isEcoFriendly"
                checked={formData.isEcoFriendly}
                onChange={handleInputChange}
                className="checkbox checkbox-success"
              />
              <span className="label-text font-medium flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-500" />
                This is an eco-friendly item
              </span>
            </div>
            
            {formData.isEcoFriendly && (
              <div>
                <label className="label">
                  <span className="label-text">Eco Features</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ecoFeaturesOptions.map(feature => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleEcoFeature(feature)}
                      className={`btn btn-sm ${
                        formData.ecoFeatures.includes(feature) 
                          ? 'btn-success' 
                          : 'btn-outline'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="label">
              <span className="label-text font-medium">Tags</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                placeholder="Add tags..."
                className="input input-bordered flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-outline"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="badge badge-outline gap-2">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-error"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Options */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Shipping Options</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.shippingOptions.pickup}
                    onChange={(e) => handleNestedChange('shippingOptions', 'pickup', e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Local pickup</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.shippingOptions.delivery}
                    onChange={(e) => handleNestedChange('shippingOptions', 'delivery', e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Local delivery</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.shippingOptions.shipping}
                    onChange={(e) => handleNestedChange('shippingOptions', 'shipping', e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Shipping available</span>
                </label>
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Contact Preferences</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.contactPreferences.showEmail}
                    onChange={(e) => handleNestedChange('contactPreferences', 'showEmail', e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Show email address</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.contactPreferences.showPhone}
                    onChange={(e) => handleNestedChange('contactPreferences', 'showPhone', e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Show phone number</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.contactPreferences.messagesOnly}
                    onChange={(e) => handleNestedChange('contactPreferences', 'messagesOnly', e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span>Messages only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Other Options */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="allowOffers"
                checked={formData.allowOffers}
                onChange={handleInputChange}
                className="checkbox checkbox-primary"
              />
              <span className="label-text">Allow offers from buyers</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="btn btn-primary flex-1"
            >
              {(isCreating || isUpdating) ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                editItem ? "Update Listing" : "Create Listing"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMarketplaceItemModal;
