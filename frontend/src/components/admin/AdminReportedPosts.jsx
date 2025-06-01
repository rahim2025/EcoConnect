import { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';
import { AlertTriangle, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const reasonLabels = {
  'inappropriate': 'Inappropriate Content',
  'spam': 'Spam',
  'harmful': 'Harmful Content',
  'misinformation': 'Misinformation',
  'other': 'Other'
};

const AdminReportedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [selectedReports, setSelectedReports] = useState({});

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/reported-posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching reported posts:', error);
      toast.error('Failed to load reported posts');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const toggleReportSelection = (postId, reportId) => {
    setSelectedReports(prev => {
      const postSelections = prev[postId] || [];
      if (postSelections.includes(reportId)) {
        return {
          ...prev, 
          [postId]: postSelections.filter(id => id !== reportId)
        };
      } else {
        return {
          ...prev, 
          [postId]: [...postSelections, reportId]
        };
      }
    });
  };

  const selectAllReports = (postId, reports) => {
    if (selectedReports[postId]?.length === reports.length) {
      // Deselect all if all are already selected
      setSelectedReports(prev => ({ ...prev, [postId]: [] }));
    } else {
      // Select all
      setSelectedReports(prev => ({
        ...prev,
        [postId]: reports.map(report => report._id)
      }));
    }
  };
  const handleAction = async (postId, action) => {
    if (!selectedReports[postId] || selectedReports[postId].length === 0) {
      toast.error('Please select at least one report to review');
      return;
    }

    try {
      await axiosInstance.post(`/admin/reported-posts/${postId}/review`, {
        action,
        reportIds: selectedReports[postId]
      });

      toast.success(`Post ${action}ed successfully`);
      fetchReportedPosts();
      setSelectedReports(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
        <h3 className="text-xl font-bold">No Reported Posts</h3>
        <p className="text-base-content/70">
          There are currently no reported posts requiring review
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-warning" /> Reported Posts
      </h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Review reported posts and take appropriate actions. Posts with multiple reports should be prioritized.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post._id} className="bg-base-200 rounded-lg overflow-hidden">
            <div className="bg-base-300 p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <img 
                    src={post.user.profilePic || "/avatar.png"} 
                    alt={post.user.fullName} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{post.user.fullName}</span>
                </div>
                <div className="text-xs text-base-content/70 mt-1">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="badge badge-warning gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {post.reports.length} {post.reports.length === 1 ? 'Report' : 'Reports'}
                </span>
                <button 
                  onClick={() => toggleExpand(post._id)}
                  className="btn btn-sm btn-ghost"
                >
                  {expandedPost === post._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {expandedPost === post._id && (
              <div className="p-4">
                <div className="bg-base-100 rounded-lg p-4 mb-4">
                  <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="rounded-lg w-full max-h-96 object-contain bg-base-300"
                    />
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Reports:</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-compact w-full">
                      <thead>
                        <tr>
                          <th className="w-12">
                            <input 
                              type="checkbox" 
                              className="checkbox checkbox-sm"
                              checked={selectedReports[post._id]?.length === post.reports.length}
                              onChange={() => selectAllReports(post._id, post.reports)}
                            />
                          </th>
                          <th>Reporter</th>
                          <th>Reason</th>
                          <th>Details</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {post.reports.map(report => (
                          <tr key={report._id} className="hover">
                            <td>
                              <input 
                                type="checkbox" 
                                className="checkbox checkbox-sm"
                                checked={selectedReports[post._id]?.includes(report._id)}
                                onChange={() => toggleReportSelection(post._id, report._id)}
                              />
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <img 
                                  src={report.user.profilePic || "/avatar.png"} 
                                  alt={report.user.fullName} 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span>{report.user.fullName}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-outline">
                                {reasonLabels[report.reason] || report.reason}
                              </span>
                            </td>
                            <td>{report.details || '-'}</td>
                            <td className="text-xs">
                              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </td>
                            <td>
                              <span className={`badge ${
                                report.status === 'reviewed' ? 'badge-success' : 
                                report.status === 'dismissed' ? 'badge-ghost' : 
                                'badge-warning'
                              }`}>
                                {report.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button 
                    className="btn btn-sm"
                    onClick={() => handleAction(post._id, 'dismiss')}
                    disabled={!selectedReports[post._id]?.length}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Dismiss Report
                  </button>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleAction(post._id, 'hide')}
                    disabled={!selectedReports[post._id]?.length}
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide Post
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => handleAction(post._id, 'delete')}
                    disabled={!selectedReports[post._id]?.length}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReportedPosts;
