import { relations } from "drizzle-orm";
import { user } from "./user";
import { affiliations } from "./affiliations";
import { categories } from "./categories";
import { clubs } from "./clubs";
import { clubCategories } from "./club-categories";

export const affiliationsRelations = relations(affiliations, ({ many }) => ({
  clubs: many(clubs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  clubCategories: many(clubCategories),
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
