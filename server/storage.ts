import { programmes, projets, type Programme, type InsertProgramme, type Projet, type InsertProjet } from "@shared/schema";

export interface IStorage {
  // Programmes
  getProgrammes(): Promise<Programme[]>;
  getProgramme(id: number): Promise<Programme | undefined>;
  createProgramme(programme: InsertProgramme): Promise<Programme>;
  updateProgramme(id: number, programme: Partial<InsertProgramme>): Promise<Programme | undefined>;
  deleteProgramme(id: number): Promise<boolean>;
  
  // Projets
  getProjets(): Promise<Projet[]>;
  getProjet(id: number): Promise<Projet | undefined>;
  getProjetsByProgramme(programmeId: number): Promise<Projet[]>;
  createProjet(projet: InsertProjet): Promise<Projet>;
  updateProjet(id: number, projet: Partial<InsertProjet>): Promise<Projet | undefined>;
  deleteProjet(id: number): Promise<boolean>;
  
  // Users (existing)
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private programmes: Map<number, Programme>;
  private projets: Map<number, Projet>;
  private users: Map<number, any>;
  private currentProgrammeId: number;
  private currentProjetId: number;
  private currentUserId: number;

  constructor() {
    this.programmes = new Map();
    this.projets = new Map();
    this.users = new Map();
    this.currentProgrammeId = 1;
    this.currentProjetId = 1;
    this.currentUserId = 1;
  }

  // Programmes methods
  async getProgrammes(): Promise<Programme[]> {
    return Array.from(this.programmes.values());
  }

  async getProgramme(id: number): Promise<Programme | undefined> {
    return this.programmes.get(id);
  }

  async createProgramme(insertProgramme: InsertProgramme): Promise<Programme> {
    const id = this.currentProgrammeId++;
    const now = new Date();
    const programme: Programme = {
      ...insertProgramme,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.programmes.set(id, programme);
    return programme;
  }

  async updateProgramme(id: number, updateData: Partial<InsertProgramme>): Promise<Programme | undefined> {
    const existingProgramme = this.programmes.get(id);
    if (!existingProgramme) return undefined;

    const updatedProgramme: Programme = {
      ...existingProgramme,
      ...updateData,
      updatedAt: new Date(),
    };
    this.programmes.set(id, updatedProgramme);
    return updatedProgramme;
  }

  async deleteProgramme(id: number): Promise<boolean> {
    // Also delete associated projets
    const projetsToDelete = Array.from(this.projets.values()).filter(p => p.programmeId === id);
    projetsToDelete.forEach(projet => this.projets.delete(projet.id));
    
    return this.programmes.delete(id);
  }

  // Projets methods
  async getProjets(): Promise<Projet[]> {
    return Array.from(this.projets.values());
  }

  async getProjet(id: number): Promise<Projet | undefined> {
    return this.projets.get(id);
  }

  async getProjetsByProgramme(programmeId: number): Promise<Projet[]> {
    return Array.from(this.projets.values()).filter(p => p.programmeId === programmeId);
  }

  async createProjet(insertProjet: InsertProjet): Promise<Projet> {
    const id = this.currentProjetId++;
    const now = new Date();
    const projet: Projet = {
      ...insertProjet,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projets.set(id, projet);
    return projet;
  }

  async updateProjet(id: number, updateData: Partial<InsertProjet>): Promise<Projet | undefined> {
    const existingProjet = this.projets.get(id);
    if (!existingProjet) return undefined;

    const updatedProjet: Projet = {
      ...existingProjet,
      ...updateData,
      updatedAt: new Date(),
    };
    this.projets.set(id, updatedProjet);
    return updatedProjet;
  }

  async deleteProjet(id: number): Promise<boolean> {
    return this.projets.delete(id);
  }

  // Users methods (existing)
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
