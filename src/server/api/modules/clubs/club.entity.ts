import type { clubs } from "@/server/db/schema/clubs";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import type { CreateClubInputDTO, ClubOutputDTO } from "@/server/api/modules/clubs/dto";
import { internalError } from "@/server/errors";

export type ClubRow = typeof clubs.$inferSelect;

export class Club {
	private constructor(private row: ClubRow) {}

	static toEntity(row: ClubRow): Club {
		return new Club(row);
	}

	static toEntities(rows: ClubRow[]): Club[] {
		return rows.map((row) => Club.toEntity(row));
	}

	static async create(req: CreateClubInputDTO): Promise<Club> {
		const id = await clubsRepository.create(req);
		const club = await clubsRepository.getById(id);
		if (!club) throw internalError({ reason: "Club was created but could not be reloaded", id });
		return club;
	}

	async update(patch: Partial<ClubRow>): Promise<void> {
		await clubsRepository.updateById(this.row.id, patch);
		this.row = { ...this.row, ...patch };
	}

	async delete(): Promise<void> {
		return clubsRepository.deleteById(this.row.id);
	}

	get id() {
		return this.row.id;
	}

	get userId() {
		return this.row.userId;
	}

	get registrationStatus() {
		return this.row.registrationStatus;
	}

	get name() {
		return this.row.name;
	}

	get logoUrl() {
		return this.row.logoUrl;
	}

	get facultyId() {
		return this.row.facultyId;
	}

	get shortDescription() {
		return this.row.shortDescription;
	}

	get longDescription() {
		return this.row.longDescription;
	}

	get imageUrls() {
		return this.row.imageUrls;
	}

	get contacts() {
		return this.row.contacts;
	}

	get createdAt() {
		return this.row.createdAt;
	}

	get updatedAt() {
		return this.row.updatedAt;
	}

	get raw(): ClubRow {
		return this.row;
	}

	toDTO(): ClubOutputDTO {
		return { ...this.row };
	}
}
