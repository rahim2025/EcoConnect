import { useState, useEffect } from 'react';
import { useEventStore } from '../store/useEventStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Plus,
  Filter,
  Search,
  SortDesc,
  Leaf,
  ArrowRight
} from 'lucide-react';
import CreateEventModal from '../components/CreateEventModal';

const EventsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { authUser } = useAuthStore();
  const { 
    events, 
    loading, 
    fetchEvents,
    formatEventDate
  } = useEventStore();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEvents({
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    });
  }, [fetchEvents, selectedStatus, selectedCategory]);
  
  // Filter events by search query
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'recycling', label: 'Recycling' },
    { value: 'tree-planting', label: 'Tree Planting' },
    { value: 'conservation', label: 'Conservation' },
    { value: 'education', label: 'Education' },
    { value: 'energy', label: 'Energy' },
    { value: 'other', label: 'Other' }
  ];
  
  const statusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <CalendarDays className="w-8 h-8 mr-2 text-primary" />
            Eco-Friendly Events
          </h1>
          <p className="text-base-content/70 mt-1">
            Join or create events to make a positive environmental impact
          </p>
        </div>
        
        <button
          className="btn btn-primary mt-4 md:mt-0"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-5 h-5" /> Create Event
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              className="input input-bordered w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 w-5 h-5 text-base-content/50" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          
          <select
            className="select select-bordered"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            className="select select-bordered"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card bg-base-200 animate-pulse">
              <div className="h-48 w-full bg-base-300 rounded-t-box"></div>
              <div className="card-body">
                <div className="h-8 w-3/4 bg-base-300 rounded-full mb-3"></div>
                <div className="h-4 w-full bg-base-300 rounded-full mb-2"></div>
                <div className="h-4 w-full bg-base-300 rounded-full mb-2"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 bg-base-300 rounded-full"></div>
                  <div className="h-6 w-20 bg-base-300 rounded-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-3 py-16 flex flex-col items-center justify-center text-center">
            <Leaf className="w-16 h-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Events Found</h3>
            <p className="text-base-content/70 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms or filters" 
                : "Be the first to create an eco-friendly event!"}
            </p>
            {!searchQuery && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5" /> Create Event
              </button>
            )}
          </div>
        ) : (
          // Event cards
          filteredEvents.map((event) => {
            const eventDate = formatEventDate(event.date);
            const isOrganizer = event.organizer._id === authUser?._id;
            const isParticipant = event.participants.some(p => p._id === authUser?._id);
            
            return (
              <div key={event._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                {/* Event image or placeholder */}
                {event.image ? (
                  <figure className="h-48 w-full">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </figure>
                ) : (
                  <div className="h-48 w-full bg-primary/20 flex items-center justify-center">
                    <CalendarDays className="w-16 h-16 text-primary/50" />
                  </div>
                )}
                
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title line-clamp-1">{event.title}</h2>
                    <div className="flex flex-col gap-1">
                      <span className={`badge ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className={`badge ${getCategoryColor(event.category)}`}>
                        {event.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="line-clamp-2 text-base-content/80 mb-1">{event.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{eventDate.fromNow}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>
                      {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
                      {event.maxParticipants > 0 && ` / ${event.maxParticipants} max`}
                    </span>
                  </div>
                  
                  <div className="card-actions mt-4 justify-end">
                    <Link 
                      to={`/events/${event._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Details
                    </Link>
                    
                    {!isOrganizer && !isParticipant && event.status === 'upcoming' && (
                      <Link 
                        to={`/events/${event._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Join Event
                      </Link>
                    )}
                    
                    {isParticipant && !isOrganizer && (
                      <div className="badge badge-success p-3">
                        Participating
                      </div>
                    )}
                    
                    {isOrganizer && (
                      <div className="badge badge-primary p-3">
                        Organizer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* My Events Quick Access */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Events</h2>
          <Link to="/profile/events" className="btn btn-sm btn-ghost">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/profile/events?tab=organized" className="card bg-primary text-primary-content flex-1">
            <div className="card-body">
              <h3 className="card-title">Events You're Organizing</h3>
              <p>Manage the eco events you've created</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View</button>
              </div>
            </div>
          </Link>
          
          <Link to="/profile/events?tab=participating" className="card bg-accent text-accent-content flex-1">
            <div className="card-body">
              <h3 className="card-title">Events You're Joining</h3>
              <p>Check out the eco events you're participating in</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">View</button>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default EventsPage;
