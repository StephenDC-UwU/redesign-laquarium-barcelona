import { Dictionary } from "@/dictionaries";

interface PrivacyModalProps {
    dict: Dictionary;
}

export default function PrivacyModal({ dict }: PrivacyModalProps) {
    return (
        <div>
            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">1. Responsable del Tratamiento</h3>
            <p className="mb-6">
                El responsable del tratamiento de sus datos personales es L'Aquàrium Barcelona. Nos tomamos muy en serio la protección de su privacidad y sus datos personales.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">2. Finalidad del Tratamiento</h3>
            <p className="mb-6">
                Tratamos la información que nos facilitan las personas interesadas con el fin de gestionar el envío de la información que nos soliciten, proveer a los interesados con ofertas de productos y servicios de su interés, y para facturación en caso de compras online.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">3. Legitimación</h3>
            <p className="mb-6">
                La base legal para el tratamiento de sus datos es el consentimiento que se solicita, sin que en ningún caso la retirada del mismo condicione la ejecución del contrato de prestación de servicios.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">4. Derechos de los Usuarios</h3>
            <p className="mb-6">
                Cualquier persona tiene derecho a obtener confirmación sobre si en L'Aquàrium Barcelona estamos tratando datos personales que les conciernan, o no. Las personas interesadas tienen derecho a acceder a sus datos personales, así como a solicitar la rectificación de los datos inexactos.
            </p>
        </div>
    );
}