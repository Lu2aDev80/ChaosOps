import { prisma } from './db';
import type { Organisation } from '@prisma/client';

/**
 * Organisation Service
 * Provides methods to interact with organisations in the database
 */

export const organisationService = {
  /**
   * Get all organisations
   */
  async getAll(): Promise<Organisation[]> {
    return prisma.organisation.findMany({
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get a single organisation by ID
   */
  async getById(id: string): Promise<Organisation | null> {
    return prisma.organisation.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            dayPlans: true,
          },
        },
      },
    });
  },

  /**
   * Create a new organisation
   */
  async create(data: { name: string; description?: string }): Promise<Organisation> {
    return prisma.organisation.create({
      data,
    });
  },

  /**
   * Update an organisation
   */
  async update(id: string, data: { name?: string; description?: string }): Promise<Organisation> {
    return prisma.organisation.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete an organisation
   */
  async delete(id: string): Promise<Organisation> {
    return prisma.organisation.delete({
      where: { id },
    });
  },
};

/**
 * Example usage:
 * 
 * import { organisationService } from '@/services/organisationService';
 * 
 * // Get all organisations
 * const orgs = await organisationService.getAll();
 * 
 * // Create new organisation
 * const newOrg = await organisationService.create({
 *   name: "New Organisation",
 *   description: "Description here"
 * });
 * 
 * // Update organisation
 * const updated = await organisationService.update("org-id", {
 *   name: "Updated Name"
 * });
 */
