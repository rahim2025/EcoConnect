import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreatePostModal from '../components/CreatePostModal';
import { useAuthStore } from '../store/useAuthStore';
import { compressImage } from '../utils/imageCompression';

// Mock dependencies
vi.mock('../store/useAuthStore');
vi.mock('../utils/imageCompression');

describe('CreatePostModal Component', () => {
  const mockFunctions = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn()
  };

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      authUser: { _id: 'user1', fullName: 'Test User', profilePic: '/avatar.png' }
    });
    
    compressImage.mockResolvedValue('compressed-image-data-url');
    
    // Reset mocks between tests
    vi.clearAllMocks();
  });

  it('renders correctly when opened', () => {
    render(<CreatePostModal {...mockFunctions} />);
    
    expect(screen.getByRole('heading', { name: /create post/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/share your eco-friendly thoughts/i)).toBeInTheDocument();
    expect(screen.getByText(/add image/i)).toBeInTheDocument();
  });

  it('doesn\'t render when isOpen is false', () => {
    render(<CreatePostModal {...mockFunctions} isOpen={false} />);
    
    expect(screen.queryByRole('heading', { name: /create post/i })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CreatePostModal {...mockFunctions} />);
    
    const closeButton = screen.getByLabelText(/close/i) || screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);
    
    expect(mockFunctions.onClose).toHaveBeenCalledTimes(1);
  });

  it('updates content when typing in textarea', () => {
    render(<CreatePostModal {...mockFunctions} />);
    
    const textarea = screen.getByPlaceholderText(/share your eco-friendly thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test post content' } });
    
    expect(textarea.value).toBe('Test post content');
  });

  it('adds and removes tags', () => {
    render(<CreatePostModal {...mockFunctions} />);
    
    // Find tag input
    const tagInput = screen.getByPlaceholderText(/add tags/i);
    
    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'eco' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    
    // Tag should be visible
    expect(screen.getByText('#eco')).toBeInTheDocument();
    
    // Tag input should be cleared
    expect(tagInput.value).toBe('');
    
    // Add another tag
    fireEvent.change(tagInput, { target: { value: 'green' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    
    // Both tags should be visible
    expect(screen.getByText('#eco')).toBeInTheDocument();
    expect(screen.getByText('#green')).toBeInTheDocument();
    
    // Remove a tag
    const removeButton = screen.getAllByText('×')[0];
    fireEvent.click(removeButton);
    
    // The tag should be removed
    expect(screen.queryByText('#eco')).not.toBeInTheDocument();
    expect(screen.getByText('#green')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(<CreatePostModal {...mockFunctions} />);
    
    // Add content
    const textarea = screen.getByPlaceholderText(/share your eco-friendly thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Test post content' } });
    
    // Add tag
    const tagInput = screen.getByPlaceholderText(/add tags/i);
    fireEvent.change(tagInput, { target: { value: 'eco' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 13, charCode: 13 });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /post/i });
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with correct data
    expect(mockFunctions.onSubmit).toHaveBeenCalledWith({
      content: 'Test post content',
      image: '',
      tags: ['eco'],
      visibility: 'public'
    });
  });
});
