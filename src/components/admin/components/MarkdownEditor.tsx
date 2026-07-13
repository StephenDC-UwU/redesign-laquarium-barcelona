import React, { useState, useRef } from "react";
import { Bold, Italic, Heading, List, Link2, Image, Edit, Eye } from "lucide-react";
import { marked } from "marked";

interface MarkdownEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
    const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Insert markdown syntax at current cursor selection or at the end
    const handleInsertSyntax = (prefix: string, suffix: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) {
            onChange(value + prefix + suffix);
            return;
        }

        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const selection = value.substring(startPos, endPos);

        const replacement = prefix + (selection || "texto") + suffix;
        const newValue = value.substring(0, startPos) + replacement + value.substring(endPos);

        onChange(newValue);

        // Put focus back on textarea and restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                startPos + prefix.length,
                startPos + prefix.length + (selection || "texto").length
            );
        }, 50);
    };

    const parsedHTML = value ? marked.parse(value) : "";

    return (
        <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <label className="text-xs font-semibold text-slate-500">
                    Contenido (Soporta Markdown)
                </label>
                
                <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <button
                        type="button"
                        onClick={() => setEditorMode("edit")}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold font-outfit transition-all flex items-center gap-1 cursor-pointer ${
                            editorMode === "edit"
                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        <Edit size={10} />
                        Editar
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditorMode("preview")}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold font-outfit transition-all flex items-center gap-1 cursor-pointer ${
                            editorMode === "preview"
                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                        <Eye size={10} />
                        Ver Preview
                    </button>
                </div>
            </div>

            {editorMode === "edit" ? (
                <div className="space-y-2">
                    {/* Markdown Helper Toolbar */}
                    <div className="flex flex-wrap gap-1 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleInsertSyntax("**", "**")}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            title="Negrita"
                        >
                            <Bold size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInsertSyntax("*", "*")}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            title="Cursiva"
                        >
                            <Italic size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInsertSyntax("\n## ", "\n")}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            title="Subtítulo H2"
                        >
                            <Heading size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInsertSyntax("\n- ", "\n")}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            title="Lista"
                        >
                            <List size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInsertSyntax("[", "](https://ejemplo.com)")}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            title="Enlace"
                        >
                            <Link2 size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInsertSyntax("![", "](https://url_de_la_imagen.jpg)")}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 cursor-pointer"
                            title="Imagen"
                        >
                            <Image size={13} />
                        </button>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={12}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:border-primary text-foreground resize-y"
                    />
                </div>
            ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[224px] max-h-[300px] overflow-y-auto animate-fadeIn">
                    {value ? (
                        <div 
                            className="markdown-preview" 
                            dangerouslySetInnerHTML={{ __html: parsedHTML }} 
                        />
                    ) : (
                        <p className="text-xs text-slate-400 italic text-center pt-20">
                            No hay contenido escrito para previsualizar.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
