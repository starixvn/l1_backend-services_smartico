/**
 * Unit tests for AnimatedCard component.
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../tests/utils/renderWithProviders';
import { AnimatedCard } from './AnimatedCard';

describe('AnimatedCard', () => {
  it('renders children content', () => {
    renderWithProviders(
      <AnimatedCard>
        <div data-testid="card-content">Test Content</div>
      </AnimatedCard>
    );

    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('applies common rarity class by default', () => {
    const { container } = renderWithProviders(
      <AnimatedCard>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-gray-500/30');
  });

  it('applies epic rarity class', () => {
    const { container } = renderWithProviders(
      <AnimatedCard rarity="epic">
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-purple-500/30');
  });

  it('applies legendary rarity class', () => {
    const { container } = renderWithProviders(
      <AnimatedCard rarity="legendary">
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-yellow-500/30');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const { container } = renderWithProviders(
      <AnimatedCard onClick={onClick}>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has button role when onClick is provided', () => {
    const onClick = vi.fn();
    const { container } = renderWithProviders(
      <AnimatedCard onClick={onClick}>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('has article role when no onClick is provided', () => {
    const { container } = renderWithProviders(
      <AnimatedCard>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('role', 'article');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('handles keyboard interaction (Enter key)', () => {
    const onClick = vi.fn();
    const { container } = renderWithProviders(
      <AnimatedCard onClick={onClick}>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard interaction (Space key)', () => {
    const onClick = vi.fn();
    const { container } = renderWithProviders(
      <AnimatedCard onClick={onClick}>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.keyDown(card, { key: ' ' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <AnimatedCard className="custom-class">
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('applies interactive classes when isInteractive is true', () => {
    const { container } = renderWithProviders(
      <AnimatedCard isInteractive>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });
});
