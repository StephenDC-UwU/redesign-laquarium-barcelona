import { Dictionary } from "@/dictionaries";

interface CookiePolicyModalProps {
    dict: Dictionary;
}

export default function CookiePolicyModal({ dict }: CookiePolicyModalProps) {
    return (
        <div>
            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">1. ¿Qué son las cookies?</h3>
            <p className="mb-6">
                Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
            </p>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">2. ¿Qué tipos de cookies utiliza esta página web?</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                <li><strong>Cookies de personalización:</strong> Son aquellas que permiten al usuario acceder al servicio con algunas características de carácter general predefinidas en función de una serie de criterios en el terminal del usuario.</li>
                <li><strong>Cookies de análisis:</strong> Son aquellas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
            </ul>

            <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">3. Revocación y eliminación de cookies</h3>
            <p className="mb-6">
                Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador.
            </p>
        </div>
    );
}