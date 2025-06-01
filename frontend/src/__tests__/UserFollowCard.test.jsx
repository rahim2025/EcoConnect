import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserFollowCard from '../components/UserFollowCard';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

// Mock the stores
vi.mock('../store/useAuthStore');
vi.mock('../store/useNotificationStore');

describe('UserFollowCard', () => {
  // Mock user data
  const mockUser = {
    _id: 'user123',
    fullName: 'Test User',
    profilePic: '/test-avatar.png',
    bio: 'Test bio description'
  };
  
  // Mock auth user
  const mockAuthUser = {
    _id: 'authuser456',
    following: []
  };
  
  // Mock functions
  const mockFollowUser = vi.fn();
  const mockUnfollowUser = vi.fn();
  const mockCreateNotification = vi.fn();
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Setup default mock returns
    useAuthStore.mockReturnValue({
      authUser: mockAuthUser,
      followUser: mockFollowUser,
      unfollowUser: mockUnfollowUser
    });
    
    useNotificationStore.mockReturnValue({
      createMockFollowNotification: mockCreateNotification
    });
  });
  
  test('renders with user information', () => {
    render(
      <BrowserRouter>
        <UserFollowCard user={mockUser} />
      </BrowserRouter>
    );
    
    // Check if user info is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test bio description')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toHaveAttribute('src', '/test-avatar.png');
    
    // Follow button should be visible
    expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
  });
  
  test('shows unfollow button when already following', () => {
    // Modify mock to indicate already following
    useAuthStore.mockReturnValue({
      authUser: {
        _id: 'authuser456',
        following: ['user123'] // Now following the user
      },
      followUser: mockFollowUser,
      unfollowUser: mockUnfollowUser
    });
    
    render(
      <BrowserRouter>
        <UserFollowCard user={mockUser} />
      </BrowserRouter>
    );
    
    // Should see unfollow button
    expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
  });
  
  test('handles follow action', async () => {
    mockFollowUser.mockResolvedValue(true);
    
    render(
      <BrowserRouter>
        <UserFollowCard user={mockUser} />
      </BrowserRouter>
    );
    
    // Click follow button
    fireEvent.click(screen.getByRole('button', { name: /follow/i }));
    
    // Verify follow function was called with correct ID
    expect(mockFollowUser).toHaveBeenCalledWith('user123');
    
    // Wait for the async operation
    await waitFor(() => {
      expect(mockCreateNotification).toHaveBeenCalled();
    });
  });
  
  test('handles unfollow action', async () => {
    // Set up as following
    useAuthStore.mockReturnValue({
      authUser: {
        _id: 'authuser456',
        following: ['user123']
      },
      followUser: mockFollowUser,
      unfollowUser: mockUnfollowUser
    });
    
    mockUnfollowUser.mockResolvedValue(true);
    
    render(
      <BrowserRouter>
        <UserFollowCard user={mockUser} />
      </BrowserRouter>
    );
    
    // Click unfollow button
    fireEvent.click(screen.getByRole('button', { name: /unfollow/i }));
    
    // Verify unfollow function was called
    expect(mockUnfollowUser).toHaveBeenCalledWith('user123');
  });
  
  test('displays mutual connections when available', () => {
    render(
      <BrowserRouter>
        <UserFollowCard 
          user={{
            ...mockUser,
            mutualConnections: 3
          }}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('mutual connections')).toBeInTheDocument();
  });
  
  test('displays matching interests when available', () => {
    render(
      <BrowserRouter>
        <UserFollowCard 
          user={{
            ...mockUser,
            matchingInterests: ['sustainability', 'recycling']
          }}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('sustainability')).toBeInTheDocument();
    expect(screen.getByText('recycling')).toBeInTheDocument();
  });
  
  test('does not show follow button for own profile', () => {
    useAuthStore.mockReturnValue({
      authUser: {
        _id: 'user123', // Same as the viewed user
        following: []
      },
      followUser: mockFollowUser,
      unfollowUser: mockUnfollowUser
    });
    
    render(
      <BrowserRouter>
        <UserFollowCard user={mockUser} />
      </BrowserRouter>
    );
    
    // Should not see follow/unfollow button
    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /unfollow/i })).not.toBeInTheDocument();
  });
});
