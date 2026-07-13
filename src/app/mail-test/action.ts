"use server";

import { sendMail } from "@/server/utils/mailer";
import { ActivityCardMail } from "@/components/ui/ActivityCardMail";

export async function handleSendMail() {
    const postTitle = "Intania Case Competition";
    const postImage = "https://scontent.fbkk12-2.fna.fbcdn.net/v/t51.82787-15/621860913_18058311404669466_3070299613520193396_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_ohc=recjBfG2jMEQ7kNvwGR3iJo&_nc_oc=Adr4S2iWkZfUXMVq5uvBv0C0og3G-E9296Rr4PQj34bwLRzXEbGqA_xgffxLWhb1Ol0&_nc_zt=23&_nc_ht=scontent.fbkk12-2.fna&_nc_gid=y20Na98ZD5lEWZM1xdXGQA&_nc_ss=7a30f&oh=00_AfzME7qVixC7wJ3Qxgox_duH2Q14cBfztwg6vvLLZOChlA&oe=69C430B1"
    const claimLink = "https://youtube.com"
    const organizationName = "icc"
    const postDescription = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    await sendMail({
        to: "peeburapha@gmail.com",
        subject:`กิจกรรมใหม่: ${postTitle}`,
        text: `มีกิจกรรมใหม่ "${postTitle}" คลิกลิงก์เพื่อเพิ่มลงในปฏิทิน: ${claimLink}`,
        html: ActivityCardMail({ postTitle, postImage, claimLink, postDescription, organizationName})
    })
}