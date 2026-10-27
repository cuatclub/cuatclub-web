CREATE TABLE "student_club" (
	"student_id" uuid NOT NULL,
	"club_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_club_student_id_club_id_pk" PRIMARY KEY("student_id","club_id")
);
--> statement-breakpoint
ALTER TABLE "student_club" ADD CONSTRAINT "student_club_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_club" ADD CONSTRAINT "student_club_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_club_club_id_idx" ON "student_club" USING btree ("club_id");