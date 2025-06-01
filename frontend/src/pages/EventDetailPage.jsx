import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventStore } from '../store/useEventStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Edit,
  Trash2,
  ArrowLeft,
  Share2,
  CheckCircle,
  XCircle,
  Award,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import EditEventModal from '../components/EditEventModal';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  
  const { authUser } = useAuthStore();
  const { 
    currentEvent, 
    loading, 
    fetchEventById,
    joinEvent,
    leaveEvent,
    deleteEvent,
    completeEvent,
    formatEventDate
  } = useEventStore();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEventById(eventId);
  }, [fetchEventById, eventId]);
  
  if (loading || !currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-base-content/70">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  const eventDate = formatEventDate(currentEvent.date);
  const isOrganizer = currentEvent.organizer._id === authUser?._id;
  const isParticipant = currentEvent.participants.some(p => p._id === authUser?._id);
  const isPastEvent = new Date(currentEvent.date) < new Date();
  const isFull = currentEvent.maxParticipants > 0 && 
                currentEvent.participants.length >= currentEvent.maxParticipants;
  
  const handleJoinEvent = async () => {
    if (isPastEvent) {
      toast.error("Cannot join past events");
      return;
    }
    
    if (currentEvent.status === 'cancelled') {
      toast.error("Cannot join cancelled events");
      return;
    }
    
    if (isFull) {
      toast.error("This event is full");
      return;
    }
    
    await joinEvent(eventId);
  };
  
  const handleLeaveEvent = async () => {
    if (isPastEvent) {
      toast.error("Cannot leave past events");
      return;
    }
    
    if (isOrganizer) {
      toast.error("Organizers cannot leave their own events");
      return;
    }
    
    await leaveEvent(eventId);
  };
  
  const handleDeleteEvent = async () => {
    const success = await deleteEvent(eventId);
    if (success) {
      navigate('/events');
    }
  };
  
  const handleCompleteEvent = async () => {
    await completeEvent(eventId);
    setShowCompleteConfirm(false);
  };
  
  const handleShareEvent = () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: currentEvent.title,
        text: currentEvent.description,
        url: shareUrl,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };
  
  // Helper to get category badge color
  const getCategoryColor = (category) => {
    switch(category) {
      case 'cleanup': return 'badge-primary';
      case 'recycling': return 'badge-success';
      case 'tree-planting': return 'badge-accent';
      case 'conservation': return 'badge-info';
      case 'education': return 'badge-warning';
      case 'energy': return 'badge-secondary';
      default: return 'badge-ghost';
    }
  };
  
  // Helper to get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'badge-info';
      case 'ongoing': return 'badge-success';
      case 'completed': return 'badge-primary';
      case 'cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-8">
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/events')}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Header */}
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold">{currentEvent.title}</h1>
              
              <div className="flex gap-2">
                <span className={`badge ${getStatusColor(currentEvent.status)} badge-lg`}>
                  {currentEvent.status}
                </span>
                <span className={`badge ${getCategoryColor(currentEvent.category)} badge-lg`}>
                  {currentEvent.category.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span>{eventDate.full}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{currentEvent.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>
                  {currentEvent.participants.length} participant{currentEvent.participants.length !== 1 ? 's' : ''}
                  {currentEvent.maxParticipants > 0 && ` / ${currentEvent.maxParticipants} max`}
                </span>
              </div>
            </div>
            
            {/* Status banners */}
            {currentEvent.status === 'completed' && (
              <div className="alert alert-success mt-4">
                <CheckCircle className="w-5 h-5" />
                <span>This event has been completed. All participants earned {currentEvent.ecoPoints} eco points!</span>
              </div>
            )}
            
            {currentEvent.status === 'cancelled' && (
              <div className="alert alert-error mt-4">
                <XCircle className="w-5 h-5" />
                <span>This event has been cancelled.</span>
              </div>
            )}
            
            {currentEvent.status === 'upcoming' && isPastEvent && (
              <div className="alert alert-warning mt-4">
                <AlertTriangle className="w-5 h-5" />
                <span>This event date has passed but hasn't been marked as completed or cancelled.</span>
              </div>
            )}
          </div>
          
          {/* Event Image */}
          {currentEvent.image && (
            <div className="mb-8">
              <img 
                src={currentEvent.image} 
                alt={currentEvent.title} 
                className="w-full rounded-lg max-h-[400px] object-cover"
              />
            </div>
          )}
          
          {/* Event Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Event Description</h2>
            <div className="prose">
              <p className="whitespace-pre-line">{currentEvent.description}</p>
            </div>
          </div>
          
          {/* Event Points */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-lg">
              <Award className="w-6 h-6 text-primary" />
              <span>Participants earn {currentEvent.ecoPoints} eco points upon event completion.</span>
            </div>
          </div>
          
          {/* Participants Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Participants ({currentEvent.participants.length})</h2>
            
            <div className="flex flex-wrap gap-4">
              {currentEvent.participants.map((participant) => (
                <div 
                  key={participant._id} 
                  className="flex items-center gap-2 bg-base-200 p-2 rounded-lg"
                >
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img src={participant.profilePic} alt={participant.fullName} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{participant.fullName}</p>
                    {participant._id === currentEvent.organizer._id && (
                      <span className="badge badge-primary">Organizer</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <div className="card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">Event Actions</h2>
                
                {/* Join/Leave buttons */}
                {!isOrganizer && (
                  <>
                    {!isParticipant ? (
                      <button 
                        className="btn btn-primary"
                        onClick={handleJoinEvent}
                        disabled={isPastEvent || currentEvent.status === 'cancelled' || isFull}
                      >
                        <Users className="w-5 h-5" />
                        Join Event
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline btn-error"
                        onClick={handleLeaveEvent}
                        disabled={isPastEvent}
                      >
                        <XCircle className="w-5 h-5" />
                        Leave Event
                      </button>
                    )}
                    
                    {isFull && !isParticipant && (
                      <p className="text-sm text-error">This event is full.</p>
                    )}
                  </>
                )}
                
                {/* Organizer-only buttons */}
                {isOrganizer && (
                  <div className="space-y-3">
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit className="w-5 h-5" />
                      Edit Event
                    </button>
                    
                    {currentEvent.status === 'upcoming' && !isPastEvent && (
                      <button 
                        className="btn btn-outline w-full"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-5 h-5" />
                        Cancel Event
                      </button>
                    )}
                    
                    {(currentEvent.status === 'upcoming' || currentEvent.status === 'ongoing') && 
                     isPastEvent && (
                      <button 
                        className="btn btn-success w-full"
                        onClick={() => setShowCompleteConfirm(true)}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Mark as Completed
                      </button>
                    )}
                  </div>
                )}
                
                {/* Share Button (Everyone) */}
                <button 
                  className="btn btn-outline"
                  onClick={handleShareEvent}
                >
                  <Share2 className="w-5 h-5" />
                  Share Event
                </button>
                
                {/* Organizer Info */}
                <div className="divider"></div>
                <h3 className="font-bold">Organized by</h3>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full">
                      <img src={currentEvent.organizer.profilePic} alt={currentEvent.organizer.fullName} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{currentEvent.organizer.fullName}</p>
                    <button className="btn btn-ghost btn-xs">View Profile</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Event Modal */}
      {showEditModal && (
        <EditEventModal 
          event={currentEvent}
          onClose={() => setShowEditModal(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Cancel Event</h3>
            <p className="py-4">
              Are you sure you want to cancel this event? All participants will be notified, and the event will be marked as cancelled.
            </p>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                No, keep event
              </button>
              <button 
                className="btn btn-error"
                onClick={handleDeleteEvent}
              >
                Yes, cancel event
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}></div>
        </div>
      )}
      
      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Mark Event as Completed</h3>
            <p className="py-4">
              Are you sure you want to mark this event as completed? This will:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Award {currentEvent.ecoPoints} eco points to all participants</li>
              <li>Award 10 bonus points to you as the organizer</li>
              <li>Move the event to "Completed" status</li>
            </ul>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setShowCompleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success"
                onClick={handleCompleteEvent}
              >
                Complete Event
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCompleteConfirm(false)}></div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
