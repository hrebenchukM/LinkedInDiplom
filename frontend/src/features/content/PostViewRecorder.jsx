import { useEffect, useRef } from "react";
import { recordPostView } from "./contentApi.js";

const recordedPostIds = new Set();

/** Records a post view once when the card enters the viewport. */
export function PostViewRecorder({ postId, enabled, source = "feed" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !postId) return undefined;
    const id = String(postId);
    if (recordedPostIds.has(id)) return undefined;

    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          recordedPostIds.add(id);
          recordPostView(id, source);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, postId, source]);

  return <span ref={ref} className="post-view-sentinel" aria-hidden="true" />;
}
