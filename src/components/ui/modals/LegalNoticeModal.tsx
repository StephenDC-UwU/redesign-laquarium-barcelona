import { Dictionary } from "@/dictionaries";

interface LegalNoticeModalProps {
    dict: Dictionary;
}

export default function LegalNoticeModal({ dict }: LegalNoticeModalProps) {
    return (
        <div>
            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">1. Datos Identificativos</h3>
            <p className="mb-6">
                En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos: la empresa titular de dominio web es L'Aquàrium Barcelona, con domicilio a estos efectos en Moll d'Espanya del Port Vell, s/n, 08039 Barcelona.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">2. Usuarios</h3>
            <p className="mb-6">
                El acceso y/o uso de este portal atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">3. Uso del portal</h3>
            <p className="mb-6">
                El sitio web proporciona el acceso a multitud de informaciones, servicios, programas o datos en Internet pertenecientes a L'Aquàrium Barcelona o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">4. Propiedad Intelectual e Industrial</h3>
            <p className="mb-6">
                L'Aquàrium Barcelona por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma.
            </p>
        </div>
    );
}