import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import BlogCard from './BlogCard.jsx';
import PublicNavbar from './PublicNavbar.jsx';
import StatCard from './StatCard.jsx';
import UserRow from './UserRow.jsx';

afterEach(cleanup);

const writer = { userId: 'writer-1', displayName: 'Mira Chen', role: 'user' };
const post = {
  id: 'post-1',
  title: 'A thoughtful post',
  content: 'A'.repeat(125),
  createdAt: '2024-02-01T00:00:00.000Z',
  authorId: 'writer-1',
  authorName: 'Mira Chen',
  authorRole: 'user',
};

function renderInRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('shared components', () => {
  it('shows guest links and role-specific dashboard destinations in PublicNavbar', () => {
    const { rerender } = renderInRouter(<PublicNavbar session={null} />);
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: 'Go to Dashboard' })).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <PublicNavbar session={writer} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Mira Chen')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/blogs');

    rerender(
      <MemoryRouter>
        <PublicNavbar session={{ ...writer, role: 'admin' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/admin');
  });

  it('renders accessible role-specific Avatar labels, marks, and sizes', () => {
    const { rerender } = render(<Avatar role="admin" size="lg" />);
    const adminAvatar = screen.getByRole('img', { name: 'Administrator' });
    expect(adminAvatar).toHaveTextContent('♛');
    expect(adminAvatar).toHaveClass('bg-violet-600', 'h-14', 'w-14');

    rerender(<Avatar label="Mira avatar" role="user" size="sm" />);
    const writerAvatar = screen.getByRole('img', { name: 'Mira avatar' });
    expect(writerAvatar).toHaveTextContent('▤');
    expect(writerAvatar).toHaveClass('bg-indigo-500', 'h-8', 'w-8');
  });

  it('shows BlogCard edit access only to the owner or an admin and truncates previews', () => {
    const { rerender } = renderInRouter(<BlogCard index={0} post={post} session={writer} />);
    expect(screen.getByRole('heading', { name: post.title })).toBeInTheDocument();
    expect(document.querySelector('a[href="/blog/post-1"]')).toHaveTextContent('A thoughtful post');
    expect(screen.getByText(`${'A'.repeat(120)}…`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit A thoughtful post' })).toHaveAttribute('href', '/edit/post-1');
    expect(screen.getByRole('img', { name: 'Mira Chen avatar' })).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <BlogCard index={0} post={post} session={{ ...writer, userId: 'writer-2' }} />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: 'Edit A thoughtful post' })).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <BlogCard index={0} post={post} session={{ ...writer, userId: 'writer-2', role: 'admin' }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Edit A thoughtful post' })).toHaveAttribute('href', '/edit/post-1');
  });

  it('renders StatCard label, live value, and requested tone with a fallback', () => {
    const { rerender } = render(<StatCard label="Total users" tone="teal" value={12} />);
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('12');
    expect(screen.getByRole('article')).toHaveClass('bg-teal-600');

    rerender(<StatCard label="Posts" tone="unknown" value={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('0');
    expect(screen.getByRole('article')).toHaveClass('bg-indigo-600');
  });

  it('disables protected UserRow deletion controls and invokes deletion for an eligible account', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const defaultAdmin = {
      id: 'writespace-default-admin', displayName: 'Default Admin', username: 'admin', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z',
    };
    const currentUser = {
      id: 'writer-1', displayName: 'Mira Chen', username: 'mira', role: 'user', createdAt: '2024-02-01T00:00:00.000Z',
    };
    const otherUser = {
      id: 'writer-2', displayName: 'Noah Park', username: 'noah', role: 'user', createdAt: '2024-03-01T00:00:00.000Z',
    };
    const { rerender } = render(
      <table><tbody><UserRow currentUserId="writer-1" onDelete={onDelete} user={defaultAdmin} /></tbody></table>,
    );
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted.' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Default admin cannot be deleted.' })).toHaveAttribute('title', 'Default admin cannot be deleted.');

    rerender(
      <table><tbody><UserRow currentUserId="writer-1" onDelete={onDelete} user={currentUser} /></tbody></table>,
    );
    expect(screen.getByRole('button', { name: 'You cannot delete your own account.' })).toBeDisabled();

    rerender(
      <table><tbody><UserRow currentUserId="writer-1" onDelete={onDelete} user={otherUser} /></tbody></table>,
    );
    const row = screen.getByRole('row', { name: /Noah Park noah User/ });
    const deleteButton = within(row).getByRole('button', { name: 'Delete Noah Park' });
    expect(deleteButton).toBeEnabled();
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(otherUser);
  });
});
