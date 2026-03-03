import { defineField, defineType } from "sanity";

export const season = defineType({
  name: "season",
  title: "Season",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "startAt",
      title: "Start",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endAt",
      title: "End",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      startAt: "startAt",
      endAt: "endAt",
    },
    prepare({ title, startAt, endAt }) {
      const s = startAt ? String(startAt).slice(0, 10) : "—";
      const e = endAt ? String(endAt).slice(0, 10) : "—";
      return {
        title,
        subtitle: `${s} → ${e}`,
      };
    },
  },
});

