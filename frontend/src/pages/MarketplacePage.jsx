import { useState, useEffect, useCallback } from "react";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { Search, Filter, Plus, Grid, List, Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import CreateMarketplaceItemModal from "../components/CreateMarketplaceItemModal";
import MarketplaceItemCard from "../components/MarketplaceItemCard";
import MarketplaceFilters from "../components/MarketplaceFilters";

const MarketplacePage = () => {
  const {
    items,
    categories,
    stats,
    isLoading,
    filters,
    pagination,
    getMarketplaceItems,
    getCategories,
    getMarketplaceStats,
    setFilters,
    searchItems
  } = useMarketplaceStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');  useEffect(() => {
    // Reset and fetch fresh data on component mount
    getMarketplaceItems(1, true); // Reset items on initial load
    getCategories();
    getMarketplaceStats();
  }, []); // Empty dependency array since we want this to run only once on mount
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchItems(searchTerm);
    } else {
      await getMarketplaceItems(1, true); // Reset on empty search
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    await getMarketplaceItems(1, true); // Reset when filters change
  };
  const loadMore = async () => {
    if (pagination?.hasMore) {
      await getMarketplaceItems((pagination?.currentPage || 0) + 1, false);
    }
  };

  const handleItemCreated = async () => {
    // Refresh the marketplace items when a new item is created
    await getMarketplaceItems(1, true);
    setShowCreateModal(false);
  };

  const quickFilters = [
    { label: "All Items", value: "all" },
    { label: "Eco-Friendly", value: "eco" },
    { label: "Featured", value: "featured" },
    { label: "Electronics", value: "electronics" },
    { label: "Clothing", value: "clothing" },
    { label: "Home & Garden", value: "home-garden" }
  ];

  const handleQuickFilter = (value) => {
    let newFilters = { ...filters };
    
    switch (value) {
      case "all":
        newFilters = { ...filters, category: 'all', ecoFriendly: false, featured: false };
        break;
      case "eco":
        newFilters = { ...filters, ecoFriendly: true, category: 'all', featured: false };
        break;
      case "featured":
        newFilters = { ...filters, featured: true, category: 'all', ecoFriendly: false };
        break;
      default:
        newFilters = { ...filters, category: value, ecoFriendly: false, featured: false };
    }
    
    handleFilterChange(newFilters);
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🛒 EcoMarketplace</h1>
            <p className="text-base-content/70">
              Buy and sell eco-friendly items in your community
            </p>
              {/* Stats */}
            {stats?.totalItems && (
              <div className="flex gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {stats.totalItems} active listings
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {stats.ecoFriendlyPercentage}% eco-friendly
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {stats.soldItems} items sold
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4 lg:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              List Item
            </button>
            <Link to="/marketplace/my-items" className="btn btn-outline gap-2">
              My Listings
            </Link>
            <Link to="/marketplace/favorites" className="btn btn-outline gap-2">
              <Heart className="w-4 h-4" />
              Favorites
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card bg-base-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>

            {/* View Mode & Filter Toggle */}
            <div className="flex gap-2">
              <div className="btn-group">
                <button
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm gap-2 ${showFilters ? 'btn-active' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleQuickFilter(filter.value)}
                className={`btn btn-sm ${
                  (filter.value === 'all' && filters.category === 'all' && !filters.ecoFriendly && !filters.featured) ||
                  (filter.value === 'eco' && filters.ecoFriendly) ||
                  (filter.value === 'featured' && filters.featured) ||
                  filters.category === filter.value
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <MarketplaceFilters
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-base-content/70">
            {pagination?.totalItems || 0} items found
          </p>
          
          <div className="flex items-center gap-2 text-sm">
            <span>Sort by:</span>
            <select
              className="select select-sm select-bordered"
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                handleFilterChange({ ...filters, sortBy, sortOrder });
              }}
            >
              <option value="createdAt_desc">Newest first</option>
              <option value="createdAt_asc">Oldest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views_desc">Most viewed</option>
            </select>
          </div>
        </div>

        {/* Items Grid/List */}
        {isLoading && items.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-base-content/70 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              List the first item
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "space-y-4"
            }>
              {items.map((item) => (
                <MarketplaceItemCard
                  key={item._id}
                  item={item}
                  viewMode={viewMode}
                />
              ))}
            </div>            {/* Load More */}
            {pagination?.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="btn btn-outline"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>      {/* Create Item Modal */}
      {showCreateModal && (
        <CreateMarketplaceItemModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleItemCreated}
        />
      )}
    </div>
  );
};

export default MarketplacePage;
