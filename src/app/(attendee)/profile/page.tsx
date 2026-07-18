"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, Camera, Check, ChevronDown, LogOut, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { Dropdown } from "@/components/ui/Dropdown";
import { Footer } from "@/components/ui/Footer";
import { Input } from "@/components/ui/Input";
import { Navbar } from "@/components/ui/Navbar";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { changePassword, signOut, useSession } from "@/lib/auth-client";

type ProfileForm = {
	name: string;
	facultyId: string;
	isReceiveMail: boolean;
	notifyEventReminders: boolean;
	notifyMatchingEvents: boolean;
	notifyClubUpdates: boolean;
	interests: string[];
};

const EMPTY_FORM: ProfileForm = {
	name: "",
	facultyId: "",
	isReceiveMail: false,
	notifyEventReminders: true,
	notifyMatchingEvents: true,
	notifyClubUpdates: true,
	interests: [],
};

function sameProfile(a: ProfileForm, b: ProfileForm) {
	return (
		a.name === b.name &&
		a.facultyId === b.facultyId &&
		a.isReceiveMail === b.isReceiveMail &&
		a.notifyEventReminders === b.notifyEventReminders &&
		a.notifyMatchingEvents === b.notifyMatchingEvents &&
		a.notifyClubUpdates === b.notifyClubUpdates &&
		a.interests.length === b.interests.length &&
		a.interests.every((i) => b.interests.includes(i))
	);
}

export default function ProfilePage() {
	const router = useRouter();
	const { data: session } = useSession();
	const utils = api.useUtils();
	const { data: me, isLoading } = api.user.me.useQuery();
	const { data: faculties } = api.faculty.getAll.useQuery();
	const { data: interests } = api.interest.getAll.useQuery();

	const [savedProfile, setSavedProfile] = useState<ProfileForm>(EMPTY_FORM);
	const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
	const [isEditing, setIsEditing] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const updateProfile = api.user.updateProfile.useMutation();
	const updateInterests = api.user.updateInterests.useMutation();
	const deleteUser = api.user.delete.useMutation();

	useEffect(() => {
		if (!me) return;
		const next: ProfileForm = {
			name: me.name ?? "",
			facultyId: me.facultyId ?? "",
			isReceiveMail: me.isReceiveMail,
			notifyEventReminders: me.notifyEventReminders,
			notifyMatchingEvents: me.notifyMatchingEvents,
			notifyClubUpdates: me.notifyClubUpdates,
			interests: me.interests,
		};
		setSavedProfile(next);
		if (!isEditing) setForm(next);
	}, [me, isEditing]);

	const facultyName = useMemo(() => {
		if (!form.facultyId || !faculties) return "";
		return faculties.find((f) => f.id === form.facultyId)?.name ?? "";
	}, [form.facultyId, faculties]);

	const facultyNames = useMemo(() => (faculties ?? []).map((f) => f.name), [faculties]);

	const dirty = useMemo(() => !sameProfile(form, savedProfile), [form, savedProfile]);
	const firstName = savedProfile.name.trim().split(/\s+/).find(Boolean) ?? "there";
	const email = session?.user.email ?? "";
	const avatarSrc = (me?.image ?? session?.user.image ?? "") || null;

	const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
		setForm((c) => ({ ...c, [key]: value }));
		setNotice(null);
	};

	const toggleInterest = (id: string) => {
		if (!isEditing) return;
		setForm((c) => ({
			...c,
			interests: c.interests.includes(id)
				? c.interests.filter((i) => i !== id)
				: [...c.interests, id],
		}));
		setNotice(null);
	};

	const handleCancel = () => {
		setForm(savedProfile);
		setIsEditing(false);
		setNotice(null);
	};

	const handleSave = async () => {
		if (!me) return;
		setSaving(true);
		setNotice(null);
		try {
			await updateProfile.mutateAsync({
				name: form.name,
				facultyId: form.facultyId || null,
				isReceiveMail: form.isReceiveMail,
				notifyEventReminders: form.notifyEventReminders,
				notifyMatchingEvents: form.notifyMatchingEvents,
				notifyClubUpdates: form.notifyClubUpdates,
			});
			const interestsChanged =
				form.interests.length !== savedProfile.interests.length ||
				!form.interests.every((i) => savedProfile.interests.includes(i));
			if (interestsChanged) {
				await updateInterests.mutateAsync({ interests: form.interests });
			}
			await utils.user.me.invalidate();
			await utils.organization.getMine.invalidate().catch(() => undefined);
			setSavedProfile(form);
			setIsEditing(false);
			setNotice("บันทึกการเปลี่ยนแปลงแล้ว");
		} catch (err) {
			setNotice(err instanceof Error ? err.message : "ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง");
		} finally {
			setSaving(false);
		}
	};

	const handleLogout = async () => {
		await signOut();
		router.push("/auth/attendee/login");
	};

	const handleDeleteAccount = async () => {
		if (!session?.user.id) return;
		try {
			await deleteUser.mutateAsync({ id: session.user.id });
			await signOut();
			router.push("/auth/attendee/login");
		} catch (err) {
			setNotice(err instanceof Error ? err.message : "ไม่สามารถลบบัญชีได้");
		}
	};

	return (
		<div className="min-h-screen bg-[#fbfbfc] text-[#34383d]">
			<Navbar />
			<ConfirmModal
				open={deleteOpen}
				title="ลบบัญชี?"
				description="การกระทำนี้ไม่สามารถย้อนกลับได้ บัญชีของคุณจะถูกลบถาวร"
				confirmText="ยืนยัน"
				cancelText="ยกเลิก"
				onCancel={() => setDeleteOpen(false)}
				onConfirm={() => {
					setDeleteOpen(false);
					void handleDeleteAccount();
				}}
			/>
			<ProfileBody
				isLoading={isLoading}
				isEditing={isEditing}
				form={form}
				savedProfile={savedProfile}
				firstName={firstName}
				fullName={savedProfile.name}
				facultyName={facultyName}
				email={email}
				avatarSrc={avatarSrc}
				facultyNames={facultyNames}
				interests={interests ?? []}
				dirty={dirty}
				notice={notice}
				saving={saving}
				onEdit={() => {
					setIsEditing(true);
					setNotice(null);
				}}
				onCancel={handleCancel}
				onSave={handleSave}
				setField={setField}
				onFacultyNameChange={(name) => {
					const id = (faculties ?? []).find((f) => f.name === name)?.id ?? "";
					setField("facultyId", id);
				}}
				toggleInterest={toggleInterest}
				onLogout={handleLogout}
				onDelete={() => setDeleteOpen(true)}
				onChangePassword={async (current, next) => {
					try {
						const res = await changePassword({ currentPassword: current, newPassword: next });
						if (res.error) {
							return { ok: false, error: res.error.message ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ" };
						}
						return { ok: true };
					} catch (err) {
						return { ok: false, error: err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ" };
					}
				}}
			/>
			<Footer />
		</div>
	);
}

type ProfileBodyProps = {
	isLoading: boolean;
	isEditing: boolean;
	form: ProfileForm;
	savedProfile: ProfileForm;
	firstName: string;
	fullName: string;
	facultyName: string;
	email: string;
	avatarSrc: string | null;
	facultyNames: string[];
	interests: { id: string; name: string; icon?: string | null }[];
	dirty: boolean;
	notice: string | null;
	saving: boolean;
	onEdit: () => void;
	onCancel: () => void;
	onSave: () => void;
	setField: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
	onFacultyNameChange: (name: string) => void;
	toggleInterest: (id: string) => void;
	onLogout: () => void;
	onDelete: () => void;
	onChangePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
};

function NotificationToggle({
	checked,
	disabled,
	onChange,
	title,
	description,
}: {
	checked: boolean;
	disabled?: boolean;
	onChange: () => void;
	title: string;
	description: string;
}) {
	return (
		<div className="flex items-start justify-between gap-4">
			<div className="min-w-0">
				<p className="font-semibold text-[#34383d]">{title}</p>
				<p className="mt-1 text-sm leading-5 text-[#777e86]">{description}</p>
			</div>
		<button
			type="button"
			disabled={disabled}
			aria-pressed={checked}
			onClick={onChange}
			className={cn(
				"relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all disabled:cursor-not-allowed",
				checked ? "border-primary bg-primary" : "border-[#d4d8dc] bg-[#e7eaed]",
				disabled && "opacity-50",
			)}
		>
			<span
				className={cn(
					"inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
					checked ? "translate-x-[22px]" : "translate-x-0.5",
				)}
			/>
		</button>
		</div>
	);
}

function ProfileBody(props: ProfileBodyProps) {
	const {
		isLoading,
		isEditing,
		form,
		firstName,
		fullName,
		facultyName,
		email,
		avatarSrc,
		facultyNames,
		interests,
		dirty,
		notice,
		saving,
		onEdit,
		onCancel,
		onSave,
		setField,
		onFacultyNameChange,
		toggleInterest,
		onLogout,
		onDelete,
		onChangePassword,
	} = props;

	const [currentPw, setCurrentPw] = useState("");
	const [newPw, setNewPw] = useState("");
	const [confirmPw, setConfirmPw] = useState("");
	const [pwBusy, setPwBusy] = useState(false);
	const [pwError, setPwError] = useState<string | null>(null);
	const [pwSuccess, setPwSuccess] = useState<string | null>(null);

	const submitPw = async () => {
		setPwError(null);
		setPwSuccess(null);
		if (!currentPw) {
			setPwError("กรุณากรอกรหัสผ่านปัจจุบัน");
			return;
		}
		if (newPw.length < 8) {
			setPwError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
			return;
		}
		if (newPw !== confirmPw) {
			setPwError("รหัสผ่านใหม่ไม่ตรงกัน");
			return;
		}
		setPwBusy(true);
		const res = await onChangePassword(currentPw, newPw);
		setPwBusy(false);
		if (res.ok) {
			setCurrentPw("");
			setNewPw("");
			setConfirmPw("");
			setPwSuccess("เปลี่ยนรหัสผ่านสำเร็จ");
		} else {
			setPwError(res.error ?? "เปลี่ยนรหัสผ่านไม่สำเร็จ");
		}
	};

	if (isLoading) {
		return (
			<main className="mx-auto flex w-full max-w-[1240px] items-center justify-center px-5 py-20 text-[#858b92]">
				กำลังโหลด...
			</main>
		);
	}

	return (
		<main className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-start lg:px-12 lg:py-12">
			<aside className="flex w-full flex-col items-center text-center lg:sticky lg:top-24 lg:z-10 lg:self-start">
				<button
					type="button"
					className="mb-7 flex items-center gap-2 self-start text-sm font-medium text-[#858b92] transition-colors hover:text-primary"
					onClick={() => window.history.back()}
				>
					<ArrowLeft className="h-5 w-5" />
					ย้อนกลับ
				</button>

				<div className="relative flex h-38 w-38 items-center justify-center rounded-full border-[3px] border-[#de6a98] bg-[#fff0f6] shadow-[0_18px_45px_rgba(222,92,142,0.16)] sm:h-42 sm:w-42">
					{avatarSrc ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={avatarSrc}
							alt={fullName}
							className="h-full w-full rounded-full object-cover object-center"
						/>
					) : (
						<UserRound className="h-20 w-20 text-[#de5c8e] sm:h-24 sm:w-24" strokeWidth={1.7} />
					)}
					<div className="absolute -right-1 bottom-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#ffd2e2] bg-white text-primary shadow-[0_10px_24px_rgba(222,92,142,0.18)]">
						<Camera className="h-4.5 w-4.5" />
					</div>
				</div>

				<Button
					type="button"
					variant="secondary"
					className="mt-6 h-11 min-w-[210px] border-primary bg-white px-6 text-base font-semibold text-primary shadow-[0_8px_22px_rgba(222,92,142,0.08)] hover:bg-[#fff3f7]"
					onClick={() => {
						onEdit();
					}}
				>
					แก้ไขโปรไฟล์
				</Button>

				<div className="mt-7 max-w-[300px]">
					<p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a5abb1]">
						สวัสดี, {firstName}
					</p>
					<h1 className="mt-2 wrap-break-word text-[28px] font-bold leading-tight text-[#34383d]">
						{fullName}
					</h1>
					<p className="mt-2 text-base text-[#6a7077]">{facultyName || "—"}</p>
				</div>

				<div className="mt-10 flex w-full max-w-[260px] flex-col gap-3">
					<button
						type="button"
						className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
						onClick={onDelete}
					>
						<Trash2 className="h-4.5 w-4.5" />
						ลบบัญชี
					</button>
					<button
						type="button"
						className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
						onClick={onLogout}
					>
						<LogOut className="h-4.5 w-4.5" />
						ออกจากระบบ
					</button>
				</div>
			</aside>

			<ProfileSettings
				isEditing={isEditing}
				form={form}
				email={email}
				facultyNames={facultyNames}
				facultyName={facultyName}
				interests={interests}
				dirty={dirty}
				notice={notice}
				saving={saving}
				setField={setField}
				onFacultyNameChange={onFacultyNameChange}
				toggleInterest={toggleInterest}
				onCancel={onCancel}
				onSave={onSave}
				currentPw={currentPw}
				newPw={newPw}
				confirmPw={confirmPw}
				pwBusy={pwBusy}
				pwError={pwError}
				pwSuccess={pwSuccess}
				setCurrentPw={setCurrentPw}
				setNewPw={setNewPw}
				setConfirmPw={setConfirmPw}
				submitPw={submitPw}
			/>
		</main>
	);
}

type ProfileSettingsProps = {
	isEditing: boolean;
	form: ProfileForm;
	email: string;
	facultyNames: string[];
	facultyName: string;
	interests: { id: string; name: string; icon?: string | null }[];
	dirty: boolean;
	notice: string | null;
	saving: boolean;
	setField: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
	onFacultyNameChange: (name: string) => void;
	toggleInterest: (id: string) => void;
	onCancel: () => void;
	onSave: () => void;
	currentPw: string;
	newPw: string;
	confirmPw: string;
	pwBusy: boolean;
	pwError: string | null;
	pwSuccess: string | null;
	setCurrentPw: (v: string) => void;
	setNewPw: (v: string) => void;
	setConfirmPw: (v: string) => void;
	submitPw: () => void;
};

function ProfileSettings(props: ProfileSettingsProps) {
	const {
		isEditing,
		form,
		email,
		facultyNames,
		facultyName,
		interests,
		dirty,
		notice,
		saving,
		setField,
		onFacultyNameChange,
		toggleInterest,
		onCancel,
		onSave,
		currentPw,
		newPw,
		confirmPw,
		pwBusy,
		pwError,
		pwSuccess,
		setCurrentPw,
		setNewPw,
		setConfirmPw,
		submitPw,
	} = props;

	return (
		<section className="min-w-0">
			<div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
						ตั้งค่าผู้ใช้
					</p>
					<h2 className="mt-2 text-[30px] font-bold leading-tight text-[#34383d] sm:text-[36px]">
						ตั้งค่าบัญชี
					</h2>
				</div>
				<div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e9e9eb] bg-white px-3.5 py-2 text-sm text-[#676d74] shadow-sm">
					<ShieldCheck className="h-4 w-4 text-primary" />
					บัญชีของฉัน
				</div>
			</div>

			<div className="rounded-[26px] border border-[#e3e5e8] bg-white p-5 shadow-[0_18px_50px_rgba(34,38,44,0.06)] sm:p-7 lg:p-8">
				<div className="grid gap-8 xl:grid-cols-2">
					<div className="space-y-5">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a1a7ae]">
								ข้อมูลบัญชี
							</p>
							<h3 className="mt-1 text-2xl font-bold text-[#34383d]">รายละเอียดของคุณ</h3>
						</div>

						<label className="block">
							<span className="text-sm font-semibold text-[#6e747b]">ชื่อที่แสดง</span>
							<Input
								value={form.name}
								disabled={!isEditing}
								onChange={(e) => setField("name", e.target.value)}
								className={cn(
									"mt-2 h-12 rounded-xl border-[#d9dce0] bg-[#fcfcfd] px-4 text-base text-[#3c4147] shadow-none disabled:opacity-100",
									isEditing && "bg-white",
								)}
							/>
						</label>

						<label className="block">
							<span className="text-sm font-semibold text-[#6e747b]">อีเมล</span>
							<Input
								value={email}
								readOnly
								disabled
								className="mt-2 h-12 rounded-xl border-[#e1e3e6] bg-[#f6f7f8] px-4 text-base text-[#777e86] shadow-none disabled:opacity-100"
							/>
						</label>

						<div className="rounded-2xl border border-[#edf0f2] bg-[#fafbfb] p-4">
							<div className="flex items-start justify-between gap-4">
								<div className="flex min-w-0 gap-3">
									<div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1f6] text-primary">
										<Bell className="h-5 w-5" />
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-[#34383d]">รับการแจ้งเตือนทางอีเมล</p>
										<p className="mt-1 text-sm leading-5 text-[#777e86]">
											เปิดเพื่อรับการแจ้งเตือนทางอีเมลตามความสนใจของคุณ
										</p>
									</div>
								</div>
								<button
									type="button"
									disabled={!isEditing}
									aria-pressed={form.isReceiveMail}
									aria-label="รับการแจ้งเตือนทางอีเมล"
									onClick={() => setField("isReceiveMail", !form.isReceiveMail)}
									className={cn(
										"relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all disabled:cursor-not-allowed",
										form.isReceiveMail
											? "border-primary bg-primary"
											: "border-[#d4d8dc] bg-[#e7eaed]",
										!isEditing && "opacity-70",
									)}
								>
									<span
										className={cn(
											"inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
											form.isReceiveMail ? "translate-x-[22px]" : "translate-x-0.5",
										)}
									/>
								</button>
							</div>
						</div>
					</div>

					<div className="space-y-5 xl:border-l xl:border-[#edf0f2] xl:pl-8">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a1a7ae]">
								ข้อมูลพื้นฐาน
							</p>
							<h3 className="mt-1 text-2xl font-bold text-[#34383d]">คณะและความสนใจ</h3>
						</div>

						<div>
							<span className="text-sm font-semibold text-[#6e747b]">คณะ</span>
							{isEditing ? (
								<Dropdown
									content={facultyNames}
									value={facultyName}
									onValueChange={onFacultyNameChange}
									menuContentClassName="w-[min(520px,calc(100vw-40px))]"
									className="mt-2 h-12 rounded-xl border-[#d9dce0] bg-white px-4 text-base text-[#3c4147] shadow-none hover:border-primary hover:bg-white hover:text-primary"
									icon={<ChevronDown className="h-4 w-4 text-[#7f858c]" />}
								/>
							) : (
								<div className="mt-2 flex min-h-12 items-center rounded-xl border border-[#e1e3e6] bg-[#f6f7f8] px-4 text-base text-[#3c4147]">
									{facultyName || "—"}
								</div>
							)}
						</div>

						<div>
							<div className="mb-3 flex items-center justify-between gap-3">
								<span className="text-sm font-semibold text-[#6e747b]">ความสนใจส่วนตัว</span>
								{isEditing && (
									<span className="text-xs font-medium text-[#949ba3]">เลือกอย่างน้อยหนึ่งอย่าง</span>
								)}
							</div>
							<div className="flex flex-wrap gap-2.5">
								{interests.map((interest) => {
									const active = form.interests.includes(interest.id);
									return (
										<button
											type="button"
											key={interest.id}
											disabled={!isEditing}
											onClick={() => toggleInterest(interest.id)}
											className={cn(
												"inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all disabled:cursor-default",
												active
													? "border-primary bg-[#fff1f6] text-primary shadow-[0_8px_18px_rgba(222,92,142,0.08)]"
													: "border-[#dde1e5] bg-white text-[#6f767d]",
												isEditing && "hover:border-primary hover:text-primary",
											)}
										>
											{active && <Check className="h-3.5 w-3.5" />}
											{interest.name}
										</button>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{isEditing && (
					<div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#edf0f2] pt-6 sm:flex-row sm:justify-end">
						<Button
							type="button"
							variant="outline"
							className="h-11 rounded-full border-[#cfd3d8] px-8 text-[#777e86] hover:bg-[#f6f7f8] hover:text-[#34383d]"
							onClick={onCancel}
						>
							ยกเลิก
						</Button>
						<Button
							type="button"
							className="h-11 rounded-full bg-primary px-8 text-white hover:bg-[#c94d7d]"
							disabled={!dirty || !form.name.trim() || form.interests.length === 0 || saving}
							onClick={() => void onSave()}
						>
							{saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
						</Button>
					</div>
				)}

				{notice && (
					<p className="mt-5 rounded-2xl border border-[#f7d5e2] bg-[#fff6fa] px-4 py-3 text-sm font-medium text-[#b73366]">
						{notice}
					</p>
				)}
			</div>

			{form.isReceiveMail && (
				<div className="mt-6 rounded-[26px] border border-[#e3e5e8] bg-white p-5 shadow-[0_18px_50px_rgba(34,38,44,0.06)] sm:p-7 lg:p-8">
					<div className="mb-5">
						<p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a1a7ae]">
							การแจ้งเตือน
						</p>
						<h3 className="mt-1 text-2xl font-bold text-[#34383d]">ตั้งค่าการแจ้งเตือน</h3>
					</div>
					<div className="flex flex-col gap-4">
						<NotificationToggle
							checked={form.notifyEventReminders}
							disabled={!isEditing}
							onChange={() => setField("notifyEventReminders", !form.notifyEventReminders)}
							title="แจ้งเตือนกิจกรรมในปฏิทิน"
							description="เตือนก่อนถึงวันปิดรับสมัครของกิจกรรมที่คุณบันทึกไว้"
						/>
						<NotificationToggle
							checked={form.notifyMatchingEvents}
							disabled={!isEditing}
							onChange={() => setField("notifyMatchingEvents", !form.notifyMatchingEvents)}
							title="กิจกรรมที่ตรงความสนใจ"
							description="แจ้งเตือนเมื่อมีกิจกรรมใหม่ที่ตรงกับความสนใจของคุณ"
						/>
						<NotificationToggle
							checked={form.notifyClubUpdates}
							disabled={!isEditing}
							onChange={() => setField("notifyClubUpdates", !form.notifyClubUpdates)}
							title="อัปเดตจากชมรม"
							description="แจ้งเตือนข่าวสารจากชมรมที่คุณติดตาม"
						/>
					</div>
				</div>
			)}

			<div className="mt-6 rounded-[26px] border border-[#e3e5e8] bg-white p-5 shadow-[0_18px_50px_rgba(34,38,44,0.06)] sm:p-7 lg:p-8">
				<div className="mb-5">
					<p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a1a7ae]">ความปลอดภัย</p>
					<h3 className="mt-1 text-2xl font-bold text-[#34383d]">เปลี่ยนรหัสผ่าน</h3>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<label className="block sm:col-span-2">
						<span className="text-sm font-semibold text-[#6e747b]">รหัสผ่านปัจจุบัน</span>
						<Input
							type="password"
							value={currentPw}
							onChange={(e) => setCurrentPw(e.target.value)}
							className="mt-2 h-12 rounded-xl border-[#d9dce0] bg-white px-4 text-base text-[#3c4147] shadow-none"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-semibold text-[#6e747b]">รหัสผ่านใหม่</span>
						<Input
							type="password"
							value={newPw}
							onChange={(e) => setNewPw(e.target.value)}
							className="mt-2 h-12 rounded-xl border-[#d9dce0] bg-white px-4 text-base text-[#3c4147] shadow-none"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-semibold text-[#6e747b]">ยืนยันรหัสผ่านใหม่</span>
						<Input
							type="password"
							value={confirmPw}
							onChange={(e) => setConfirmPw(e.target.value)}
							className="mt-2 h-12 rounded-xl border-[#d9dce0] bg-white px-4 text-base text-[#3c4147] shadow-none"
						/>
					</label>
				</div>

				{pwError && (
					<p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
						{pwError}
					</p>
				)}

				{pwSuccess && (
					<p className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
						{pwSuccess}
					</p>
				)}

				<div className="mt-5 flex justify-end">
					<Button
						type="button"
						className="h-11 rounded-full bg-primary px-8 text-white hover:bg-[#c94d7d]"
						disabled={pwBusy}
						onClick={() => void submitPw()}
					>
						{pwBusy ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
					</Button>
				</div>
			</div>
		</section>
	);
}


