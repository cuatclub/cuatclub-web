"use client";
import { handleSendMail } from "./action";

const SendMailPage = () => {
    return (
        <button onClick={() => handleSendMail()} className="ml-10 mt-10">
            Test send mail
        </button>
    )
}

export default SendMailPage