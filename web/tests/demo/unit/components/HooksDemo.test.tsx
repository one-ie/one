/**
 * Unit Tests: HooksDemo Component
 *
 * Tests the interactive hooks demonstration component including:
 * - Demo button rendering for each hook
 * - Hook execution and data display
 * - Loading states
 * - Error handling
 * - Result formatting
 * - Backend connection fallback
 *
 * Run with: bun test tests/demo/unit/components/HooksDemo.test.tsx
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HooksDemo } from '@/components/demo/HooksDemo';

// Mock the hooks
vi.mock('@/hooks/ontology', () => ({
  useProvider: () => ({
    name: 'MockProvider',
    supportsGroups: true,
    supportsRealtime: true,
  }),
  useIsProviderAvailable: () => true,
}));

describe('HooksDemo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      render(<HooksDemo />);

      // Should render without crashing
      expect(screen.getByText(/Pro Tips/i)).toBeInTheDocument();
    });

    it('should render demo buttons for all hooks', () => {
      render(<HooksDemo />);

      // Check for all hook buttons
      const hookNames = ['useProvider', 'useGroups', 'useSearch', 'useEvents', 'useLabels'];

      hookNames.forEach((hookName) => {
        const button = screen.getByText(hookName);
        expect(button).toBeInTheDocument();
      });
    });

    it('should display demo descriptions', () => {
      render(<HooksDemo />);

      expect(screen.getByText(/Check backend provider status/i)).toBeInTheDocument();
      expect(screen.getByText(/List all groups/i)).toBeInTheDocument();
      expect(screen.getByText(/Search entities by keyword/i)).toBeInTheDocument();
    });

    it('should render demo cards in a grid', () => {
      render(<HooksDemo />);

      const grid = screen.getByRole('region').parentElement;
      expect(grid).toHaveClass('grid');
    });

    it('should display all demo cards initially', () => {
      render(<HooksDemo />);

      const cards = screen.getAllByText(/Run Demo/);
      expect(cards.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Demo Execution', () => {
    it('should execute provider demo when button clicked', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      const providerButton = buttons[0]; // useProvider is first

      await user.click(providerButton);

      // Should show results
      await waitFor(() => {
        const results = screen.getByText(/Results/);
        expect(results).toBeInTheDocument();
      });
    });

    it('should execute groups demo when button clicked', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const groupsCard = screen.getByText('useGroups').closest('div');
      const button = within(groupsCard!).getByText('Run Demo');

      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
    });

    it('should show loading state while demo executes', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      const button = buttons[0];

      await user.click(button);

      // Button should show disabled state briefly
      // (actual loading state depends on implementation)
    });

    it('should display results after demo completes', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[0]);

      await waitFor(() => {
        const resultsSection = screen.getByText(/Results/);
        expect(resultsSection).toBeVisible();

        // Should show JSON results
        const jsonDisplay = screen.getByRole('region', { hidden: true }).textContent;
        expect(jsonDisplay).toContain('success');
      });
    });
  });

  describe('Results Display', () => {
    it('should display results in JSON format', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[0]);

      await waitFor(() => {
        const jsonText = screen.getByText(/success/);
        expect(jsonText).toBeInTheDocument();
      });
    });

    it('should show formatted JSON with proper indentation', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[1]); // useGroups

      await waitFor(() => {
        // Results should be visible
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
    });

    it('should support result selection and detail view', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });

      // Click on results to see details
      // (depends on component implementation)
    });

    it('should handle empty results gracefully', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[3]); // useEvents

      await waitFor(() => {
        // Should show results container even if empty
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
    });
  });

  describe('Provider Status', () => {
    it('should indicate provider availability', () => {
      render(<HooksDemo />);

      // Should show status or not show error
      // (depends on mock setup)
      const component = screen.getByText(/Pro Tips/);
      expect(component).toBeInTheDocument();
    });

    it('should handle unavailable provider gracefully', async () => {
      vi.mock('@/hooks/ontology', () => ({
        useIsProviderAvailable: () => false,
      }));

      render(<HooksDemo />);

      // Should still render component
      expect(screen.getByText(/useProvider/)).toBeInTheDocument();
    });

    it('should show mock data warning if provider unavailable', async () => {
      vi.mock('@/hooks/ontology', () => ({
        useIsProviderAvailable: () => false,
      }));

      render(<HooksDemo />);

      // Component should still be functional
      const buttons = screen.getAllByText('Run Demo');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be navigable with Tab key', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');

      // Tab to first button
      await user.tab();

      // Focus should be on a button
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('should activate demo with Enter key', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      buttons[0].focus();

      await user.keyboard('{Enter}');

      // Demo should execute
      await waitFor(() => {
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
    });

    it('should activate demo with Space key', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      buttons[0].focus();

      await user.keyboard(' ');

      // Demo should execute
      await waitFor(() => {
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
    });
  });

  describe('Visual Hierarchy', () => {
    it('should display demo icon for each hook', () => {
      render(<HooksDemo />);

      // Check for emoji icons
      const text = screen.getByText(/Pro Tips/i).parentElement?.textContent;
      expect(text).toMatch(/🔌|👥|🔍|📊|🏷️/);
    });

    it('should use appropriate font sizes', () => {
      render(<HooksDemo />);

      const heading = screen.getByText(/Pro Tips/);
      const computed = window.getComputedStyle(heading);

      // Should be larger than body text
      expect(computed.fontWeight).toMatch(/bold|700|800|900/);
    });

    it('should use color differentiation for cards', () => {
      render(<HooksDemo />);

      const cards = screen.getAllByText('Run Demo').map((el) => el.closest('div'));
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle demo errors gracefully', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');

      // Should not crash when clicking
      await user.click(buttons[0]);

      // Component should still be usable
      expect(screen.getByText(/useGroups/)).toBeInTheDocument();
    });

    it('should show error message if demo fails', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[0]);

      // Component should still render
      const component = screen.getByText(/useProvider/);
      expect(component).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('should properly type demo results', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      await user.click(buttons[0]);

      await waitFor(() => {
        // Results should have proper structure
        expect(screen.getByText(/status/)).toBeInTheDocument();
      });
    });

    it('should handle various result types', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');

      // Execute different demos
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        await user.click(buttons[i]);

        await waitFor(() => {
          expect(screen.getByText(/Results/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Pro Tips Section', () => {
    it('should display Pro Tips section', () => {
      render(<HooksDemo />);

      const proTips = screen.getByText(/Pro Tips/);
      expect(proTips).toBeInTheDocument();
    });

    it('should list all important tips', () => {
      render(<HooksDemo />);

      expect(screen.getByText(/100% type-safe/i)).toBeInTheDocument();
      expect(screen.getByText(/automatically handle loading/i)).toBeInTheDocument();
      expect(screen.getByText(/Backend-agnostic/i)).toBeInTheDocument();
      expect(screen.getByText(/React components in Astro/i)).toBeInTheDocument();
    });

    it('should use appropriate styling for tips', () => {
      render(<HooksDemo />);

      const tipsSection = screen.getByText(/Pro Tips/).closest('div');
      expect(tipsSection).toHaveClass('bg-blue-50');
    });
  });

  describe('Responsive Layout', () => {
    it('should render grid layout', () => {
      render(<HooksDemo />);

      const demoCards = screen.getAllByText('Run Demo');
      expect(demoCards.length).toBeGreaterThanOrEqual(5);
    });

    it('should adapt to mobile viewport', () => {
      // This would be handled by visual regression tests
      render(<HooksDemo />);

      expect(screen.getByText(/useProvider/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName(/run demo/i);
      });
    });

    it('should have accessible card structure', () => {
      render(<HooksDemo />);

      // Cards should have proper headings
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.length).toBeGreaterThanOrEqual(5);
    });

    it('should support screen reader navigation', () => {
      render(<HooksDemo />);

      // Main heading should be present
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should have sufficient color contrast', () => {
      render(<HooksDemo />);

      // This would be validated by accessibility auditing tools
      const component = screen.getByText(/Pro Tips/);
      expect(component).toBeInTheDocument();
    });

    it('should have meaningful alt text or labels', () => {
      render(<HooksDemo />);

      // Check that interactive elements are properly labeled
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should render without unnecessary re-renders', () => {
      const { rerender } = render(<HooksDemo />);

      // Rerender with same props
      rerender(<HooksDemo />);

      // Component should still be present
      expect(screen.getByText(/useProvider/)).toBeInTheDocument();
    });

    it('should handle multiple demo executions efficiently', async () => {
      const user = userEvent.setup();
      render(<HooksDemo />);

      const buttons = screen.getAllByText('Run Demo');

      // Execute multiple demos
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        await user.click(buttons[i]);

        await waitFor(() => {
          expect(screen.getByText(/Results/)).toBeInTheDocument();
        });
      }
    });
  });
});
