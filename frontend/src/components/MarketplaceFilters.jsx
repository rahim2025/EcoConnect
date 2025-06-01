import { useState } from "react";
import { X, DollarSign, MapPin, RotateCcw } from "lucide-react";

const MarketplaceFilters = ({ filters, categories, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const conditionOptions = [
    { value: "", label: "All Conditions" },
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" }
  ];

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'all',
      condition: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ecoFriendly: false,
      featured: false
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value !== '' && value !== 'all' && value !== 'createdAt' && value !== 'desc';
    return false;
  });

  return (
    <div className="card bg-base-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Advanced Filters</h3>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="btn btn-sm btn-ghost gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Category */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Category</span>
          </label>
          <select
            value={localFilters.category}
            onChange={(e) => handleLocalFilterChange('category', e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Condition</span>
          </label>
          <select
            value={localFilters.condition}
            onChange={(e) => handleLocalFilterChange('condition', e.target.value)}
            className="select select-bordered w-full"
          >
            {conditionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Location</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
            <input
              type="text"
              value={localFilters.location}
              onChange={(e) => handleLocalFilterChange('location', e.target.value)}
              placeholder="City, State"
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>

        {/* Min Price */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Min Price</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
            <input
              type="number"
              value={localFilters.minPrice}
              onChange={(e) => handleLocalFilterChange('minPrice', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Max Price</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
            <input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) => handleLocalFilterChange('maxPrice', e.target.value)}
              placeholder="No limit"
              min="0"
              step="0.01"
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Sort By</span>
          </label>
          <select
            value={`${localFilters.sortBy}_${localFilters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              handleLocalFilterChange('sortBy', sortBy);
              handleLocalFilterChange('sortOrder', sortOrder);
            }}
            className="select select-bordered w-full"
          >
            <option value="createdAt_desc">Newest first</option>
            <option value="createdAt_asc">Oldest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="views_desc">Most viewed</option>
            <option value="title_asc">Title: A to Z</option>
            <option value="title_desc">Title: Z to A</option>
          </select>
        </div>
      </div>

      {/* Special Filters */}
      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.ecoFriendly}
            onChange={(e) => handleLocalFilterChange('ecoFriendly', e.target.checked)}
            className="checkbox checkbox-success"
          />
          <span className="flex items-center gap-2">
            <span className="text-green-500">🌱</span>
            <span className="font-medium">Eco-friendly items only</span>
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.featured}
            onChange={(e) => handleLocalFilterChange('featured', e.target.checked)}
            className="checkbox checkbox-warning"
          />
          <span className="flex items-center gap-2">
            <span className="text-yellow-500">⭐</span>
            <span className="font-medium">Featured items only</span>
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApply}
          className="btn btn-primary flex-1"
        >
          Apply Filters
        </button>
        <button
          onClick={onClose}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-base-100 rounded-lg">
          <p className="text-sm font-medium mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {localFilters.category !== 'all' && (
              <span className="badge badge-outline">
                Category: {categories.find(c => c.value === localFilters.category)?.label || localFilters.category}
              </span>
            )}
            {localFilters.condition && (
              <span className="badge badge-outline">
                Condition: {localFilters.condition}
              </span>
            )}
            {localFilters.location && (
              <span className="badge badge-outline">
                Location: {localFilters.location}
              </span>
            )}
            {localFilters.minPrice && (
              <span className="badge badge-outline">
                Min: ${localFilters.minPrice}
              </span>
            )}
            {localFilters.maxPrice && (
              <span className="badge badge-outline">
                Max: ${localFilters.maxPrice}
              </span>
            )}
            {localFilters.ecoFriendly && (
              <span className="badge badge-success badge-outline">
                Eco-friendly
              </span>
            )}
            {localFilters.featured && (
              <span className="badge badge-warning badge-outline">
                Featured
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceFilters;
