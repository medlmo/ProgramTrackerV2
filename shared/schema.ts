import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const programmes = pgTable("programmes", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  secteur: text("secteur").notNull(),
  objectifGlobal: text("objectif_global"),
  partenaires: text("partenaires"),
  montantGlobal: decimal("montant_global", { precision: 12, scale: 2 }),
  participationRegion: decimal("participation_region", { precision: 12, scale: 2 }),
  dateDebut: timestamp("date_debut"),
  duree: text("duree"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projets = pgTable("projets", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  programmeId: integer("programme_id").references(() => programmes.id).notNull(),
  objectifs: text("objectifs"),
  partenaires: text("partenaires"),
  montantGlobal: decimal("montant_global", { precision: 12, scale: 2 }),
  participationRegion: decimal("participation_region", { precision: 12, scale: 2 }),
  maitreOuvrage: text("maitre_ouvrage"),
  provinces: text("provinces"),
  communes: text("communes"),
  indicateursQualitatifs: text("indicateurs_qualitatifs"),
  indicateursQuantitatifs: text("indicateurs_quantitatifs"),
  etatAvancement: text("etat_avancement").notNull(),
  remarques: text("remarques"),
  dateDebut: timestamp("date_debut"),
  duree: text("duree"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProgrammeSchema = createInsertSchema(programmes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateDebut: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
    z.undefined()
  ]).optional(),
});

export const insertProjetSchema = createInsertSchema(projets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateDebut: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export type InsertProgramme = z.infer<typeof insertProgrammeSchema>;
export type Programme = typeof programmes.$inferSelect;
export type InsertProjet = z.infer<typeof insertProjetSchema>;
export type Projet = typeof projets.$inferSelect;

// Secteurs constants
export const SECTEURS = [
  "Agriculture",
  "Industrie", 
  "Tourisme",
  "Artisanat",
  "Services",
  "Infrastructure",
  "Formation"
] as const;

// États d'avancement constants
export const ETATS_AVANCEMENT = [
  "Planifié",
  "En cours",
  "Terminé",
  "Suspendu"
] as const;
