import { defineField, defineType } from "sanity";

export const challenge = defineType({
  name: "challenge",
  title: "Challenge",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Daily", value: "daily" },
          { title: "Seasonal", value: "seasonal" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "xpReward",
      title: "XP Reward",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "config",
      title: "Config",
      type: "object",
      description: "Arbitrary JSON config for the challenge",
      fields: [],
    }),
    defineField({
      name: "season",
      title: "Season",
      type: "reference",
      to: [{ type: "season" }],
    }),
    defineField({
      name: "startsAt",
      title: "Starts At",
      type: "datetime",
    }),
    defineField({
      name: "endsAt",
      title: "Ends At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      xpReward: "xpReward",
    },
    prepare({ title, type, xpReward }) {
      const t = type ? String(type) : "—";
      const xp = xpReward != null ? `${xpReward} XP` : "—";
      return {
        title,
        subtitle: `${t} • ${xp}`,
      };
    },
  },
});

