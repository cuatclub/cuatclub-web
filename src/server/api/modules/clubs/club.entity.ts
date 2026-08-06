import type { clubs } from "@/server/db/schema/clubs";

export type ClubRow = typeof clubs.$inferSelect;

export class Club {
	constructor(private readonly row: ClubRow) {}

	get id() {
		return this.row.id;
	}

	get raw(): ClubRow {
		return this.row;
	}
}
