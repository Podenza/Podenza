import { PageBody, PageHeader } from '@kit/ui/page';

import { SolicitudesDashboard } from './_components/solicitudes-dashboard';

export default function SolicitudesPage() {
  return (
    <>
      <PageHeader
        title="Solicitudes"
        description="Gestiona y monitorea todas tus solicitudes de crédito"
      />

      <PageBody>
        <SolicitudesDashboard />
      </PageBody>
    </>
  );
}