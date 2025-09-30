import { PageBody, PageHeader } from '@kit/ui/page';

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Solicitudes"
        description="Gestiona y monitorea todas tus solicitudes de crédito"
      />

      <PageBody>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}