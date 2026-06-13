import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { EditorPanel } from './EditorPanel';
import type { GeneratorState } from '../types';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: () => '',
}));

const mockState: GeneratorState = {
  name: 'John Doe',
  description: 'Full-stack developer',
  selectedTechs: ['react', 'typescript'],
  selectedSocials: ['github', 'twitter'],
  socialLinks: {
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  githubUsername: 'johndoe',
  showCommitPulse: true,
  commitPulseAccent: '10b981',
};

const mockHandlers = {
  onNameChange: vi.fn(),
  onDescriptionChange: vi.fn(),
  onTechsChange: vi.fn(),
  onSocialsChange: vi.fn(),
  onSocialLinkChange: vi.fn(),
  onGithubUsernameChange: vi.fn(),
  onShowCommitPulseChange: vi.fn(),
  onCommitPulseAccentChange: vi.fn(),
  onApplyImport: vi.fn(),
};

describe('EditorPanel Component Accessibility Tests', () => {
  it('verifies that the root container has a form landmark', () => {
    render(<EditorPanel state={mockState} {...mockHandlers} />);

    const form = screen.getByRole('form', { name: /readme configuration editor/i });
    expect(form).toBeInTheDocument();
  });

  it('verifies text inputs, textareas, and selection fields have properly associated labels', () => {
    render(<EditorPanel state={mockState} {...mockHandlers} />);

    const nameLabel = screen.getByText(/^display name$/i);
    expect(nameLabel).toHaveAttribute('for', 'editor-display-name');
    expect(screen.getByLabelText(/^display name$/i)).toHaveAttribute('id', 'editor-display-name');

    const bioLabel = screen.getByText(/^bio \/ tagline$/i);
    expect(bioLabel).toHaveAttribute('for', 'editor-bio');
    expect(screen.getByLabelText(/^bio \/ tagline$/i)).toHaveAttribute('id', 'editor-bio');

    const usernameLabel = screen.getByText(/^github username$/i);
    expect(usernameLabel).toHaveAttribute('for', 'commitpulse-username');
    expect(screen.getByLabelText(/^github username$/i)).toHaveAttribute(
      'id',
      'commitpulse-username'
    );
  });

  it('verifies correct tablist, tab, and tabpanel mappings inside SocialsSection', () => {
    render(<EditorPanel state={mockState} {...mockHandlers} />);

    const tablist = screen.getByRole('tablist', { name: /socials settings tabs/i });
    expect(tablist).toBeInTheDocument();

    const pickTab = screen.getByRole('tab', { name: /pick platforms/i });
    const linksTab = screen.getByRole('tab', { name: /add links/i });

    expect(pickTab).toBeInTheDocument();
    expect(linksTab).toBeInTheDocument();

    expect(pickTab).toHaveAttribute('aria-selected', 'true');
    expect(linksTab).toHaveAttribute('aria-selected', 'false');

    const pickPanel = screen.getByRole('tabpanel', { name: /pick platforms/i });
    expect(pickPanel).toBeInTheDocument();
    expect(pickPanel).toHaveAttribute('id', 'panel-social-pick');
    expect(pickPanel).toHaveAttribute('aria-labelledby', 'tab-social-pick');
  });

  it('verifies interactive elements can receive focus', () => {
    render(<EditorPanel state={mockState} {...mockHandlers} />);

    const nameInput = screen.getByLabelText(/^display name$/i);
    const bioInput = screen.getByLabelText(/^bio \/ tagline$/i);
    const usernameInput = screen.getByLabelText(/^github username$/i);

    nameInput.focus();
    expect(document.activeElement).toBe(nameInput);

    bioInput.focus();
    expect(document.activeElement).toBe(bioInput);

    usernameInput.focus();
    expect(document.activeElement).toBe(usernameInput);
  });

  it('verifies that the Name section header toggles collapse state correctly', () => {
    render(<EditorPanel state={mockState} {...mockHandlers} />);

    const headerButton = screen.getByRole('button', {
      name: /your display name for the readme header/i,
    });

    expect(headerButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(headerButton);
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');

    const nameRegion = screen.queryByRole('region', { name: /name/i });
    expect(nameRegion).toBeNull();
  });
});
