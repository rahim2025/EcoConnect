import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { useNotificationStore } from '../store/useNotificationStore';

// Mock the store
vi.mock('../store/useNotificationStore');

describe('NotificationBell', () => {
  // Mock notifications
  const mockNotifications = [
    {
      _id: 'notif1',
      type: 'follow',
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        _id: 'user1',
        fullName: 'User One',
        profilePic: '/avatar1.png'
      }
    },
    {
      _id: 'notif2',
      type: 'follow',
      isRead: true,
      createdAt: new Date().toISOString(),
      sender: {
        _id: 'user2',
        fullName: 'User Two',
        profilePic: '/avatar2.png'
      }
    }
  ];
  
  // Mock functions
  const mockFetchNotifications = vi.fn();
  const mockMarkAllAsRead = vi.fn();
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    vi.useFakeTimers();
    
    // Setup default mock returns
    useNotificationStore.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      fetchNotifications: mockFetchNotifications,
      markAllAsRead: mockMarkAllAsRead
    });
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  test('renders notification bell with unread count', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );
    
    // Bell icon should be visible
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    
    // Unread count should be visible
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Fetch notifications should be called on load
    expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
  });
  
  test('opens dropdown when bell is clicked', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );
    
    // Click the bell
    fireEvent.click(screen.getByLabelText('Notifications'));
    
    // Dropdown should be visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    
    // Notifications should be listed
    expect(screen.getByText(/User One started following you/i)).toBeInTheDocument();
  });
  
  test('marks all notifications as read', () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Notifications'));
    
    // Click mark all as read
    fireEvent.click(screen.getByText('Mark all as read'));
    
    // Should call markAllAsRead
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });
  
  test('fetches notifications periodically', async () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );
    
    // Initial call
    expect(mockFetchNotifications).toHaveBeenCalledTimes(1);
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    // Should be called again after 30 seconds
    expect(mockFetchNotifications).toHaveBeenCalledTimes(2);
    
    // Another 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    // Should be called again
    expect(mockFetchNotifications).toHaveBeenCalledTimes(3);
  });
  
  test('renders empty state when no notifications', () => {
    // Mock empty notifications
    useNotificationStore.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: mockFetchNotifications,
      markAllAsRead: mockMarkAllAsRead
    });
    
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );
    
    // Click the bell
    fireEvent.click(screen.getByLabelText('Notifications'));
    
    // Should see empty state
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    
    // Should not see mark all as read button
    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });
});
