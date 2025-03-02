import { Sidebar } from '@/components/sidebar';
import { ReduxProvider } from '@/lib/redux-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar className="lg:w-64 border-r" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
