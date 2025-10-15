import { AppProviders } from '@/components/providers/AppProviders';
import { SimpleSignUpForm } from './SimpleSignUpForm';

export function SignUpPage() {
  return (
    <AppProviders>
      <SimpleSignUpForm />
    </AppProviders>
  );
}
