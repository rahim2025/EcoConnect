import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EcoPost from '../components/EcoPost';
import { useAuthStore } from '../store/useAuthStore';
import { usePostStore } from '../store/usePostStore';
import { BrowserRouter } from 'react-router-dom';

// Mock the stores
vi.mock('../store/useAuthStore');
vi.mock('../store/usePostStore');

// Mock components that are used in EcoPost
vi.mock('../components/SharePostModal', () => ({
  default: ({ isOpen, onClose }) => 
    isOpen ? <div data-testid="share-modal"><button onClick={onClose}>Close</button></div> : null
}));

describe('EcoPost Component', () => {
  const mockPost = {
    _id: 'post123',
    content: 'This is a test post about eco-friendly practices',
    image: 'https://example.com/image.jpg',
    tags: ['eco', 'green'],
    likes: [{ _id: 'user1', fullName: 'User One' }],
    comments: [
      {
        _id: 'comment1',
        text: 'Great post!',
        user: { _id: 'user2', fullName: 'User Two', profilePic: '/avatar.png' },
        createdAt: new Date().toISOString()
      }
    ],
    visibility: 'public',
    user: {
      _id: 'author1',
      fullName: 'John Doe',
      profilePic: '/avatar.png'
    },
    createdAt: new Date().toISOString()
  };

  const mockFunctions = {
    onLike: vi.fn(),
    onComment: vi.fn(),
    onDelete: vi.fn()
  };

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      authUser: { _id: 'user1', fullName: 'Test User', profilePic: '/avatar.png' }
    });
    
    usePostStore.mockReturnValue({
      deleteComment: vi.fn()
    });
  });

  it('renders post content correctly', () => {
    render(
      <BrowserRouter>
        <EcoPost post={mockPost} {...mockFunctions} />
      </BrowserRouter>
    );

    // Check basic content
    expect(screen.getByText('This is a test post about eco-friendly practices')).toBeInTheDocument();
    expect(screen.getByText('#eco')).toBeInTheDocument();
    expect(screen.getByText('#green')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays like and comment counts', () => {
    render(
      <BrowserRouter>
        <EcoPost post={mockPost} {...mockFunctions} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('1 like')).toBeInTheDocument();
    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('calls like function when like button is clicked', async () => {
    render(
      <BrowserRouter>
        <EcoPost post={mockPost} {...mockFunctions} />
      </BrowserRouter>
    );
    
    const likeButton = screen.getByText('Like').closest('button');
    fireEvent.click(likeButton);
    
    expect(mockFunctions.onLike).toHaveBeenCalledWith('post123');
  });

  it('shows and hides comments when comment button is clicked', async () => {
    render(
      <BrowserRouter>
        <EcoPost post={mockPost} {...mockFunctions} />
      </BrowserRouter>
    );
    
    // Comments should be hidden initially
    expect(screen.queryByText('Great post!')).not.toBeInTheDocument();
    
    // Click the comment button
    const commentButton = screen.getByText('Comment').closest('button');
    fireEvent.click(commentButton);
    
    // Comments should now be visible
    expect(screen.getByText('Great post!')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(commentButton);
    
    // Wait for the transition to complete
    await waitFor(() => {
      expect(screen.queryByText('Great post!')).not.toBeInTheDocument();
    });
  });

  it('opens share modal when share button is clicked', () => {
    render(
      <BrowserRouter>
        <EcoPost post={mockPost} {...mockFunctions} />
      </BrowserRouter>
    );
    
    // Share modal should not be visible initially
    expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();
    
    // Click the share button
    const shareButton = screen.getByText('Share').closest('button');
    fireEvent.click(shareButton);
    
    // Share modal should now be visible
    expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    
    // Close the modal
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    // Modal should be closed
    expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();
  });
});
