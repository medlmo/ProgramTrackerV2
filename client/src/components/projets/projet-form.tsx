import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProjet, useUpdateProjet } from "@/hooks/use-projets";
import { insertProjetSchema, ETATS_AVANCEMENT, type InsertProjet, type Projet, type Programme } from "@shared/schema";
import { Save, X } from "lucide-react";

interface ProjetFormProps {
  projet?: Projet | null;
  programmes: Programme[];
  onClose: () => void;
}

export default function ProjetForm({ projet, programmes, onClose }: ProjetFormProps) {
  const createProjet = useCreateProjet();
  const updateProjet = useUpdateProjet();

  const form = useForm<InsertProjet>({
    resolver: zodResolver(insertProjetSchema),
    defaultValues: {
      nom: projet?.nom || "",
      programmeId: projet?.programmeId || 0,
      objectifs: projet?.objectifs || "",
      partenaires: projet?.partenaires || "",
      montantGlobal: projet?.montantGlobal || "0",
      participationRegion: projet?.participationRegion || "0",
      maitreOuvrage: projet?.maitreOuvrage || "",
      provinces: projet?.provinces || "",
      communes: projet?.communes || "",
      indicateursQualitatifs: projet?.indicateursQualitatifs || "",
      indicateursQuantitatifs: projet?.indicateursQuantitatifs || "",
      etatAvancement: projet?.etatAvancement || "",
      remarques: projet?.remarques || "",
      dateDebut: projet?.dateDebut || undefined,
      duree: projet?.duree || "",
    },
  });

  const onSubmit = async (data: InsertProjet) => {
    try {
      if (projet) {
        await updateProjet.mutateAsync({ id: projet.id, data });
      } else {
        await createProjet.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const isSubmitting = createProjet.isPending || updateProjet.isPending;

  // Calculate participation percentage
  const montantGlobal = parseFloat(form.watch("montantGlobal") || "0");
  const participationRegion = parseFloat(form.watch("participationRegion") || "0");
  const percentage = montantGlobal > 0 ? ((participationRegion / montantGlobal) * 100).toFixed(1) : "0";

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          {projet ? "Modifier le Projet" : "Nouveau Projet"}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nom du Projet <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du projet..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="programmeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Programme <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un programme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {programmes.map((programme) => (
                        <SelectItem key={programme.id} value={programme.id.toString()}>
                          {programme.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="etatAvancement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    État d'Avancement <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un état" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ETATS_AVANCEMENT.map((etat) => (
                        <SelectItem key={etat} value={etat}>
                          {etat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="objectifs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Objectifs <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Décrivez les objectifs du projet..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="montantGlobal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Montant Global (MAD) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participationRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Participation Région (MAD) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  {montantGlobal > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Participation: {percentage}% du montant global
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maitreOuvrage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Maître d'Ouvrage
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Maître d'ouvrage..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provinces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Provinces
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Provinces concernées..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="communes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Communes
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Communes concernées..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="partenaires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partenaires</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Listez les partenaires du projet..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="indicateursQualitatifs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indicateurs Qualitatifs</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Indicateurs qualitatifs..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="indicateursQuantitatifs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indicateurs Quantitatifs</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Indicateurs quantitatifs..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateDebut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de Début</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? (typeof field.value === 'string' ? field.value : new Date(field.value).toISOString().split('T')[0]) : ''}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 2 ans, 18 mois..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="remarques"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarques</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Remarques additionnelles..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn-primary">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
