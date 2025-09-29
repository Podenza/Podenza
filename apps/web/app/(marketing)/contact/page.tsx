import { PageBody, PageHeader } from '@kit/ui/page';

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contacto"
        description="Ponte en contacto con el equipo de PODENZA"
      />

      <PageBody>
        <div className="container mx-auto max-w-2xl py-8">
          <div className="bg-card rounded-lg border p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">¡Hablemos!</h2>
            <p className="text-muted-foreground mb-6">
              Estamos aquí para ayudarte a impulsar la colaboración y el dinamismo en tu empresa.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">contacto@podenza.com</p>
              </div>

              <div>
                <h3 className="font-semibold">Teléfono</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>

              <div>
                <h3 className="font-semibold">Horario de Atención</h3>
                <p className="text-muted-foreground">Lunes a Viernes, 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}