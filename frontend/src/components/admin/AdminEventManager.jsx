import { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';
import { Calendar, Filter, Check, X, AlertCircle, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const statusColors = {
  upcoming: 'badge-primary',
  ongoing: 'badge-success',
  completed: 'badge-info',
  cancelled: 'badge-error'
};

const categoryIcons = {
  cleanup: '🧹',
  recycling: '♻️',
  'tree-planting': '🌱',
  conservation: '🌍',
  education: '📚',
  energy: '⚡',
  other: '🔄'
};

const AdminEventManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  const [updateForm, setUpdateForm] = useState({
    eventId: '',
    status: '',
    message: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      
      const response = await axiosInstance.get(`/admin/events?${params.toString()}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
    
    if (expandedEvent !== eventId) {
      const event = events.find(e => e._id === eventId);
      setUpdateForm({
        eventId,
        status: event.status,
        message: ''
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpdateFormChange = (key, value) => {
    setUpdateForm(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpdateStatus = async () => {
    if (!updateForm.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      await axiosInstance.put(`/admin/events/${updateForm.eventId}/status`, {
        status: updateForm.status,
        message: updateForm.message
      });

      toast.success('Event status updated successfully');
      fetchEvents();
      setExpandedEvent(null);
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" /> Event Management
      </h2>
      
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-5 h-5 text-base-content/70" />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="">All Categories</option>
            <option value="cleanup">Cleanup</option>
            <option value="recycling">Recycling</option>
            <option value="tree-planting">Tree Planting</option>
            <option value="conservation">Conservation</option>
            <option value="education">Education</option>
            <option value="energy">Energy</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <button 
          onClick={fetchEvents} 
          className="btn btn-sm"
        >
          Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <h3 className="text-xl font-bold">No Events Found</h3>
          <p className="text-base-content/70">
            No events match your current filter criteria
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Event</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Category</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <>
                  <tr key={event._id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded">
                            <img 
                              src={event.image || "/event-placeholder.png"} 
                              alt={event.title}
                              onError={(e) => { e.target.src = "/avatar.png" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{event.title}</div>
                          <div className="flex items-center text-xs text-base-content/70">
                            <MapPin className="w-3 h-3 mr-1" /> {event.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <img 
                          src={event.organizer.profilePic || "/avatar.png"} 
                          alt={event.organizer.fullName} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{event.organizer.fullName}</span>
                      </div>
                    </td>
                    <td>
                      {format(new Date(event.date), 'MMM d, yyyy')}
                      <br/>
                      <span className="text-xs text-base-content/70">
                        {format(new Date(event.date), 'h:mm a')}
                      </span>
                    </td>
                    <td>
                      <span className="badge">
                        {categoryIcons[event.category]} {event.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[event.status]}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> 
                        <span>{event.participants.length}</span>
                        {event.maxParticipants > 0 && (
                          <span className="text-xs text-base-content/70">
                            /{event.maxParticipants}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleExpand(event._id)}
                        className="btn btn-xs btn-ghost"
                      >
                        {expandedEvent === event._id ? 'Close' : 'Manage'}
                      </button>
                    </td>
                  </tr>
                  
                  {expandedEvent === event._id && (
                    <tr>
                      <td colSpan={7} className="bg-base-200">
                        <div className="p-4">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Description:</h4>
                            <p className="bg-base-100 p-3 rounded-lg">{event.description}</p>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Update Status:</h4>
                            <div className="flex flex-wrap gap-3 items-end">
                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text">Status</span>
                                </label>
                                <select
                                  value={updateForm.status}
                                  onChange={(e) => handleUpdateFormChange('status', e.target.value)}
                                  className="select select-bordered"
                                >
                                  <option value="upcoming">Upcoming</option>
                                  <option value="ongoing">Ongoing</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                              
                              <div className="form-control flex-1">
                                <label className="label">
                                  <span className="label-text">Message to Organizer (Optional)</span>
                                </label>
                                <input 
                                  type="text"
                                  placeholder="Reason for status change..."
                                  value={updateForm.message}
                                  onChange={(e) => handleUpdateFormChange('message', e.target.value)}
                                  className="input input-bordered w-full"
                                />
                              </div>
                              
                              <button 
                                className="btn btn-primary"
                                onClick={handleUpdateStatus}
                              >
                                Update Status
                              </button>
                            </div>
                            
                            {isPast(new Date(event.date)) && event.status !== 'completed' && event.status !== 'cancelled' && (
                              <div className="alert alert-warning mt-4 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>
                                  This event date has passed but it's not marked as completed or cancelled.
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Participants ({event.participants.length}):</h4>
                            <div className="flex flex-wrap gap-2">
                              {event.participants.map(user => (
                                <div key={user._id} className="badge badge-outline gap-1 p-3">
                                  <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.fullName}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                  {user.fullName}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEventManager;
