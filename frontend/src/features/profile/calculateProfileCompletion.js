import { getProfileAvatar, getProfileHeader } from './mapProfile.js';

export function calculateProfileCompletion({
  profile,
  experience = [],
  education = [],
  skills = [],
  resumeAttached = false,
}) {
  const items = [
    { key: 'avatar', weight: 20, done: Boolean(getProfileAvatar(profile)) },
    { key: 'cover', weight: 15, done: Boolean(getProfileHeader(profile)) },
    { key: 'experience', weight: 20, done: experience.length > 0 },
    { key: 'education', weight: 15, done: education.length > 0 },
    { key: 'skills', weight: 15, done: skills.length > 0 },
    { key: 'resume', weight: 15, done: resumeAttached },
  ];

  const percent = Math.min(
    100,
    Math.round(items.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0)),
  );

  return { percent, items };
}
