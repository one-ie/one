import { AppProviders } from '@/components/providers/AppProviders';
import { RequestMagicLinkForm } from './RequestMagicLinkForm';
import { MagicLinkAuth } from './MagicLinkAuth';

export function MagicLinkPage({ token }: { token?: string | null }) {
  return (
    <AppProviders>
      {token ? (
        <MagicLinkAuth token={token} />
      ) : (
        <RequestMagicLinkForm />
      )}
    </AppProviders>
  );
}
