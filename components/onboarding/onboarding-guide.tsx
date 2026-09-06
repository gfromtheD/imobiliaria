import Link from "next/link";
import { Building2, Camera, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OnboardingGuide() {
  const steps = [
    {
      step: "1",
      title: "Crea tu propiedad",
      description: "Define el inmueble y su ubicación para organizar sus estancias.",
      icon: Building2,
      active: true,
    },
    {
      step: "2",
      title: "Sube fotos de estancias vacías",
      description: "Añade habitaciones (salón, dormitorio, cocina...) con fotos originales.",
      icon: Camera,
      active: false,
    },
    {
      step: "3",
      title: "Genera el Staging con IA",
      description: "Elige un estilo (nórdico, moderno...) y obtén la transformación en segundos.",
      icon: Sparkles,
      active: false,
    },
  ];

  return (
    <Card className="border-primary/20 bg-linear-to-b from-card to-muted/30">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-semibold">
          ¡Te damos la bienvenida a Virtual Staging!
        </CardTitle>
        <CardDescription className="max-w-xl mx-auto text-sm text-muted-foreground">
          Transforma habitaciones vacías en espacios decorados y atractivos en 3 sencillos pasos.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col items-center p-4 text-center rounded-lg border bg-card/60 shadow-xs"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted font-bold text-sm text-foreground">
                  {item.step}
                </div>
                <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/properties/new">
            <Button size="lg" className="gap-2">
              Comenzar: Crear primera propiedad
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
