/**
 * Unit tests for Sidebar component.
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders sidebar with ARIA attributes', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders Smartico branding', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Smartico')).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /progress/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /rewards/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /vip tiers/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /daily login/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /referrals/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /activity feed/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes when open', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('applies correct CSS classes when closed', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={false} onClose={onClose} />);

    const sidebar = screen.getByRole('complementary', { name: /main navigation/i });
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('calls onClose when navigation item is clicked (mobile)', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    const dashboardItem = screen.getByRole('menuitem', { name: /dashboard/i });
    fireEvent.click(dashboardItem);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders version footer', () => {
    const onClose = vi.fn();
    renderWithProviders(<Sidebar isOpen={true} onClose={onClose} />);

    expect(screen.getByText(/smartico gamification v1.0.0/i)).toBeInTheDocument();
  });
});
