import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as contentApi from "./contentApi";
import { fetchProfilesByUserIds } from "../profile/profileApi";
import { useTranslation } from "../../app/i18n/LocaleContext.jsx";

export function PostTagsPanel({ postId, useApi, isOwn, onHashtagClick }) {
  const { t } = useTranslation();
  const [hashtags, setHashtags] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [mentionNames, setMentionNames] = useState({});

  useEffect(() => {
    if (!useApi || !postId) {
      setHashtags([]);
      setMentions([]);
      setMentionNames({});
      return;
    }

    let cancelled = false;

    Promise.all([contentApi.fetchPostHashtags(postId), contentApi.fetchPostMentions(postId)])
      .then(async ([tagRows, mentionRows]) => {
        if (cancelled) return;
        setHashtags(tagRows);
        setMentions(mentionRows);
        const userIds = mentionRows.map((item) => item.mentionedUserId).filter(Boolean);
        const profiles = await fetchProfilesByUserIds(userIds);
        const names = {};
        userIds.forEach((userId) => {
          const profile = profiles[userId];
          names[userId] =
            profile?.fullName?.trim() ||
            `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
            String(userId).slice(0, 8);
        });
        if (!cancelled) setMentionNames(names);
      })
      .catch(() => {
        if (!cancelled) {
          setHashtags([]);
          setMentions([]);
          setMentionNames({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [useApi, postId]);

  if (!useApi || (!hashtags.length && !mentions.length)) return null;

  return (
    <div className="post-tags-panel">
      {hashtags.length > 0 ? (
        <div className="post-tags-panel__group">
          <span className="post-tags-panel__label">{t("home.post.hashtags", "Hashtags")}</span>
          <div className="post-tags-panel__chips">
            {hashtags.map((row) => {
              const name = row.hashtag?.name || row.hashtagId;
              return (
                <button
                  key={row.id || `${row.hashtagId}-${row.postId}`}
                  type="button"
                  className="post-entity-chip post-entity-chip--hashtag"
                  onClick={() => onHashtagClick?.(name, row.hashtagId)}
                >
                  #{name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {mentions.length > 0 ? (
        <div className="post-tags-panel__group">
          <span className="post-tags-panel__label">{t("home.post.mentions", "Mentions")}</span>
          <div className="post-tags-panel__chips">
            {mentions.map((row) => (
              <Link
                key={row.id || `${row.mentionedUserId}-${row.postId}`}
                className="post-entity-chip post-entity-chip--mention"
                to={`/app/profile/${row.mentionedUserId}`}
              >
                @{mentionNames[row.mentionedUserId] || row.mentionedUserId}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
