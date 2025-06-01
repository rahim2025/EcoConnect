import React, { useState, useEffect } from 'react';
import { Users, Search, Award, Edit, AlertCircle } from 'lucide-react';
import { axiosInstance } from "../../lib/axios";
import toast from 'react-hot-toast';

const AdminUserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingPoints, setEditingPoints] = useState(false);
  const [pointsValue, setPointsValue] = useState(0);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(user => 
          user.fullName.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPointsValue(user.ecoPoints);
  };
  
  const handleUpdatePoints = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await axiosInstance.put('/admin/user-points', {
        userId: selectedUser._id,
        points: pointsValue,
        reason: 'Admin adjustment'
      });
      
      toast.success(`Updated points for ${selectedUser.fullName}`);
      
      // Update user in the list
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, ecoPoints: pointsValue }
          : user
      ));
      
      setEditingPoints(false);
    } catch (error) {
      console.error('Error updating points:', error);
      toast.error('Failed to update points');
    }
  };
  
  const handleSendAlert = () => {
    if (selectedUser) {
      // Set the user in local storage temporarily to pass to the alert form
      localStorage.setItem('adminAlertUser', JSON.stringify({
        _id: selectedUser._id,
        fullName: selectedUser.fullName,
        email: selectedUser.email
      }));
      
      // Change to alert tab in the dashboard
      window.dispatchEvent(new CustomEvent('adminSwitchTab', { detail: 'alerts' }));
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" /> User Management
      </h2>
      
      <div className="flex gap-4 mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="input input-bordered w-full pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
        </div>
        
        <button 
          className="btn btn-outline btn-square"
          onClick={fetchUsers}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 overflow-x-auto rounded-xl shadow bg-base-200">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className="text-right">Eco Points</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    {searchQuery ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className={selectedUser?._id === user._id ? 'bg-primary bg-opacity-10' : ''}>
                    <td className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-10 h-10">
                          <img src={user.profilePic || '/avatar.png'} alt={user.fullName} />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-xs opacity-70">
                          {user.isAdmin && <span className="badge badge-sm badge-secondary">Admin</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm opacity-70">{user.email}</td>
                    <td className="text-right font-mono">
                      <div className="badge badge-ghost">{user.ecoPoints}</div>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleSelectUser(user)}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="lg:col-span-5">
          {selectedUser ? (
            <div className="bg-base-200 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full">
                    <img src={selectedUser.profilePic || '/avatar.png'} alt={selectedUser.fullName} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedUser.fullName}</h3>
                  <p className="text-sm opacity-70">{selectedUser.email}</p>
                  {selectedUser.isAdmin && (
                    <span className="badge badge-secondary mt-1">Administrator</span>
                  )}
                </div>
              </div>
              
              <div className="divider"></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> Eco Points
                  </div>
                  
                  {editingPoints ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input input-bordered input-sm w-24"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(parseInt(e.target.value))}
                        min="0"
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleUpdatePoints}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingPoints(false);
                          setPointsValue(selectedUser.ecoPoints);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{selectedUser.ecoPoints}</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingPoints(true)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <button
                    className="btn btn-outline btn-warning btn-sm gap-2 w-full"
                    onClick={handleSendAlert}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Send Warning Alert
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-base-200 rounded-xl p-8 text-center">
              <Users className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No User Selected</h3>
              <p className="text-sm text-base-content/70">
                Select a user from the list to view details and make changes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManager;
