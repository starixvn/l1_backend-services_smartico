/**
 * Unit tests for DashboardLayout component.
 */

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import { DashboardLayout } from './DashboardLayout';

describe('DashboardLayout', () => {
  it('renders children content', () => {
    renderWithProviders(
      <DashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders with default page title "Dashboard"', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders with custom page title', () => {
    renderWithProviders(
      <DashboardLayout pageTitle="Progress">
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('renders skip-to-content link', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders main content with proper ARIA attributes', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('aria-label', 'Dashboard content');
  });

  it('renders Sidebar component', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Sidebar should render with nav role
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders TopHeader component', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // TopHeader should contain page title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
