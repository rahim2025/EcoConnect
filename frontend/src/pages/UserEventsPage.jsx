import { useState, useEffect } from 'react';
import { useEventStore } from '../store/useEventStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Plus,
  ArrowLeft
} from 'lucide-react';

const UserEventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  
  const { authUser } = useAuthStore();
  const { 
    userEvents, 
    loading, 
    fetchUserEvents,
    formatEventDate
  } = useEventStore();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);
  
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);
  
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
  
  // Function to render event cards
  const renderEventList = (events) => {
    if (events.length === 0) {
      return (
        <div className="col-span-3 py-16 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-16 h-16 text-primary/50 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Events Found</h3>
          <p className="text-base-content/70 mb-6">
            {activeTab === 'organized' 
              ? "You haven't created any eco events yet." 
              : "You're not participating in any eco events yet."}
          </p>
          {activeTab === 'organized' ? (
            <Link to="/events/create" className="btn btn-primary">
              <Plus className="w-5 h-5" /> Create Event
            </Link>
          ) : (
            <Link to="/events" className="btn btn-primary">
              Find Events
            </Link>
          )}
        </div>
      );
    }
    
    return events.map((event) => {
      const eventDate = formatEventDate(event.date);
      
      return (
        <div key={event._id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
          {/* Event image or placeholder */}
          {event.image ? (
            <figure className="h-40">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </figure>
          ) : (
            <div className="h-40 bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-12 h-12 text-primary/50" />
            </div>
          )}
          
          <div className="card-body">
            <div className="flex justify-between items-start mb-2">
              <h3 className="card-title line-clamp-1">{event.title}</h3>
              <div className="flex flex-col gap-1">
                <span className={`badge ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <span className={`badge ${getCategoryColor(event.category)}`}>
                  {event.category.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4" />
              <span>{eventDate.fromNow}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="card-actions mt-4 justify-end">
              <Link 
                to={`/events/${event._id}`}
                className="btn btn-primary btn-sm"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      );
    });
  };
  
  // Get events based on active tab
  const getFilteredEvents = () => {
    switch(activeTab) {
      case 'organized':
        return userEvents.organized || [];
      case 'participating':
        return userEvents.participating || [];
      default:
        return [...(userEvents.organized || []), ...(userEvents.participating || [])];
    }
  };
  
  const filteredEvents = getFilteredEvents();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </button>
        </div>
        
        <h1 className="text-3xl font-bold flex items-center">
          <CalendarDays className="w-8 h-8 mr-2 text-primary" />
          My Eco Events
        </h1>
        <p className="text-base-content/70">
          Manage events you're organizing and participating in
        </p>
      </div>
      
      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Events
        </button>
        <button 
          className={`tab ${activeTab === 'organized' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('organized')}
        >
          Organizing ({userEvents.organized?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'participating' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('participating')}
        >
          Participating ({userEvents.participating?.length || 0})
        </button>
      </div>
      
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card bg-base-200 animate-pulse">
              <div className="h-40 w-full bg-base-300 rounded-t-box"></div>
              <div className="card-body">
                <div className="h-6 w-3/4 bg-base-300 rounded-full mb-3"></div>
                <div className="h-4 w-full bg-base-300 rounded-full mb-2"></div>
                <div className="h-4 w-full bg-base-300 rounded-full mb-2"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 bg-base-300 rounded-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          renderEventList(filteredEvents)
        )}
      </div>
      
      {/* Call to Action */}
      <div className="mt-12 flex justify-center">
        <Link to="/events" className="btn btn-primary">
          Explore More Events
        </Link>
      </div>
    </div>
  );
};

export default UserEventsPage;
