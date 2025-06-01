import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotificationItem from '../components/NotificationItem';
import { useNotificationStore } from '../store/useNotificationStore';

// Mock the store
vi.mock('../store/useNotificationStore');

// Mock date-fns for consistent formatting
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '5 minutes ago'
}));

describe('NotificationItem', () => {
  // Mock notification data
  const mockFollowNotification = {
    _id: 'notif123',
    type: 'follow',
    isRead: false,
    createdAt: new Date().toISOString(),
    sender: {
      _id: 'user123',
      fullName: 'John Doe',
      profilePic: '/test-avatar.png'
    }
  };
  
  // Mock functions
  const mockMarkAsRead = vi.fn();
  const mockRemoveNotification = vi.fn();
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Setup default mock returns
    useNotificationStore.mockReturnValue({
      markAsRead: mockMarkAsRead,
      removeNotification: mockRemoveNotification
    });
  });
  
  test('renders follow notification correctly', () => {
    render(
      <BrowserRouter>
        <NotificationItem notification={mockFollowNotification} />
      </BrowserRouter>
    );
    
    // Check if notification content is displayed
    expect(screen.getByText(/John Doe started following you/i)).toBeInTheDocument();
    expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', '/test-avatar.png');
  });
  
  test('marks notification as read when clicked', async () => {
    render(
      <BrowserRouter>
        <NotificationItem notification={mockFollowNotification} />
      </BrowserRouter>
    );
    
    // Click on notification
    fireEvent.click(screen.getByText(/John Doe started following you/i));
    
    // Expect markAsRead to have been called
    expect(mockMarkAsRead).toHaveBeenCalledWith('notif123');
  });
  
  test('removes notification when remove button is clicked', async () => {
    // Set up component with mouse hover simulation
    const { container } = render(
      <BrowserRouter>
        <NotificationItem notification={mockFollowNotification} />
      </BrowserRouter>
    );
    
    // Find notification div and simulate hover
    const notificationDiv = container.firstChild;
    fireEvent.mouseEnter(notificationDiv);
    
    // After hovering, the remove button should appear
    const removeButton = await screen.findByLabelText('Remove notification');
    
    // Click the remove button
    fireEvent.click(removeButton);
    
    // Expect removeNotification to have been called with the correct ID
    expect(mockRemoveNotification).toHaveBeenCalledWith('notif123');
  });
  
  test('applies different styling for read notifications', () => {
    const readNotification = {
      ...mockFollowNotification,
      isRead: true
    };
    
    const { container } = render(
      <BrowserRouter>
        <NotificationItem notification={readNotification} />
      </BrowserRouter>
    );
    
    // Check if the read notification has lower opacity
    expect(container.firstChild).toHaveClass('opacity-70');
    
    // Unread notification should have indicator
    render(
      <BrowserRouter>
        <NotificationItem notification={mockFollowNotification} />
      </BrowserRouter>
    );
    
    // There should be an unread indicator dot
    const unreadIndicator = screen.getAllByRole('generic').find(
      (element) => element.classList.contains('bg-primary') && 
                  element.classList.contains('rounded-full')
    );
    
    expect(unreadIndicator).toBeInTheDocument();
  });
});
