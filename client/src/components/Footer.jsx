import { FaGithub } from "react-icons/fa";

const Footer = () => {
    return(
            <div className="bg-[#0D0D0D] p-3 md:p-6 text-[13px] md:text-[15px] space-y-4 font-bold text-amber-100">
                <div className="flex justify-between font-mplus gap-2">
                    <p>A Non-Profit Organization </p>
                    <p className="font-google-sans">Kerala Muslims</p>
                </div>
                <div className="font-mplus">
                    <p>All rights reserved.</p>
                </div>
            </div>
    )
}

export default Footer;