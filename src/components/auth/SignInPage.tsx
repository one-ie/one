/**
 * SignInPage - Complete sign-in page with providers
 *
 * This component wraps the SimpleSignInForm with AppProviders to ensure
 * the DataProvider context is available. This is necessary because of
 * Astro's islands architecture - each client:load directive creates an
 * isolated React tree.
 */

import { AppProviders } from '@/components/providers/AppProviders';
import { SimpleSignInForm } from './SimpleSignInForm';

export function SignInPage() {
  return (
    <AppProviders>
      <SimpleSignInForm />
    </AppProviders>
  );
}
