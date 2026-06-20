import { Dictionary } from "@/dictionaries";

interface FooterProps {
    dict: Dictionary;
}

function Footer({ dict }: FooterProps) {
    return (
        <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 text-center text-sm text-slate-500 font-switzer">
            {dict.footer.text}
        </div>
    );
}

export default Footer;