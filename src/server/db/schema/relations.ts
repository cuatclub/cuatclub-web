import { relations } from "drizzle-orm";
import { user } from "./user";
import { affiliations } from "./affiliations";
import { categories } from "./categories";
import { clubs } from "./clubs";
import { clubCategories } from "./club-categories";
import { activities } from "./activities";
import { activityTypes } from "./activity-types";
import { activityCategories } from "./activity-categories";

export const affiliationsRelations = relations(affiliations, ({ many }) => ({
  clubs: many(clubs),
  activities: many(activities),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  clubCategories: many(clubCategories),
  activityCategories: many(activityCategories),
}));

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  user: one(user, {
    fields: [clubs.userId],
    references: [user.id],
  }),
  affiliation: one(affiliations, {
    fields: [clubs.affiliationId],
    references: [affiliations.id],
  }),
  categories: many(clubCategories),
  activities: many(activities),
}));

export const clubCategoriesRelations = relations(clubCategories, ({ one }) => ({
  club: one(clubs, {
    fields: [clubCategories.clubId],
    references: [clubs.id],
  }),
  category: one(categories, {
    fields: [clubCategories.categoryId],
    references: [categories.id],
  }),
}));

export const activityTypesRelations = relations(activityTypes, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  club: one(clubs, {
    fields: [activities.clubId],
    references: [clubs.id],
  }),
  activityType: one(activityTypes, {
    fields: [activities.activityTypeId],
    references: [activityTypes.id],
  }),
  affiliation: one(affiliations, {
    fields: [activities.affiliationId],
    references: [affiliations.id],
  }),
  categories: many(activityCategories),
}));

export const activityCategoriesRelations = relations(activityCategories, ({ one }) => ({
  activity: one(activities, {
    fields: [activityCategories.activityId],
    references: [activities.id],
  }),
  category: one(categories, {
    fields: [activityCategories.categoryId],
    references: [categories.id],
  }),
}));
