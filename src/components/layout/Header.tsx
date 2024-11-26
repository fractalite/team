import { FolderKanban } from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-6 w-6" />
          <h1 className="text-xl font-semibold">OpenAirships Team Flow</h1>
        </div>
        <div className="ml-auto">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}