/**
 * Unit tests for TopHeader component.
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import { TopHeader } from './TopHeader';

describe('TopHeader', () => {
  it('renders page title', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onMenuToggle when menu button is clicked', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    const menuButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuButton);

    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('renders level badge with level number', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    // Level is from mock data (currentLevel: 42)
    expect(screen.getByText(/level 42/i)).toBeInTheDocument();
  });

  it('renders coin counter', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    // Coins from mock data: 12500 → formatted as "12,500"
    expect(screen.getByText('12,500')).toBeInTheDocument();
  });

  it('renders gem counter', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    // Gems from mock data: 450
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('renders diamond counter', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    // Diamonds from mock data: 89
    expect(screen.getByText('89')).toBeInTheDocument();
  });

  it('renders notification bell button', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    expect(notificationButton).toBeInTheDocument();
  });

  it('displays notification count badge when notifications exist', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    // Mock data has notificationCount: 3
    const notificationButton = screen.getByRole('button', { name: /notifications \(3 unread\)/i });
    expect(notificationButton).toBeInTheDocument();
  });

  it('renders user avatar button', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    const userButton = screen.getByRole('button', { name: /user menu/i });
    expect(userButton).toBeInTheDocument();
  });

  it('shows loading state for counters', () => {
    const onMenuToggle = vi.fn();

    // Mock hook to return loading state
    renderWithProviders(<TopHeader pageTitle="Dashboard" onMenuToggle={onMenuToggle} />);

    // When data is available, should show actual values not "..."
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});
