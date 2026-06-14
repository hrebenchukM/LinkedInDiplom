import { useEffect, useRef } from "react";
import { tryRecordPostView } from "./postViewsApi";

/** Records a post view once when the card enters the viewport (API mode). */
export function PostViewRecorder({ postId, enabled, source = "feed" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !postId) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          tryRecordPostView(postId, source);
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
