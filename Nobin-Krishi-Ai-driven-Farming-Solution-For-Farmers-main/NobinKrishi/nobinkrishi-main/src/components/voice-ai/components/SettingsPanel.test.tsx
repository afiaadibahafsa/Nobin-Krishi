import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsPanel, { VoiceSettings } from './SettingsPanel';

// Mock the UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <input
      type="range"
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      {...props}
    />
  )
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange('test-voice')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>
}));

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, open, onOpenChange }: any) => (
    <div data-testid="collapsible" data-open={open}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({ children, asChild }: any) => (
    asChild ? children : <div>{children}</div>
  ),
  CollapsibleContent: ({ children }: any) => <div>{children}</div>
}));

describe('SettingsPanel', () => {
  const defaultVoiceSettings: VoiceSettings = {
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    autoSpeak: true,
    selectedVoice: undefined
  };

  const mockOnVoiceSettingsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings panel with correct title in English', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('renders settings panel with correct title in Bangla', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="bn"
      />
    );

    expect(screen.getByText('সেটিংস')).toBeDefined();
  });

  it('displays voice speed slider with correct value', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    const slider = screen.getByRole('slider');
    expect(slider.value).toBe('0.9');
  });

  it('calls onVoiceSettingsChange when voice speed changes', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1.2' } });

    expect(mockOnVoiceSettingsChange).toHaveBeenCalledWith({
      ...defaultVoiceSettings,
      rate: 1.2
    });
  });

  it('displays auto-speak toggle with correct state', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle.checked).toBe(true);
  });

  it('calls onVoiceSettingsChange when auto-speak toggle changes', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(mockOnVoiceSettingsChange).toHaveBeenCalledWith({
      ...defaultVoiceSettings,
      autoSpeak: false
    });
  });

  it('displays correct labels in English', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    expect(screen.getByText('Voice Speed')).toBeDefined();
    expect(screen.getByText('Auto-speak')).toBeDefined();
    expect(screen.getByText('Voice Selection')).toBeDefined();
  });

  it('displays correct labels in Bangla', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="bn"
      />
    );

    expect(screen.getByText('কণ্ঠস্বরের গতি')).toBeDefined();
    expect(screen.getByText('স্বয়ংক্রিয় বক্তৃতা')).toBeDefined();
    expect(screen.getByText('কণ্ঠস্বর নির্বাচন')).toBeDefined();
  });

  it('shows voice speed value correctly formatted', () => {
    render(
      <SettingsPanel
        voiceSettings={{ ...defaultVoiceSettings, rate: 1.5 }}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    expect(screen.getByText('1.5x')).toBeDefined();
  });

  it('handles controlled open state', () => {
    const mockOnToggle = vi.fn();
    
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const collapsible = screen.getByTestId('collapsible');
    expect(collapsible.getAttribute('data-open')).toBe('true');
  });

  it('ensures minimum touch target size for mobile accessibility', () => {
    render(
      <SettingsPanel
        voiceSettings={defaultVoiceSettings}
        onVoiceSettingsChange={mockOnVoiceSettingsChange}
        language="en"
      />
    );

    // Check that the main trigger button has minimum 44px height
    const triggerButton = screen.getByRole('button');
    
    // The button should have minHeight and minWidth styles applied
    expect(triggerButton.style.minHeight).toBe('44px');
    expect(triggerButton.style.minWidth).toBe('44px');
  });
});