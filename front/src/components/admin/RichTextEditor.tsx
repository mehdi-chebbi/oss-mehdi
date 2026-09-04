import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Check,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Palette,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import { uploadFile } from "../../api/auth";
import { useAuth } from "../../context/auth";

const IMAGE_SIZES = ["25", "50", "75", "100"] as const;
type ImageSize = (typeof IMAGE_SIZES)[number];
const TEXT_COLORS = [
  { value: "#152735", label: "Anthracite" },
  { value: "#12355b", label: "Bleu foncé OSS" },
  { value: "#0079bc", label: "Bleu OSS" },
  { value: "#326b2f", label: "Vert foncé" },
  { value: "#489e42", label: "Vert OSS" },
  { value: "#8a5a00", label: "Ocre foncé" },
  { value: "#b42318", label: "Rouge" },
  { value: "#6941c6", label: "Violet" },
] as const;

const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "100",
        parseHTML: (element) => {
          const size = element.getAttribute("data-size");
          return IMAGE_SIZES.includes(size as ImageSize) ? size : "100";
        },
        renderHTML: (attributes) => ({ "data-size": attributes.size }),
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({ label, active = false, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 min-w-9 place-items-center rounded-md px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#489e42] disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-[#489e42] text-white"
          : "text-ink/60 hover:bg-ink/7 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor, uploading, onChooseImage }: {
  editor: Editor;
  uploading: boolean;
  onChooseImage: () => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState("");
  const {
    blockStyle,
    imageSelected,
    selectedImageSize,
    textSelected,
    selectedTextColor,
  } = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      blockStyle: currentEditor.isActive("heading", { level: 2 })
        ? "h2"
        : currentEditor.isActive("heading", { level: 3 })
          ? "h3"
          : currentEditor.isActive("heading", { level: 4 })
            ? "h4"
            : "paragraph",
      imageSelected: currentEditor.isActive("image"),
      selectedImageSize: String(currentEditor.getAttributes("image").size || "100") as ImageSize,
      textSelected: !currentEditor.state.selection.empty,
      selectedTextColor: String(currentEditor.getAttributes("textStyle").color || ""),
    }),
  });
  const colorPickerValue = /^#[0-9a-f]{6}$/i.test(selectedTextColor)
    ? selectedTextColor
    : "#12355b";

  const setBlockStyle = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    editor.chain().focus().setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run();
  };

  const openLinkEditor = () => {
    const current = String(editor.getAttributes("link").href || "");
    setLinkValue(current || "https://");
    setLinkError(
      editor.state.selection.empty && !editor.isActive("link")
        ? "Sélectionnez d’abord le texte qui doit devenir cliquable."
        : "",
    );
    setLinkOpen(true);
  };

  const closeLinkEditor = () => {
    setLinkOpen(false);
    setLinkError("");
    editor.chain().focus().run();
  };

  const applyLink = () => {
    if (editor.state.selection.empty && !editor.isActive("link")) {
      setLinkError("Sélectionnez d’abord le texte qui doit devenir cliquable.");
      return;
    }

    const trimmed = linkValue.trim();
    if (!trimmed) {
      setLinkError("Saisissez une adresse valide.");
      return;
    }
    const href = /^(?:https?:\/\/|mailto:|\/)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href, target: "_blank" }).run();
    setLinkOpen(false);
    setLinkError("");
  };

  return (
    <div className="border-b border-ink/10 bg-ink/[0.025]">
      <div className="flex flex-wrap items-center gap-1 p-2">
        <div className="flex items-center gap-1 border-r border-ink/10 pr-2">
          <ToolbarButton label="Annuler" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Rétablir" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="border-r border-ink/10 px-2">
          <label className="sr-only" htmlFor="news-editor-block-style">Style du paragraphe</label>
          <select
            id="news-editor-block-style"
            value={blockStyle}
            onChange={(event) => setBlockStyle(event.target.value)}
            className="h-9 min-w-32 rounded-md border border-ink/12 bg-white px-2.5 text-sm font-medium text-ink/70 outline-none focus:border-transparent focus:ring-2 focus:ring-[#489e42]"
            aria-label="Style du paragraphe"
          >
            <option value="paragraph">Paragraphe</option>
            <option value="h2">Titre 2</option>
            <option value="h3">Titre 3</option>
            <option value="h4">Titre 4</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-r border-ink/10 px-2">
          <ToolbarButton label="Gras" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Italique" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Barré" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label={textSelected ? "Couleur du texte sélectionné" : "Sélectionnez du texte pour changer sa couleur"}
            active={colorOpen}
            disabled={!textSelected}
            onClick={() => setColorOpen((open) => !open)}
          >
            <span className="relative">
              <Palette className="h-4 w-4" />
              <span
                className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-sm"
                style={{ backgroundColor: colorPickerValue }}
                aria-hidden="true"
              />
            </span>
          </ToolbarButton>
          <ToolbarButton
            label="Retirer la couleur du texte"
            disabled={!textSelected || !selectedTextColor}
            onClick={() => editor.chain().focus().unsetColor().removeEmptyTextStyle().run()}
          >
            <X className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 border-r border-ink/10 px-2">
          <ToolbarButton label="Liste à puces" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Liste numérotée" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Citation" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton label="Ajouter un lien" active={linkOpen || editor.isActive("link")} onClick={openLinkEditor}>
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Retirer le lien" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton label="Insérer une image" disabled={uploading} onClick={onChooseImage}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          </ToolbarButton>
          <ToolbarButton label="Effacer la mise en forme" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {linkOpen && (
        <form
          className="border-t border-ink/10 px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
        >
          <div className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="news-editor-link-url">Adresse du lien</label>
            <input
              id="news-editor-link-url"
              type="text"
              inputMode="url"
              autoFocus
              value={linkValue}
              onChange={(event) => {
                setLinkValue(event.target.value);
                setLinkError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeLinkEditor();
              }}
              placeholder="https://exemple.org"
              className="h-10 min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-transparent focus:ring-2 focus:ring-[#489e42]"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#489e42] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3d8a37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#489e42] focus-visible:ring-offset-2 active:translate-y-px"
            >
              <Check className="h-4 w-4" />
              Appliquer
            </button>
            <button
              type="button"
              onClick={closeLinkEditor}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-ink/15 bg-white px-3 text-sm font-medium text-ink/65 transition-colors hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#489e42] active:translate-y-px"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>
          {linkError && <p className="mt-2 text-xs font-medium text-red-600">{linkError}</p>}
        </form>
      )}

      {colorOpen && textSelected && (
        <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 px-3 py-2.5">
          <span className="mr-1 text-xs font-semibold text-ink/55">Couleur du texte</span>
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={color.label}
              aria-label={color.label}
              aria-pressed={selectedTextColor.toLowerCase() === color.value}
              onClick={() => {
                editor.chain().focus().setColor(color.value).run();
                setColorOpen(false);
              }}
              className="h-7 w-7 rounded-md border border-black/15 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#489e42] focus-visible:ring-offset-2 active:scale-95"
              style={{ backgroundColor: color.value }}
            />
          ))}
          <label className="relative ml-1 inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-ink/15 bg-white px-2.5 text-xs font-semibold text-ink/65 hover:border-ink/30 focus-within:ring-2 focus-within:ring-[#489e42]">
            <span
              className="h-3.5 w-3.5 rounded-sm border border-black/15"
              style={{ backgroundColor: colorPickerValue }}
              aria-hidden="true"
            />
            Personnalisée
            <input
              type="color"
              value={colorPickerValue}
              onChange={(event) => {
                editor.chain().focus().setColor(event.target.value).run();
                setColorOpen(false);
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Choisir une couleur personnalisée"
            />
          </label>
        </div>
      )}

      {imageSelected && (
        <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 px-3 py-2.5">
          <span className="mr-1 text-xs font-semibold text-ink/55">Taille de l’image</span>
          {IMAGE_SIZES.map((size) => {
            const active = selectedImageSize === size;
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => editor.chain().focus().updateAttributes("image", { size }).run()}
                className={`h-8 min-w-12 rounded-md border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#489e42] active:translate-y-px ${
                  active
                    ? "border-[#489e42] bg-[#489e42] text-white"
                    : "border-ink/15 bg-white text-ink/65 hover:border-ink/30 hover:text-ink"
                }`}
              >
                {size}%
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RichTextEditor({ value, onChange, label, placeholder = "Rédigez l’article complet ici..." }: RichTextEditorProps) {
  const { token } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: "https" },
      }),
      TextStyle,
      Color,
      SizedImage.configure({ allowBase64: false, inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "news-editor-content min-h-[320px] px-4 py-4 text-[15px] leading-7 text-ink focus:outline-none",
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (current !== next) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const handleImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor || !token) return;

    setUploading(true);
    setError("");
    try {
      const result = await uploadFile(token, "news", file);
      editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
    } catch (uploadError: any) {
      setError(uploadError.message || "L’image n’a pas pu être envoyée.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink/80">{label}</label>
      <p className="mb-2 text-xs leading-relaxed text-ink/48">
        Utilisez les titres 2 à 4 pour structurer le texte. Les images insérées ici apparaissent dans le corps de l’article.
      </p>
      <div className="overflow-hidden rounded-lg border border-ink/15 bg-white focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#489e42]">
        {editor && (
          <EditorToolbar
            editor={editor}
            uploading={uploading}
            onChooseImage={() => imageInputRef.current?.click()}
          />
        )}
        <EditorContent editor={editor} />
      </div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImage}
        className="hidden"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <style>{`
        .news-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          color: rgb(21 39 53 / 0.35);
          pointer-events: none;
        }
        .news-editor-content h2 {
          margin: 1.75rem 0 0.65rem;
          color: #12355b;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.25;
        }
        .news-editor-content h3 {
          margin: 1.4rem 0 0.55rem;
          color: #12355b;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1.3;
        }
        .news-editor-content h4 {
          margin: 1.2rem 0 0.5rem;
          color: #12355b;
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.4;
        }
        .news-editor-content p + p { margin-top: 0.75rem; }
        .news-editor-content ul,
        .news-editor-content ol { margin: 0.8rem 0; padding-left: 1.5rem; }
        .news-editor-content ul { list-style: disc; }
        .news-editor-content ol { list-style: decimal; }
        .news-editor-content blockquote {
          margin: 1rem 0;
          border-left: 3px solid #ffbc34;
          padding-left: 1rem;
          color: rgb(21 39 53 / 0.68);
        }
        .news-editor-content a { color: #0079bc; text-decoration: underline; }
        .news-editor-content img {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          margin: 1rem auto;
          border-radius: 0.75rem;
        }
        .news-editor-content img[data-size="25"] { width: 25%; }
        .news-editor-content img[data-size="50"] { width: 50%; }
        .news-editor-content img[data-size="75"] { width: 75%; }
        .news-editor-content img[data-size="100"] { width: 100%; }
        .news-editor-content img.ProseMirror-selectednode {
          outline: 3px solid rgb(72 158 66 / 0.38);
          outline-offset: 3px;
        }
        @media (max-width: 639px) {
          .news-editor-content img[data-size] { width: 100%; }
        }
        .news-editor-content hr { margin: 1.5rem 0; border-color: rgb(21 39 53 / 0.12); }
      `}</style>
    </div>
  );
}
