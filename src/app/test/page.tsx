"use client";

import { Button } from "@/components/ui/Button";

const page = () => {
    const postTitle = "Intania Case Competition";
    const postImage = "https://scontent.fbkk12-2.fna.fbcdn.net/v/t51.82787-15/621860913_18058311404669466_3070299613520193396_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_ohc=recjBfG2jMEQ7kNvwGR3iJo&_nc_oc=Adr4S2iWkZfUXMVq5uvBv0C0og3G-E9296Rr4PQj34bwLRzXEbGqA_xgffxLWhb1Ol0&_nc_zt=23&_nc_ht=scontent.fbkk12-2.fna&_nc_gid=y20Na98ZD5lEWZM1xdXGQA&_nc_ss=7a30f&oh=00_AfzME7qVixC7wJ3Qxgox_duH2Q14cBfztwg6vvLLZOChlA&oe=69C430B1"
    const claimLink = "https://youtube.com"
    const organizationName = "icc"
    const postDescription = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    return (
        <div style={{ 
                fontFamily: "sans-serif",
                maxWidth: "600px",
                margin: "0 auto",
                display:"flex",
                flexDirection:"column", 
                gap:"16px",
                paddingLeft:"24px",
                paddingRight:"24px", 
            }}>
            <h2 style={{ color: "#DE5C8E", marginTop:"16px", fontWeight: "700", fontSize:"20px" }}>
                โพสต์ใหม่: 
                <strong> {postTitle} </strong>
                จาก
                <strong> {organizationName} </strong>
            </h2>
            <img
                src={postImage}
                alt={postTitle}
                style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    marginBottom: "16px",
                }}
            />
            <h2><strong>รายละเอียด:</strong></h2>
            <p>
                {postDescription}
            </p>
            <div style={{display:"flex", justifyContent:"center"}}>
                <a href={claimLink} style={{textDecoration: "none", width: "100%", maxWidth:"384px"}}>
                    <div style={{
                            display: "flex",
                            backgroundColor: "#DE5C8E",
                            color: "white",
                            padding: "12px 24px",
                            borderRadius: "24px",
                            marginTop: "16px",
                            marginBottom: "24px",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "18px",
                            cursor: "pointer",
                        }}>
                        📅 เพิ่มลงในปฏิทิน
                    </div>
                </a>
            </div>
        </div>
    )
}

export default page;