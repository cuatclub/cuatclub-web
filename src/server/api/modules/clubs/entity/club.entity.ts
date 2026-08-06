import type { clubs } from "@/server/db/clubs";
import type { faculties } from "@/server/db/faculties";
import type { categories } from "@/server/db/categories";

export type ClubRow = typeof clubs.$inferSelect;

export type ClubWithRelations = ClubRow & {
	faculty: typeof faculties.$inferSelect | null;
	categories: Array<{
		clubId: string;
		categoryId: number;
		category: typeof categories.$inferSelect;
	}>;
};

export class Club {
	constructor(private readonly row: ClubRow) {}

	get id() {
		return this.row.id;
	}

	get userId() {
		return this.row.userId;
	}

	get registrationStatus() {
		return this.row.registrationStatus;
	}

	get raw(): ClubRow {
		return this.row;
	}

	/** True once every field required to leave "pending" is filled in. */
	isInfoComplete(): boolean {
		return (
			this.row.name !== null &&
			this.row.logoUrl !== null &&
			this.row.facultyId !== null &&
			this.row.shortDescription !== null &&
			this.row.longDescription !== null
		);
	}

	// registration_status transition rules (pending -> info_submitted -> completed)
	// are intentionally left unimplemented here — see usecases/updateMineClubInfo.usecase.ts.
}
