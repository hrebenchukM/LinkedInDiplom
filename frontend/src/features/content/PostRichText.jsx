import { Link } from "react-router-dom";
import { splitPostTextSegments } from "./postEntities";

export function PostRichText({ text, mentionNames = {}, onHashtagClick, className = "post-text post-text--multiline" }) {
  const segments = splitPostTextSegments(text);
  if (!segments.length) return null;

  return (
    <p className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "hashtag") {
          const name = segment.name || segment.value.slice(1);
          if (onHashtagClick) {
            return (
              <button
                key={`${segment.type}-${index}`}
                type="button"
                className="post-entity post-entity--hashtag"
                onClick={() => onHashtagClick(name)}
              >
                {segment.value}
              </button>
            );
          }
          return (
            <span key={`${segment.type}-${index}`} className="post-entity post-entity--hashtag">
              {segment.value}
            </span>
          );
        }

        if (segment.type === "mention" && segment.userId) {
          const label = mentionNames[segment.userId] || `${segment.userId.slice(0, 8)}…`;
          return (
            <Link
              key={`${segment.type}-${index}`}
              className="post-entity post-entity--mention"
              to={`/profile/${segment.userId}`}
            >
              @{label}
            </Link>
          );
        }

        return <span key={`${segment.type}-${index}`}>{segment.value}</span>;
      })}
    </p>
  );
}
