"use client";

import Image from "next/image";
import { Building2, Check, Plus } from "lucide-react";
import { FALLBACK_THEME } from "@/app/(attendee)/clubs/_components/interest-theme";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/Button";

interface ClubHeaderProps {
	club: {
		name: string;
		image?: string | null;
		facultyId?: string | null;
		facultyName?: string | null;
		interests: Array<{
			interest: {
				id: string;
				name: string;
			};
		}>;
	};
	interests: Array<{
		id: string;
		theme: {
			soft: string;
			ink: string;
		};
	}>;
  id: string;
  facultyName: string;
}

export function ClubHeader({ club, interests, facultyName }: ClubHeaderProps ) {
    // Follow / Unfollow logic
    // const utils = api.useUtils();
    // const { data: followedIds = [] } = api.userXOrganization.getMineFollowed.useQuery();
    // const followed = followedIds.includes(id);
    // const followMutation = api.userXOrganization.follow.useMutation({
    // 	onSuccess: async () => utils.userXOrganization.getMineFollowed.invalidate(),
    // });
    // const unfollowMutation = api.userXOrganization.unfollow.useMutation({
    // 	onSuccess: async () => utils.userXOrganization.getMineFollowed.invalidate(),
    // });
    // const followBusy = followMutation.isPending || unfollowMutation.isPending;
    // const followError = followMutation.error?.message ?? unfollowMutation.error?.message;
  
    // const toggleFollow = () => {
    // 	if (followed) {
    // 		unfollowMutation.mutate({ organizationId: id });
    // 	} else {
    // 		followMutation.mutate({ organizationId: id });
    // 	}
    // };

	const facultyLabel = facultyName?.trim() || "ไม่ระบุคณะ";

	return (
		<section className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
			{club.image ? (
				<Image
					src={club.image}
					alt={club.name}
					width={160}
					height={160}
					className="h-28 w-28 shrink-0 rounded-full bg-white object-cover shadow-sm sm:h-36 sm:w-36"
				/>
			) : (
				<div className="h-28 w-28 shrink-0 rounded-full bg-muted sm:h-36 sm:w-36" />
			)}

			<div className="flex w-full min-w-0 max-w-full flex-col items-center space-y-2 sm:items-start sm:space-y-3">
				
				<h1 
					className="line-clamp-2 w-full break-words px-4 text-3xl font-bold text-foreground sm:w-auto sm:px-0 sm:text-4xl"
					title={club.name}
				>
					{club.name}
				</h1>

				<div className="flex w-full flex-col gap-3 sm:flex-col-reverse sm:gap-3">
					<div className="flex w-full min-w-0 items-center justify-center gap-2 px-4 text-sm font-medium text-text-gray sm:justify-start sm:px-0 sm:text-base">
						<Building2 className="h-5 w-5 shrink-0" />
						<span 
							className="truncate" 
							title={facultyLabel}
						>
							{facultyLabel}
						</span>
					</div>

					<div className="no-scrollbar flex w-full max-w-full scroll-smooth flex-nowrap justify-center sm:justify-start gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:px-0">
						{club.interests.map((interestObj) => {
							const prev = interests.filter(obj => obj.id === interestObj.interest.id).at(0);
							const theme = prev ? prev.theme : FALLBACK_THEME;
							
							return (
								<span 
									key={interestObj.interest.id} 
									className="block max-w-[160px] shrink-0 truncate rounded-full bg-[#fff0f5] px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm"
									style={{ backgroundColor: theme.soft, color: theme.ink }}
									title={interestObj.interest.name}
								>
									{interestObj.interest.name}
								</span>
							);
						})}
					</div>
				</div>
				
				{/* Hidden for first official launch */}
				{/* Follow Button Integrated into Header ... */}
        {/* Hidden for first official launch */} 							
        
        {/* <div className="flex w-full flex-col items-center px-4 sm:items-start sm:px-0">
          <Button
            type="button"
            disabled={followBusy}
            onClick={toggleFollow}
            className="w-full max-w-[240px] rounded-full sm:w-auto"
            variant={followed ? "secondary" : "default"}
          >
            {followed ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {followed ? "ติดตามแล้ว" : "ติดตามชมรม"}
          </Button>
          {followError && <p className="mt-2 text-sm text-red-600">{followError}</p>}
 				</div>  */}
       
			</div>
		</section>
	);
}