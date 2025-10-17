"use client";
import { apiVersion, dataset, projectId } from "@/sanity/lib/env";
import { defineConfig } from "sanity";
import { presentation } from "./src/sanity/presentation";
import { visionTool } from "@sanity/vision";
import { structure } from "./src/sanity/structure";
import resolveUrl from "@/lib/resolveUrl";
import { codeInput } from "@sanity/code-input";
import { media } from "sanity-plugin-media";
import { muxInput } from "sanity-plugin-mux-input";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { documentInternationalization } from "@sanity/document-internationalization";
import { routing } from "@/i18n/routing";

export default defineConfig({
  title: "Renvert",
  projectId,
  dataset,
  basePath: "/admin",

  plugins: [
    structure,
    presentation,
    codeInput(),
    media(),
    muxInput({
      mp4_support: "standard",
    }),
    visionTool({
      defaultApiVersion: apiVersion,
    }),
    documentInternationalization({
      supportedLanguages: routing.locales.map((locale) => ({
        id: locale,
        title: locale === "nb" ? "Norsk" : "English",
      })),
      schemaTypes: ["page", "blog.post", "site"],
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter(
        (template) => !["page", "blog.post", "site"].includes(template.id)
      ),
  },
  document: {
    productionUrl: async (prev, { document }) => {
      if (["page", "blog.post"].includes(document?._type)) {
        return resolveUrl(document as Sanity.PageBase, { base: true });
      }

      return prev;
    },
  },
});
