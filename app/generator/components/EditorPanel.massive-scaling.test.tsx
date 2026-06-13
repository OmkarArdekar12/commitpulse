import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EditorPanel } from './EditorPanel';
import type { GeneratorState } from '../types';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value,
}));

const makeHandlers = () => ({
  onNameChange: vi.fn(),
  onDescriptionChange: vi.fn(),
  onTechsChange: vi.fn(),
  onSocialsChange: vi.fn(),
  onSocialLinkChange: vi.fn(),
  onGithubUsernameChange: vi.fn(),
  onShowCommitPulseChange: vi.fn(),
  onCommitPulseAccentChange: vi.fn(),
  onApplyImport: vi.fn(),
});

const makeState = (overrides: Partial<GeneratorState> = {}): GeneratorState => ({
  name: '',
  description: '',
  selectedTechs: [],
  selectedSocials: [],
  socialLinks: {},
  githubUsername: '',
  showCommitPulse: false,
  commitPulseAccent: '',
  ...overrides,
});

describe('EditorPanel - Massive Scaling & Extreme Bounds', () => {
  it('handles name and description with massive character strings without breaking or crashing', () => {
    const handlers = makeHandlers();
    const massiveName = 'A'.repeat(20000);
    const massiveDescription = 'B'.repeat(40000);

    const state = makeState({
      name: massiveName,
      description: massiveDescription,
    });

    render(<EditorPanel state={state} {...handlers} />);

    const nameInput = screen.getByLabelText(/^display name$/i) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe(massiveName);

    const descTextarea = screen.getByLabelText(/^bio \/ tagline$/i) as HTMLTextAreaElement;
    expect(descTextarea).toBeInTheDocument();
    expect(descTextarea.value).toBe(massiveDescription);

    const newMassiveName = 'C'.repeat(30000);
    fireEvent.change(nameInput, { target: { value: newMassiveName } });
    expect(handlers.onNameChange).toHaveBeenCalledWith(newMassiveName);
  });

  it('renders Technologies section with thousands of selected tech items without crashing', () => {
    const handlers = makeHandlers();
    const massiveSelectedTechs = Array.from({ length: 5000 }, (_, i) => `tech-id-${i}`);
    const state = makeState({
      selectedTechs: massiveSelectedTechs,
    });

    render(<EditorPanel state={state} {...handlers} />);

    expect(screen.getByRole('heading', { name: /^technologies$/i })).toBeInTheDocument();

    const selectedCountLabel = screen.getByText(
      new RegExp(`Selected \\(${massiveSelectedTechs.length}\\)`, 'i')
    );
    expect(selectedCountLabel).toBeInTheDocument();
  });

  it('renders Socials section with huge links properties under load without crashing', () => {
    const handlers = makeHandlers();
    const selectedSocials = Array.from({ length: 200 }, (_, i) => `social-${i}`);
    const socialLinks: Record<string, string> = {};

    selectedSocials.forEach((id) => {
      socialLinks[id] = 'https://custom-domain.com/' + 'a'.repeat(2000) + `/${id}`;
    });

    const state = makeState({
      selectedSocials,
      socialLinks,
    });

    render(<EditorPanel state={state} {...handlers} />);

    expect(screen.getByText('Socials')).toBeInTheDocument();
  });

  it('handles custom accent inputs and switch boundaries with long invalid values', () => {
    const handlers = makeHandlers();
    const state = makeState({
      githubUsername: 'a'.repeat(10000),
      showCommitPulse: true,
      commitPulseAccent: '🚀emoji_invalid_hex_value_with_excessive_length!@#$',
    });

    render(<EditorPanel state={state} {...handlers} />);

    const usernameInput = screen.getByLabelText(/^github username$/i) as HTMLInputElement;
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput.value).toBe('a'.repeat(10000));

    expect(screen.getByText(/invalid hex/i)).toBeInTheDocument();
  });

  it('renders and processes rapid state updates under heavy load efficiently', () => {
    const handlers = makeHandlers();
    const state = makeState();

    const { rerender } = render(<EditorPanel state={state} {...handlers} />);

    const start = performance.now();

    act(() => {
      for (let i = 0; i < 20; i++) {
        const updatedState = makeState({
          name: `User Name ${i}`,
          description: `Bio Description ${i} ` + 'x'.repeat(i),
          githubUsername: '',
          showCommitPulse: i % 2 === 0,
          commitPulseAccent: i % 2 === 0 ? '10b981' : '',
        });

        rerender(<EditorPanel state={updatedState} {...handlers} />);
      }
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
