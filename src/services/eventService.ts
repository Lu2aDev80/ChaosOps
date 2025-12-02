import { prisma } from './db';
import type { Event, DayPlan } from '@prisma/client';

/**
 * Event Service
 * Provides methods to interact with events and day plans
 */

export const eventService = {
  /**
   * Get all events for an organisation
   */
  async getByOrganisation(organisationId: string) {
    return prisma.event.findMany({
      where: { organisationId },
      include: {
        dayPlans: {
          include: {
            scheduleItems: {
              orderBy: { position: 'asc' },
            },
          },
        },
        organisation: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get a single event with all related data
   */
  async getById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        dayPlans: {
          include: {
            scheduleItems: {
              orderBy: { position: 'asc' },
            },
          },
        },
        organisation: true,
      },
    });
  },

  /**
   * Create a new event
   */
  async create(data: {
    name: string;
    description?: string;
    organisationId: string;
  }): Promise<Event> {
    return prisma.event.create({
      data,
    });
  },

  /**
   * Update an event
   */
  async update(
    id: string,
    data: { name?: string; description?: string }
  ): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete an event
   */
  async delete(id: string): Promise<Event> {
    return prisma.event.delete({
      where: { id },
    });
  },
};

export const dayPlanService = {
  /**
   * Get all day plans for an event
   */
  async getByEvent(eventId: string) {
    return prisma.dayPlan.findMany({
      where: { eventId },
      include: {
        scheduleItems: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });
  },

  /**
   * Get a single day plan
   */
  async getById(id: string) {
    return prisma.dayPlan.findUnique({
      where: { id },
      include: {
        scheduleItems: {
          orderBy: { position: 'asc' },
        },
        event: {
          include: {
            organisation: true,
          },
        },
      },
    });
  },

  /**
   * Create a new day plan
   */
  async create(data: {
    name: string;
    date: string;
    eventId: string;
  }): Promise<DayPlan> {
    return prisma.dayPlan.create({
      data,
    });
  },

  /**
   * Update a day plan
   */
  async update(
    id: string,
    data: { name?: string; date?: string }
  ): Promise<DayPlan> {
    return prisma.dayPlan.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a day plan
   */
  async delete(id: string): Promise<DayPlan> {
    return prisma.dayPlan.delete({
      where: { id },
    });
  },

  /**
   * Add a schedule item to a day plan
   */
  async addScheduleItem(
    dayPlanId: string,
    data: {
      time: string;
      type: 'session' | 'workshop' | 'break' | 'announcement' | 'game' | 'transition';
      title: string;
      speaker?: string;
      location?: string;
      details?: string;
      materials?: string;
      duration?: string;
      snacks?: string;
      facilitator?: string;
      position: number;
    }
  ) {
    return prisma.scheduleItem.create({
      data: {
        ...data,
        dayPlanId,
      },
    });
  },

  /**
   * Update a schedule item
   */
  async updateScheduleItem(
    id: number,
    data: {
      time?: string;
      title?: string;
      position?: number;
      [key: string]: any;
    }
  ) {
    return prisma.scheduleItem.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a schedule item
   */
  async deleteScheduleItem(id: number) {
    return prisma.scheduleItem.delete({
      where: { id },
    });
  },

  /**
   * Reorder schedule items
   */
  async reorderScheduleItems(itemIds: number[]) {
    const updates = itemIds.map((itemId, index) =>
      prisma.scheduleItem.update({
        where: { id: itemId },
        data: { position: index },
      })
    );

    return prisma.$transaction(updates);
  },
};

/**
 * Example usage:
 * 
 * import { eventService, dayPlanService } from '@/services/eventService';
 * 
 * // Get events for an organisation
 * const events = await eventService.getByOrganisation("org-id");
 * 
 * // Create a new event
 * const event = await eventService.create({
 *   name: "Konfi Day 2024",
 *   description: "Annual event",
 *   organisationId: "org-id"
 * });
 * 
 * // Create a day plan
 * const dayPlan = await dayPlanService.create({
 *   name: "Day 1",
 *   date: "2024-12-01",
 *   eventId: event.id
 * });
 * 
 * // Add schedule items
 * await dayPlanService.addScheduleItem(dayPlan.id, {
 *   time: "09:00",
 *   type: "session",
 *   title: "Welcome Session",
 *   speaker: "John Doe",
 *   position: 0
 * });
 */
