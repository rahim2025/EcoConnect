import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Eye, Star, Clock, Leaf, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatDistanceToNow } from "date-fns";

const MarketplaceItemCard = ({ item, viewMode = 'grid' }) => {
  const { authUser } = useAuthStore();
  const { toggleFavorite, deleteMarketplaceItem } = useMarketplaceStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFavorited = item.favoriteBy?.includes(authUser?._id);
  const isOwner = authUser?._id === item.seller?._id;

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authUser) return;
    
    try {
      await toggleFavorite(item._id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    setIsDeleting(true);
    try {
      await deleteMarketplaceItem(item._id);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'badge-success',
      'like-new': 'badge-info',
      'good': 'badge-warning',
      'fair': 'badge-warning',
      'poor': 'badge-error'
    };
    return colors[condition] || 'badge-neutral';
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'text-green-600',
      'pending': 'text-yellow-600',
      'sold': 'text-red-600',
      'removed': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/marketplace/items/${item._id}`} className="block">
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
          <div className="card-body p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <img
                  src={item.images?.[0] || "/api/placeholder/200/200"}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
                {item.isFeatured && (
                  <div className="absolute top-1 left-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                    <p className="text-2xl font-bold text-primary">${item.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.isEcoFriendly && (
                      <div className="tooltip tooltip-top" data-tip="Eco-friendly">
                        <Leaf className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    
                    <button
                      onClick={handleToggleFavorite}
                      className={`btn btn-sm btn-circle ${isFavorited ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>

                    {isOwner && (
                      <div className="dropdown dropdown-end">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                          }}
                          className="btn btn-sm btn-circle btn-ghost"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {isMenuOpen && (
                          <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                            <li>
                              <Link to={`/marketplace/items/${item._id}/edit`} className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                            </li>
                            <li>
                              <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="gap-2 text-error"
                              >
                                {isDeleting ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                Delete
                              </button>
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-base-content/70 line-clamp-2 mb-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`badge badge-sm ${getConditionColor(item.condition)}`}>
                    {item.condition}
                  </span>
                  <span className="badge badge-sm badge-outline">{item.category}</span>
                  {item.ecoFeatures?.map((feature) => (
                    <span key={feature} className="badge badge-sm badge-success badge-outline">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-base-content/60">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <span className={`font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link to={`/marketplace/items/${item._id}`} className="block">
      <div className="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200 border border-base-200 h-full">
        {/* Image */}
        <figure className="relative">
          <img
            src={item.images?.[0] || "/api/placeholder/300/200"}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {item.isFeatured && (
              <div className="badge badge-warning badge-sm gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </div>
            )}
            {item.isEcoFriendly && (
              <div className="badge badge-success badge-sm gap-1">
                <Leaf className="w-3 h-3" />
                Eco
              </div>
            )}
          </div>

          {/* Status */}
          <div className="absolute top-2 right-2">
            <span className={`badge badge-sm ${
              item.status === 'available' ? 'badge-success' :
              item.status === 'pending' ? 'badge-warning' :
              item.status === 'sold' ? 'badge-error' : 'badge-neutral'
            }`}>
              {item.status}
            </span>
          </div>

          {/* Favorite & Menu */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              onClick={handleToggleFavorite}
              className={`btn btn-sm btn-circle ${
                isFavorited ? 'btn-primary' : 'btn-ghost bg-white/80 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {isOwner && (
              <div className="dropdown dropdown-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="btn btn-sm btn-circle btn-ghost bg-white/80 hover:bg-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                    <li>
                      <Link to={`/marketplace/items/${item._id}/edit`} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="gap-2 text-error"
                      >
                        {isDeleting ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </figure>

        <div className="card-body p-4">
          {/* Title and Price */}
          <div className="mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">{item.title}</h3>
            <p className="text-2xl font-bold text-primary">${item.price}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
            {item.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className={`badge badge-sm ${getConditionColor(item.condition)}`}>
              {item.condition}
            </span>
            {item.ecoFeatures?.slice(0, 2).map((feature) => (
              <span key={feature} className="badge badge-sm badge-success badge-outline">
                {feature}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-base-content/60 mt-auto">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{item.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {item.views}
              </span>
              {item.offerCount > 0 && (
                <span className="badge badge-sm badge-primary">
                  {item.offerCount} offers
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-base-content/50 mt-1">
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketplaceItemCard;
