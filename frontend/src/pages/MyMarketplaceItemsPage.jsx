import React, { useEffect, useState } from 'react';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { useAuthStore } from '../store/useAuthStore';
import MarketplaceItemCard from '../components/MarketplaceItemCard';
import CreateMarketplaceItemModal from '../components/CreateMarketplaceItemModal';
import { Plus, Grid3X3, List, Search, Filter, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const MyMarketplaceItemsPage = () => {
  const { authUser } = useAuthStore();
  const { 
    items, 
    isLoading, 
    fetchMyItems, 
    deleteItem,
    setViewMode,
    viewMode 
  } = useMarketplaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (authUser) {
      fetchMyItems();
    }
  }, [authUser, fetchMyItems]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        toast.success('Item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingItem(null);
  };

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
            <h1 className="text-3xl font-bold mb-2">My Items</h1>
            <p className="text-base-content/70">
              Manage your marketplace listings
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary mt-4 md:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            List New Item
          </button>
        </div>

        {/* Filters and Search */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search your items..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                className="select select-bordered w-full lg:w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>

              {/* View Mode Toggle */}
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Total Items</div>
            <div className="stat-value text-primary">{items.length}</div>
          </div>
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Available</div>
            <div className="stat-value text-success">
              {items.filter(item => item.status === 'available').length}
            </div>
          </div>
          <div className="stat bg-base-100 rounded-box shadow">
            <div className="stat-title">Sold</div>
            <div className="stat-value text-warning">
              {items.filter(item => item.status === 'sold').length}
            </div>
          </div>
        </div>

        {/* Items Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2">No items found</h3>
            <p className="text-base-content/70 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by listing your first item in the marketplace'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                List Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredItems.map((item) => (
              <div key={item._id} className="relative group">
                <MarketplaceItemCard item={item} viewMode={viewMode} />
                
                {/* Action Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-sm btn-circle bg-base-100/80 border-0">
                      <MoreVertical className="w-4 h-4" />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <a href={`/marketplace/${item._id}`}>
                          <Eye className="w-4 h-4" />
                          View Details
                        </a>
                      </li>
                      <li>
                        <button onClick={() => handleEditItem(item)}>
                          <Edit2 className="w-4 h-4" />
                          Edit Item
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Item
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <CreateMarketplaceItemModal
          isOpen={isCreateModalOpen}
          onClose={handleModalClose}
          editItem={editingItem}
        />
      </div>
    </div>
  );
};

export default MyMarketplaceItemsPage;
