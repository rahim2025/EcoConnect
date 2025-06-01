import React, { useEffect, useState } from 'react';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { useAuthStore } from '../store/useAuthStore';
import MarketplaceItemCard from '../components/MarketplaceItemCard';
import MarketplaceFilters from '../components/MarketplaceFilters';
import { Heart, Grid3X3, List, Search, Filter } from 'lucide-react';

const FavoritesPage = () => {
  const { authUser } = useAuthStore();
  const { 
    favorites, 
    isLoading, 
    fetchFavorites,
    setViewMode,
    viewMode,
    filters,
    setFilters 
  } = useMarketplaceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (authUser) {
      fetchFavorites();
    }
  }, [authUser, fetchFavorites]);

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply filters
    let matchesFilters = true;
    
    if (filters.category && filters.category !== 'all') {
      matchesFilters = matchesFilters && item.category === filters.category;
    }
    
    if (filters.condition && filters.condition !== 'all') {
      matchesFilters = matchesFilters && item.condition === filters.condition;
    }
    
    if (filters.minPrice) {
      matchesFilters = matchesFilters && item.price >= filters.minPrice;
    }
    
    if (filters.maxPrice) {
      matchesFilters = matchesFilters && item.price <= filters.maxPrice;
    }
    
    if (filters.ecoFriendly) {
      matchesFilters = matchesFilters && item.isEcoFriendly;
    }
    
    if (filters.location) {
      matchesFilters = matchesFilters && item.location.toLowerCase().includes(filters.location.toLowerCase());
    }

    return matchesSearch && matchesFilters;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500 fill-current" />
              My Favorites
            </h1>
            <p className="text-base-content/70">
              Items you've saved for later
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-active' : 'btn-outline'}`}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
            <div className="join">
              <button
                className={`btn join-item ${viewMode === 'grid' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                className={`btn join-item ${viewMode === 'list' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Search your favorites..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <MarketplaceFilters />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Total Favorites</div>
            <div className="stat-value text-primary">{favorites.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Available Items</div>
            <div className="stat-value text-success">
              {favorites.filter(item => item.status === 'available').length}
            </div>
          </div>
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Eco-Friendly</div>
            <div className="stat-value text-green-600">
              {favorites.filter(item => item.isEcoFriendly).length}
            </div>
          </div>
        </div>

        {/* Favorites Grid/List */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💚</div>
            <h3 className="text-2xl font-bold mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No items match your search'}
            </h3>
            <p className="text-base-content/70 mb-6">
              {favorites.length === 0 
                ? 'Start exploring the marketplace and save items you love'
                : 'Try adjusting your search or filters to find more items'
              }
            </p>
            {favorites.length === 0 && (
              <a href="/marketplace" className="btn btn-primary">
                Explore Marketplace
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-base-content/70">
                Showing {filteredFavorites.length} of {favorites.length} favorite items
              </p>
            </div>

            {/* Items Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredFavorites.map((item) => (
                <MarketplaceItemCard 
                  key={item._id} 
                  item={item} 
                  viewMode={viewMode}
                  showFavoriteButton={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
