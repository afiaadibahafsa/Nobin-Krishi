import { render } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import { describe, test, expect, vi } from 'vitest';
import * as fc from 'fast-check';

describe('ChatMessage Property Tests', () => {
  // **Feature: voice-ai-chat, Property 8: Message display formatting**
  test('Property 8: Message display formatting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('user', 'assistant'), // Generate either user or assistant role
        fc.constantFrom('bn', 'en'), // Generate either 'bn' or 'en' language
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // Generate random non-empty message content
        (role: 'user' | 'assistant', language: 'bn' | 'en', content: string) => {
          // Create a test message
          const testMessage = {
            id: `test-${Date.now()}`,
            role,
            content,
            timestamp: new Date(),
            language
          };

          // Render the ChatMessage component
          const { container } = render(
            <ChatMessage 
              message={testMessage}
              onReplay={vi.fn()}
            />
          );

          // Get the message container
          const messageContainer = container.querySelector('.flex');
          expect(messageContainer).toBeTruthy();

          // Verify the property: For any chat message, user messages should appear on the right with blue background and AI messages on the left with green background
          if (role === 'user') {
            // User messages should be on the right (justify-end)
            expect(messageContainer?.className).toContain('justify-end');
            
            // User messages should have blue background
            const messageBubble = container.querySelector('.rounded-2xl');
            expect(messageBubble).toBeTruthy();
            expect(messageBubble?.className).toContain('bg-[#3B82F6]'); // Blue background
            expect(messageBubble?.className).toContain('text-white');
          } else if (role === 'assistant') {
            // AI messages should be on the left (justify-start)
            expect(messageContainer?.className).toContain('justify-start');
            
            // AI messages should have green background
            const messageBubble = container.querySelector('.rounded-2xl');
            expect(messageBubble).toBeTruthy();
            expect(messageBubble?.className).toContain('bg-[#2ECC71]'); // Green background
            expect(messageBubble?.className).toContain('text-white');
          }

          // Verify message content is displayed
          expect(container.textContent).toContain(content);
          
          // Verify timestamp is displayed
          const timestampElement = container.querySelector('.text-xs');
          expect(timestampElement).toBeTruthy();
          
          // Verify language flag is displayed
          const expectedFlag = language === 'bn' ? '🇧🇩' : '🇬🇧';
          expect(container.textContent).toContain(expectedFlag);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  // **Feature: voice-ai-chat, Property 9: Message content completeness**
  test('Property 9: Message content completeness', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('user', 'assistant'), // Generate either user or assistant role
        fc.constantFrom('bn', 'en'), // Generate either 'bn' or 'en' language
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), // Generate random non-empty message content
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), // Generate random timestamp
        (role: 'user' | 'assistant', language: 'bn' | 'en', content: string, timestamp: Date) => {
          // Create a test message
          const testMessage = {
            id: `test-${Date.now()}-${Math.random()}`,
            role,
            content,
            timestamp,
            language
          };

          // Mock onReplay function to test replay button functionality
          const mockOnReplay = vi.fn();

          // Render the ChatMessage component
          const { container } = render(
            <ChatMessage 
              message={testMessage}
              onReplay={mockOnReplay}
            />
          );

          // Verify the property: For any displayed message, it should include text content, timestamp, language indicator, and replay button (for AI messages)
          
          // 1. Verify text content is displayed
          expect(container.textContent).toContain(content);
          
          // 2. Verify timestamp is displayed
          const expectedTimestamp = timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          expect(container.textContent).toContain(expectedTimestamp);
          
          // 3. Verify language indicator is displayed
          const expectedFlag = language === 'bn' ? '🇧🇩' : '🇬🇧';
          expect(container.textContent).toContain(expectedFlag);
          
          // 4. Verify replay button is present for AI messages only
          const replayButton = container.querySelector('button[title*="Replay"], button[title*="আবার"]');
          
          if (role === 'assistant') {
            // AI messages should have a replay button
            expect(replayButton).toBeTruthy();
            expect(replayButton?.textContent).toMatch(/(Replay|আবার)/);
            
            // Verify the replay button has the correct title based on language
            const expectedTitle = language === 'bn' ? 'আবার শুনুন' : 'Replay';
            expect(replayButton?.getAttribute('title')).toBe(expectedTitle);
            
            // Verify the replay button text matches the language
            const expectedButtonText = language === 'bn' ? 'আবার' : 'Replay';
            expect(replayButton?.textContent).toContain(expectedButtonText);
          } else {
            // User messages should not have a replay button
            expect(replayButton).toBeNull();
          }
          
          // 5. Verify message structure includes all required elements
          const messageBubble = container.querySelector('.rounded-2xl');
          expect(messageBubble).toBeTruthy();
          
          // Verify message footer with timestamp and language exists
          const messageFooter = container.querySelector('.border-t');
          expect(messageFooter).toBeTruthy();
          
          // Verify timestamp element exists
          const timestampElement = container.querySelector('.text-xs');
          expect(timestampElement).toBeTruthy();
          
          // 6. Verify avatar is present
          const avatar = container.querySelector('.w-8.h-8.rounded-full');
          expect(avatar).toBeTruthy();
          
          // Verify correct icon in avatar based on role
          if (role === 'user') {
            // User messages should have User icon - look for the lucide-user class
            const userIcon = container.querySelector('.lucide-user');
            expect(userIcon).toBeTruthy();
          } else {
            // AI messages should have Bot icon - look for the lucide-bot class
            const botIcon = container.querySelector('.lucide-bot');
            expect(botIcon).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});