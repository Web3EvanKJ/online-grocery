'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sections } from '@/lib/types/adminDashboard/adminDashboard';

export default function PageAdminDashboard({ role }: { role: string }) {
  const isSuperAdmin = role === 'super_admin';
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-semibold text-sky-700">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections
            .filter((section) => !section.superAdmin || isSuperAdmin)
            .map((section) => (
              <Card
                key={section.title}
                className="rounded-sm border border-sky-200 bg-white transition hover:border-sky-400 hover:bg-sky-50"
              >
                <CardHeader className="flex min-h-20 flex-row items-center gap-3 pb-2">
                  {section.icon}
                  <div>
                    <CardTitle className="text-lg font-medium text-sky-700">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {section.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    onClick={() => router.push(section.href)}
                    className="mt-3 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                  >
                    Go to {section.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
