import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const programmes = pgTable("programmes", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  secteur: text("secteur").notNull(),
  objectifGlobal: text("objectif_global").notNull(),
  partenaires: text("partenaires"),
  montantGlobal: decimal("montant_global", { precision: 12, scale: 2 }).notNull(),
  participationRegion: decimal("participation_region", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projets = pgTable("projets", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  programmeId: integer("programme_id").references(() => programmes.id).notNull(),
  objectifs: text("objectifs").notNull(),
  partenaires: text("partenaires"),
  montantGlobal: decimal("montant_global", { precision: 12, scale: 2 }).notNull(),
  participationRegion: decimal("participation_region", { precision: 12, scale: 2 }).notNull(),
  maitreOuvrage: text("maitre_ouvrage").notNull(),
  provinces: text("provinces").notNull(),
  communes: text("communes").notNull(),
  indicateursQualitatifs: text("indicateurs_qualitatifs"),
  indicateursQuantitatifs: text("indicateurs_quantitatifs"),
  etatAvancement: text("etat_avancement").notNull(),
  remarques: text("remarques"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProgrammeSchema = createInsertSchema(programmes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjetSchema = createInsertSchema(projets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
