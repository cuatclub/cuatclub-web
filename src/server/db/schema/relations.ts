import { relations } from "drizzle-orm";
import { user } from "./user";
import { affiliations } from "./affiliations";
import { categories } from "./categories";
import { clubs } from "./clubs";
import { clubCategories } from "./club-categories";
import { students } from "./students";
import { studentCategories } from "./student-categories";
import { studentActivityTypes } from "./student-activity-types";
import { faculties } from "./faculties";
import { activities } from "./activities";
import { activityTypes } from "./activity-types";
import { activityCategories } from "./activity-categories";
import { activityFaculties } from "./activity-faculties";

export const affiliationsRelations = relations(affiliations, ({ many }) => ({
  clubs: many(clubs),
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

export const facultiesRelations = relations(faculties, ({ many }) => ({
  activityFaculties: many(activityFaculties),
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
  categories: many(activityCategories),
  faculties: many(activityFaculties),
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

export const activityFacultiesRelations = relations(activityFaculties, ({ one }) => ({
  activity: one(activities, {
    fields: [activityFaculties.activityId],
    references: [activities.id],
  }),
  faculty: one(faculties, {
    fields: [activityFaculties.facultyId],
    references: [faculties.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(user, {
    fields: [students.userId],
    references: [user.id],
  }),
  faculty: one(faculties, {
    fields: [students.facultyId],
    references: [faculties.id],
  }),
  categories: many(studentCategories),
  activityTypes: many(studentActivityTypes),
}));

export const studentCategoriesRelations = relations(studentCategories, ({ one }) => ({
  student: one(students, {
    fields: [studentCategories.studentId],
    references: [students.id],
  }),
  category: one(categories, {
    fields: [studentCategories.categoryId],
    references: [categories.id],
  }),
}));

export const studentActivityTypesRelations = relations(studentActivityTypes, ({ one }) => ({
  student: one(students, {
    fields: [studentActivityTypes.studentId],
    references: [students.id],
  }),
  activityType: one(activityTypes, {
    fields: [studentActivityTypes.activityTypeId],
    references: [activityTypes.id],
  }),
}));
