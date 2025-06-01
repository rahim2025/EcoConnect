import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  ArrowLeft, Heart, Share2, Flag, MapPin, Eye, Clock, 
  Star, Leaf, MessageCircle, DollarSign, Phone, Mail,
  Edit, Trash2, CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const MarketplaceItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { 
    selectedItem, 
    getMarketplaceItem, 
    toggleFavorite, 
    makeOffer, 
    respondToOffer,
    markAsSold,
    deleteMarketplaceItem,
    isLoading 
  } = useMarketplaceStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  useEffect(() => {
    if (id) {
      getMarketplaceItem(id);
    }
  }, [id, getMarketplaceItem]);

  const handleToggleFavorite = async () => {
    if (!authUser || !selectedItem) return;
    try {
      await toggleFavorite(selectedItem._id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error("Please enter a valid offer amount");
      return;
    }

    setIsSubmittingOffer(true);
    try {
      await makeOffer(selectedItem._id, {
        amount: parseFloat(offerAmount),
        message: offerMessage
      });
      setShowOfferModal(false);
      setOfferAmount("");
      setOfferMessage("");
      toast.success("Offer submitted successfully!");
    } catch (error) {
      console.error("Error submitting offer:", error);
    } finally {
      setIsSubmittingOffer(false);
    }
  };
  const handleRespondToOffer = async (offerId, action) => {
    try {
      const result = await respondToOffer(selectedItem._id, offerId, action);
      
      // If offer is accepted, the item status changes to 'pending'
      // Show success message and refresh the item data
      if (action === 'accept') {
        toast.success('Offer accepted! Item is now pending sale.');
        // Refresh the item to get updated status
        await getMarketplaceItem(selectedItem._id);
      }
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
    }
  };

  const handleMarkAsSold = async () => {
    if (!confirm("Are you sure you want to mark this item as sold?")) return;
    
    try {
      await markAsSold(selectedItem._id);
      toast.success("Item marked as sold!");
    } catch (error) {
      console.error("Error marking as sold:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      await deleteMarketplaceItem(selectedItem._id);
      navigate("/marketplace");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedItem.title,
        text: selectedItem.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <p className="mb-4">The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/marketplace" className="btn btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = authUser?._id === selectedItem.seller?._id;
  const isFavorited = selectedItem.favoriteBy?.includes(authUser?._id);
  const userOffer = selectedItem.offers?.find(offer => 
    offer.buyer._id === authUser?._id && offer.status === 'pending'
  );

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

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedItem.title}</h1>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <MapPin className="w-4 h-4" />
              {selectedItem.location}
              <span>•</span>
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(selectedItem.createdAt), { addSuffix: true })}
              <span>•</span>
              <Eye className="w-4 h-4" />
              {selectedItem.views} views
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`btn btn-circle ${isFavorited ? 'btn-primary' : 'btn-outline'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="btn btn-circle btn-outline">
              <Share2 className="w-5 h-5" />
            </button>
            {isOwner && (
              <>
                <Link 
                  to={`/marketplace/items/${selectedItem._id}/edit`}
                  className="btn btn-circle btn-outline"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button 
                  onClick={handleDelete}
                  className="btn btn-circle btn-outline btn-error"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card bg-base-100 shadow-sm">
              <figure className="relative">
                <img
                  src={selectedItem.images?.[currentImageIndex] || "/api/placeholder/600/400"}
                  alt={selectedItem.title}
                  className="w-full h-96 object-cover"
                />
                
                {/* Image Navigation */}
                {selectedItem.images?.length > 1 && (
                  <>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-2">
                        {selectedItem.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {currentImageIndex > 0 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-sm bg-black/50 text-white border-none hover:bg-black/70"
                      >
                        ←
                      </button>
                    )}
                    
                    {currentImageIndex < selectedItem.images.length - 1 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-sm bg-black/50 text-white border-none hover:bg-black/70"
                      >
                        →
                      </button>
                    )}
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {selectedItem.isFeatured && (
                    <div className="badge badge-warning gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  {selectedItem.isEcoFriendly && (
                    <div className="badge badge-success gap-1">
                      <Leaf className="w-3 h-3" />
                      Eco-Friendly
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="absolute top-4 right-4">
                  <span className={`badge ${
                    selectedItem.status === 'available' ? 'badge-success' :
                    selectedItem.status === 'pending' ? 'badge-warning' :
                    selectedItem.status === 'sold' ? 'badge-error' : 'badge-neutral'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>
              </figure>

              {/* Thumbnail Row */}
              {selectedItem.images?.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedItem.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${selectedItem.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">Description</h2>
                <p className="whitespace-pre-wrap">{selectedItem.description}</p>

                {/* Tags */}
                {selectedItem.tags?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map(tag => (
                        <span key={tag} className="badge badge-outline">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eco Features */}
                {selectedItem.ecoFeatures?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      Eco Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ecoFeatures.map(feature => (
                        <span key={feature} className="badge badge-success badge-outline">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Options */}
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Delivery Options</h3>
                  <div className="flex gap-4 text-sm">
                    {selectedItem.shippingOptions?.pickup && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Local pickup
                      </span>
                    )}
                    {selectedItem.shippingOptions?.delivery && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Local delivery
                      </span>
                    )}
                    {selectedItem.shippingOptions?.shipping && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Shipping available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller's Other Items */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">More from this seller</h2>
                <p className="text-sm text-base-content/70">
                  <Link 
                    to={`/marketplace?seller=${selectedItem.seller._id}`}
                    className="link link-primary"
                  >
                    View all listings from {selectedItem.seller.fullName}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Info */}
          <div className="space-y-6">
            {/* Price and Actions */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary">
                    ${selectedItem.price}
                  </span>
                  <span className={`badge ${getConditionColor(selectedItem.condition)}`}>
                    {selectedItem.condition}
                  </span>
                </div>

                {/* Action Buttons */}
                {!isOwner && selectedItem.status === 'available' && (
                  <div className="space-y-3">
                    {selectedItem.allowOffers && !userOffer && (
                      <button
                        onClick={() => setShowOfferModal(true)}
                        className="btn btn-outline w-full gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Make Offer
                      </button>
                    )}
                    
                    {userOffer && (
                      <div className="alert alert-info">
                        <span>You have a pending offer of ${userOffer.amount}</span>
                      </div>
                    )}

                    <Link
                      to={`/chat?user=${selectedItem.seller._id}`}
                      className="btn btn-primary w-full gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Seller
                    </Link>
                  </div>
                )}

                {isOwner && (
                  <div className="space-y-3">
                    {selectedItem.status === 'available' && (
                      <button
                        onClick={handleMarkAsSold}
                        className="btn btn-success w-full"
                      >
                        Mark as Sold
                      </button>
                    )}
                    <Link
                      to={`/marketplace/items/${selectedItem._id}/edit`}
                      className="btn btn-outline w-full"
                    >
                      Edit Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg">Seller Information</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img 
                        src={selectedItem.seller.profilePic || "/api/placeholder/48/48"} 
                        alt={selectedItem.seller.fullName}
                      />
                    </div>
                  </div>
                  <div>
                    <Link 
                      to={`/profile/${selectedItem.seller._id}`}
                      className="font-medium link link-primary"
                    >
                      {selectedItem.seller.fullName}
                    </Link>
                    <p className="text-sm text-base-content/70 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedItem.seller.location || selectedItem.location}
                    </p>
                  </div>
                </div>

                {/* Contact Options */}
                {!isOwner && (
                  <div className="space-y-2">
                    {selectedItem.contactPreferences?.showEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-base-content/70" />
                        <span className="text-sm">{selectedItem.seller.email}</span>
                      </div>
                    )}
                    {selectedItem.contactPreferences?.showPhone && selectedItem.seller.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-base-content/70" />
                        <span className="text-sm">{selectedItem.seller.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Offers (for seller only) */}
            {isOwner && selectedItem.offers?.length > 0 && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg">
                    Offers ({selectedItem.offers.filter(o => o.status === 'pending').length} pending)
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedItem.offers
                      .filter(offer => offer.status === 'pending')
                      .map(offer => (
                        <div key={offer._id} className="border border-base-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">${offer.amount}</p>
                              <p className="text-sm text-base-content/70">
                                from {offer.buyer.fullName}
                              </p>
                              <p className="text-xs text-base-content/50">
                                {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          {offer.message && (
                            <p className="text-sm mb-3 bg-base-200 p-2 rounded">
                              "{offer.message}"
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespondToOffer(offer._id, 'accept')}
                              className="btn btn-success btn-sm flex-1"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToOffer(offer._id, 'reject')}
                              className="btn btn-outline btn-sm flex-1"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Make an Offer</h3>
              
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Offer Amount ($)</span>
                  </label>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Enter your offer"
                    min="0"
                    step="0.01"
                    className="input input-bordered w-full"
                    required
                  />
                  <p className="text-sm text-base-content/70 mt-1">
                    Asking price: ${selectedItem.price}
                  </p>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Message (optional)</span>
                  </label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Add a message to your offer..."
                    className="textarea textarea-bordered w-full"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingOffer}
                    className="btn btn-primary flex-1"
                  >
                    {isSubmittingOffer ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Submit Offer"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceItemDetailPage;
