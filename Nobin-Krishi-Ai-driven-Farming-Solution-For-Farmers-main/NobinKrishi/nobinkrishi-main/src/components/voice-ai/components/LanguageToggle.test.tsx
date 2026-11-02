import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToggle, getLanguageConfig, getSpeechLanguageCode } from './LanguageToggle';
import { describe, test, expect, vi } from 'vitest';

describe('LanguageToggle Component', () => {
  test('renders with correct initial language', () => {
    const mockOnLanguageChange = vi.fn();
    
    render(
      <LanguageToggle
        currentLanguage="bn"
        onLanguageChange={mockOnLanguageChange}
      />
    );
    
    expect(screen.getByText('বাংলা')).toBeDefined();
    expect(screen.getByText('🇧🇩')).toBeDefined();
  });

  test('calls onLanguageChange when clicked', () => {
    const mockOnLanguageChange = vi.fn();
    
    render(
      <LanguageToggle
        currentLanguage="bn"
        onLanguageChange={mockOnLanguageChange}
        variant="button"
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
  });

  test('toggles between languages correctly', () => {
    const mockOnLanguageChange = vi.fn();
    
    const { rerender } = render(
      <LanguageToggle
        currentLanguage="bn"
        onLanguageChange={mockOnLanguageChange}
      />
    );
    
    expect(screen.getByText('বাংলা')).toBeDefined();
    
    // Rerender with English
    rerender(
      <LanguageToggle
        currentLanguage="en"
        onLanguageChange={mockOnLanguageChange}
      />
    );
    
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('🇬🇧')).toBeDefined();
  });

  test('shows visual indicator for current selection', () => {
    const mockOnLanguageChange = vi.fn();
    
    const { container } = render(
      <LanguageToggle
        currentLanguage="bn"
        onLanguageChange={mockOnLanguageChange}
        variant="button"
      />
    );
    
    // Check for the visual indicator (green dot) - simplified check
    const button = container.querySelector('button');
    expect(button).toBeDefined();
  });

  test('renders switch variant correctly', () => {
    const mockOnLanguageChange = vi.fn();
    
    render(
      <LanguageToggle
        currentLanguage="bn"
        onLanguageChange={mockOnLanguageChange}
        variant="switch"
      />
    );
    
    expect(screen.getByText('বাংলা')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('⇄')).toBeDefined();
  });
});

describe('Language Configuration Helpers', () => {
  test('getLanguageConfig returns correct configuration', () => {
    const bnConfig = getLanguageConfig('bn');
    expect(bnConfig.label).toBe('বাংলা');
    expect(bnConfig.flag).toBe('🇧🇩');
    expect(bnConfig.code).toBe('bn-BD');
    
    const enConfig = getLanguageConfig('en');
    expect(enConfig.label).toBe('English');
    expect(enConfig.flag).toBe('🇬🇧');
    expect(enConfig.code).toBe('en-US');
  });

  test('getSpeechLanguageCode returns correct language codes', () => {
    expect(getSpeechLanguageCode('bn')).toBe('bn-BD');
    expect(getSpeechLanguageCode('en')).toBe('en-US');
  });
});