"use client";

import { Dictionary } from "@/dictionaries";
import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import LegalNoticeModal from "../ui/modals/LegalNoticeModal";
import PrivacyModal from "../ui/modals/PrivacyModal";
import CookiePolicyModal from "../ui/modals/CookiePolicyModal";
import { subscribeToNewsletterAction } from "@/actions/newsletterActions";

interface FooterProps {
    dict: Dictionary;
}

function Footer({ dict }: FooterProps) {

    const [activeModal, setActiveModal] = useState<"legal" | "privacy" | "cookies" | null>(null);
    const [email, setEmail] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const reqDict = dict.newsletter.newsletter_request;
        if (!email) {
            setStatus("error");
            setErrorMessage(reqDict.newsletter_warning);
            return;
        }
        if (!acceptedTerms) {
            setStatus("error");
            setErrorMessage(reqDict.newsletter_terms_warning);
            return;
        }

        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await subscribeToNewsletterAction(email);
            if (res.success) {
                setStatus("success");
                setEmail("");
                setAcceptedTerms(false);
            } else {
                setStatus("error");
                setErrorMessage(res.error || reqDict.newsletter_error);
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage(reqDict.newsletter_error);
        }
    };

    const navDict = dict.nav;
    const companyDict = dict.company;
    const footerDict = dict.footer;
    const newsletterDict = dict.newsletter;


    return (
        <footer className="w-full bg-secondary text-white py-20 px-6 md:px-12 font-switzer relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                {/* Column 1: Brand & Contact (Left) */}
                <div className="flex flex-col items-start md:col-span-4">
                    {/* Abstract Blue Shape + Logo */}
                    <div className="relative w-32 h-32 mb-4">
                        <Image src="/logo.svg" alt="Logo" fill className="object-contain" />
                    </div>
                    <h2 className="text-6xl font-semibold font-outfit mb-0 leading-none">{companyDict.title}</h2>
                    <h3 className="text-3xl font-semibold font-outfit mb-8">{companyDict.subtle}</h3>

                    <div className="flex flex-col text-sm space-y-2 opacity-70 font-light tracking-wide">
                        <Link href={companyDict.map_link} target="_blank"><p>{companyDict.address}</p></Link>
                        <Link href={`tel:${companyDict.phone}`}><p>{companyDict.phone}</p></Link>
                        <Link href={`mailto:${companyDict.email}`}><p>{companyDict.email}</p></Link>
                    </div>
                </div>

                {/* Column 2: Links (Middle) */}
                <div className="grid grid-cols-2 gap-4 mt-8 md:mt-0 md:col-span-5 md:pl-8 pt-4">
                    <ul className="flex flex-col gap-2 text-sm font-semibold tracking-wide">
                        <li><Link href="#" className="hover:text-primary transition-colors block">{navDict.nav_visite}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">{navDict.nav_noticias}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">{navDict.nav_exhibicion}</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">{navDict.nav_educacion}</Link></li>
                    </ul>
                    <ul className="flex flex-col gap-2 text-sm font-semibold tracking-wide">
                        <li><button onClick={() => setActiveModal("legal")} className="hover:text-primary transition-colors text-left block">{footerDict.footer_legal}</button></li>
                        <li><button onClick={() => setActiveModal("privacy")} className="hover:text-primary transition-colors text-left block">{footerDict.footer_privacy}</button></li>
                        <li><button onClick={() => setActiveModal("cookies")} className="hover:text-primary transition-colors text-left block">{footerDict.footer_cookies}</button></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">{footerDict.footer_accesibility}</Link></li>
                    </ul>
                </div>

                {/* Column 3: Miembros (Right) */}
                <div className="flex flex-col items-start mt-8 md:mt-0 md:col-span-3 pt-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-6">{footerDict.footer_members}</h4>
                    <div className="grid grid-cols-3 gap-6 items-center">
                        {/* Placeholder logos for members. Usually these are images */}
                        <Image src="/members/member_aiza.svg" alt="aiza" width={100} height={100} />
                        <Image src="/members/member_biosphere.svg" alt="BioSphere" width={100} height={100} />
                        <Image src="/members/member_barcelona_sostenible.svg" alt="BCN Sostenible" width={100} height={100} />
                        <Image src="/members/member_waza.svg" alt="WAZA" width={100} height={100} />
                        <Image src="/members/member_turismo_familiar.svg" alt="Turismo Familiar" width={100} height={100} />
                    </div>
                </div>


                {/* Columnv 4: Social medias */}
                <div className="flex items-center gap-4 justify-center md:justify-end mt-8 md:mt-0 pt-4 col-span-1 md:col-span-12">
                    <Link
                        href=""
                    >
                        <Image
                            className="w-10 h-10"
                            src="/socials/tiktok.svg"
                            alt="TikTok"
                            width={100}
                            height={100}
                        />
                    </Link>
                    <Link
                        href=""
                    >
                        <Image
                            className="w-10 h-10"
                            src="/socials/instagram.svg" alt="Instagram" width={100} height={100} />
                    </Link>
                    <Link
                        href=""
                    >
                        <Image
                            className="w-10 h-auto"
                            src="/socials/youtube.svg" alt="Youtube" width={100} height={100} />
                    </Link>
                    <Link
                        href=""
                    >
                        <Image
                            className="w-10 h-10"
                            src="/socials/facebook.svg" alt="Facebook" width={100} height={100} />
                    </Link>
                </div>

            </div>

            {/* Newsletter Section */}
            <form onSubmit={handleSubscribe} className="max-w-2xl mx-auto flex flex-col items-center text-center mt-8 w-full">
                <h4 className="text-primary font-bold text-sm mb-6 tracking-wide">{newsletterDict.newsletter_title}</h4>

                <div className="w-full mb-6">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-4 text-white placeholder-white/40 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div className="flex items-start gap-4 w-full text-left mb-8">
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            disabled={status === "loading"}
                            className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                    </div>
                    <label htmlFor="terms" className="text-xs text-primary opacity-80 leading-relaxed cursor-pointer font-light">
                        {newsletterDict.newsletter_terms_part_1} <button type="button" onClick={() => setActiveModal("privacy")} className="underline hover:text-white transition-colors">{newsletterDict.newsletter_terms_part_2}</button> {newsletterDict.newsletter_terms_part_3}
                    </label>
                </div>

                {status === "error" && (
                    <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
                )}
                {status === "success" && (
                    <p className="text-green-500 text-sm mb-4">{newsletterDict.newsletter_request.newsletter_success}</p>
                )}

                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-16 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-sm transition-colors shadow-lg disabled:opacity-50"
                >
                    {status === "loading" ? newsletterDict.newsletter_sending : newsletterDict.newsletter_send}
                </button>
            </form>

            {/* Modals */}
            <Modal isOpen={activeModal === "legal"} onClose={() => setActiveModal(null)} title="Aviso Legal">
                <LegalNoticeModal dict={dict} />
            </Modal>

            <Modal isOpen={activeModal === "privacy"} onClose={() => setActiveModal(null)} title="Política de Privacidad">
                <PrivacyModal dict={dict} />
            </Modal>

            <Modal isOpen={activeModal === "cookies"} onClose={() => setActiveModal(null)} title="Política de Cookies">
                <CookiePolicyModal dict={dict} />
            </Modal>

        </footer>
    );
}

export default Footer;