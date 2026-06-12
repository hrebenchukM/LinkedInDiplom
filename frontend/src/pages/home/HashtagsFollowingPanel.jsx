import { useCallback, useEffect, useState } from "react";
import * as contentApi from "../../features/content/contentApi";
import { LoadStatus } from "../../shared/ui/LoadStatus";

export function HashtagsFollowingPanel({ t, onHint, focusSearch = "" }) {
  const [follows, setFollows] = useState([]);
  const [search, setSearch] = useState(focusSearch);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searching, setSearching] = useState(false);

  const reloadFollows = useCallback(async () => {
    const rows = await contentApi.fetchMyHashtagFollows();
    setFollows(rows.filter((item) => !item.unfollowedAt && item.hashtag));
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      await reloadFollows();
    } catch (error) {
      setLoadError(error?.message || t("home.hashtags.loadFailed", "Could not load hashtag follows."));
    } finally {
      setIsLoading(false);
    }
  }, [reloadFollows, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (focusSearch) setSearch(focusSearch);
  }, [focusSearch]);

  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    contentApi
      .searchHashtags(query, 12)
      .then((items) => {
        if (!cancelled) setResults(items);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search]);

  const followedIds = new Set(follows.map((item) => String(item.hashtagId)));

  async function toggleFollow(hashtag) {
    const id = String(hashtag.id);
    const isFollowed = followedIds.has(id);
    try {
      if (isFollowed) {
        await contentApi.unfollowHashtag(id);
        onHint?.(t("home.hashtags.unfollowed", "Unfollowed hashtag."));
      } else {
        await contentApi.followHashtag(id);
        onHint?.(t("home.hashtags.followed", "Following hashtag."));
      }
      await reloadFollows();
    } catch (error) {
      onHint?.(error?.message || t("home.hashtags.followFailed", "Could not update follow."));
    }
  }

  return (
    <section className="home-card hashtags-panel">
      <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reload} t={t} />
      <h3 className="hashtags-panel__title">{t("home.hashtags.following", "Following hashtags")}</h3>
      <input
        className="hashtags-panel__search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("home.hashtags.search", "Search hashtags to follow…")}
      />
      {search.trim() ? (
        <div className="hashtags-panel__section">
          <h4>{t("home.hashtags.results", "Search results")}</h4>
          {searching ? <p className="muted">{t("common.loading", "Loading…")}</p> : null}
          {!searching && results.length === 0 ? (
            <p className="muted">{t("home.hashtags.noResults", "No hashtags match your search.")}</p>
          ) : null}
          <ul className="hashtags-panel__list">
            {results.map((tag) => (
              <li key={tag.id} className="hashtags-panel__item">
                <span className="hashtags-panel__name">#{tag.name}</span>
                <button type="button" className="ghost-main" onClick={() => toggleFollow(tag)}>
                  {followedIds.has(String(tag.id))
                    ? t("home.hashtags.unfollow", "Unfollow")
                    : t("home.hashtags.follow", "Follow")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="hashtags-panel__section">
        <h4>{t("home.hashtags.myFollows", "Your subscriptions")}</h4>
        {follows.length === 0 && !isLoading ? (
          <p className="muted">{t("home.hashtags.empty", "You are not following any hashtags yet.")}</p>
        ) : (
          <ul className="hashtags-panel__list">
            {follows.map((row) => (
              <li key={row.id} className="hashtags-panel__item">
                <span className="hashtags-panel__name">#{row.hashtag?.name || row.hashtagId}</span>
                <button
                  type="button"
                  className="ghost-main"
                  onClick={() => toggleFollow({ id: row.hashtagId, name: row.hashtag?.name })}
                >
                  {t("home.hashtags.unfollow", "Unfollow")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
