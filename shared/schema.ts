import { pgTable, text, serial, integer, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  provinces: jsonb("provinces").$type<string[]>(),
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
  montantGlobal: z.string().optional(),
  participationRegion: z.string().optional(),
}).refine(
  (data) => {
    if (!data.participationRegion || !data.montantGlobal) return true;
    const participation = parseFloat(data.participationRegion);
    const montant = parseFloat(data.montantGlobal);
    return participation <= montant;
  },
  {
    message: "La contribution de la région ne peut pas dépasser le montant total",
    path: ["participationRegion"]
  }
);

// Provinces de la région Souss-Massa
export const PROVINCES = [
  "Agadir-Ida-Ou-Tanane",
  "Chtouka-Aït Baha",
  "Inezgane-Aït Melloul",
  "Taroudant",
  "Tiznit",
  "Tata"
] as const;

export const insertProjetSchema = createInsertSchema(projets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateDebut: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
    z.undefined()
  ]).optional(),
  provinces: z.array(z.string()).optional(),
  objectifs: z.string().optional(),
  partenaires: z.string().optional(),
  montantGlobal: z.string().optional(),
  participationRegion: z.string().optional(),
  maitreOuvrage: z.string().optional(),
  communes: z.string().optional(),
  indicateursQualitatifs: z.string().optional(),
  indicateursQuantitatifs: z.string().optional(),
  etatAvancement: z.string(),
  remarques: z.string().optional(),
  duree: z.string().optional(),
}).refine(
  (data) => {
    if (!data.participationRegion || !data.montantGlobal) return true;
    const participation = parseFloat(data.participationRegion);
    const montant = parseFloat(data.montantGlobal);
    return participation <= montant;
  },
  {
    message: "La contribution de la région ne peut pas dépasser le montant total",
    path: ["participationRegion"]
  }
);

export type InsertProgramme = z.infer<typeof insertProgrammeSchema>;
export type Programme = typeof programmes.$inferSelect;
export type InsertProjet = z.infer<typeof insertProjetSchema>;
export type Projet = typeof projets.$inferSelect;

// Secteurs constants
export const SECTEURS = [
  "Agriculture",
  "Aquaculture", 
  "Tourisme",
  "Industrie",
  "Logistique",
  "Pêche maritime",
  "Artisanat",
  "Emploi",
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
