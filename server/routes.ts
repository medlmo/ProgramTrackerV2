import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgrammeSchema, insertProjetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Programmes routes
  app.get("/api/programmes", async (req, res) => {
    try {
      const programmes = await storage.getProgrammes();
      res.json(programmes);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des programmes" });
    }
  });

  app.get("/api/programmes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const programme = await storage.getProgramme(id);
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      res.json(programme);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du programme" });
    }
  });

  app.post("/api/programmes", async (req, res) => {
    try {
      const validatedData = insertProgrammeSchema.parse(req.body);
      const programme = await storage.createProgramme(validatedData);
      res.status(201).json(programme);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la création du programme" });
    }
  });

  app.put("/api/programmes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProgrammeSchema.partial().parse(req.body);
      const programme = await storage.updateProgramme(id, validatedData);
      if (!programme) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      res.json(programme);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour du programme" });
    }
  });

  app.delete("/api/programmes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProgramme(id);
      if (!deleted) {
        return res.status(404).json({ message: "Programme non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du programme" });
    }
  });

  // Projets routes
  app.get("/api/projets", async (req, res) => {
    try {
      const { programmeId } = req.query;
      let projets;
      
      if (programmeId) {
        projets = await storage.getProjetsByProgramme(parseInt(programmeId as string));
      } else {
        projets = await storage.getProjets();
      }
      
      res.json(projets);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des projets" });
    }
  });

  app.get("/api/projets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projet = await storage.getProjet(id);
      if (!projet) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }
      res.json(projet);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du projet" });
    }
  });

  app.post("/api/projets", async (req, res) => {
    try {
      const validatedData = insertProjetSchema.parse(req.body);
      const projet = await storage.createProjet(validatedData);
      res.status(201).json(projet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la création du projet" });
    }
  });

  app.put("/api/projets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjetSchema.partial().parse(req.body);
      const projet = await storage.updateProjet(id, validatedData);
      if (!projet) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }
      res.json(projet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour du projet" });
    }
  });

  app.delete("/api/projets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProjet(id);
      if (!deleted) {
        return res.status(404).json({ message: "Projet non trouvé" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du projet" });
    }
  });

  // Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const programmes = await storage.getProgrammes();
      const projets = await storage.getProjets();
      
      const totalProgrammes = programmes.length;
      const totalProjets = projets.length;
      const projetsActifs = projets.filter(p => p.etatAvancement === "En cours").length;
      
      const totalBudget = programmes.reduce((sum, p) => sum + parseFloat(p.montantGlobal), 0);
      const totalParticipation = programmes.reduce((sum, p) => sum + parseFloat(p.participationRegion), 0);
      
      res.json({
        totalProgrammes,
        totalProjets,
        projetsActifs,
        totalBudget,
        totalParticipation
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
