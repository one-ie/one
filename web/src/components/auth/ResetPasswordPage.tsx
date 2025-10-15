import { AppProviders } from '@/components/providers/AppProviders';
import { ResetPasswordForm } from './ResetPasswordForm';

export function ResetPasswordPage({ token }: { token: string }) {
  return (
    <AppProviders>
      <ResetPasswordForm token={token} />
    </AppProviders>
  );
}
