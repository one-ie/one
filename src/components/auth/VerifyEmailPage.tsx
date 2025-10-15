import { AppProviders } from '@/components/providers/AppProviders';
import { VerifyEmailForm } from './VerifyEmailForm';

export function VerifyEmailPage({ token }: { token: string }) {
  return (
    <AppProviders>
      <VerifyEmailForm token={token} />
    </AppProviders>
  );
}
