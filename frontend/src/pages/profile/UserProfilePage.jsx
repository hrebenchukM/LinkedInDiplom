import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useChatStore } from "../../features/chat/ChatStore";
import { fetchPublicProfile } from "../../features/profile/profileApi";
import { tryRecordProfileView } from "../../features/profile/profileViewsApi";
import { mapProfileDtoToPublicView } from "../../features/profile/mapProfile";
import {
  buildCreateRecommendationBody,
} from "../../features/professional/mapRecommendation";
import {
  createRecommendation,
  fetchUserEducations,
  loadReceivedRecommendationItems,
  loadUserExperienceHistoryItems,
  loadUserSkillsWithNames,
  mapEducationDtoToHistoryItem,
} from "../../features/professional/professionalApi";
import { USE_MOCK_AUTH } from "../../shared/config/features";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { withLoadState } from "../../shared/lib/asyncLoad";
import { LoadStatus } from "../../shared/ui/LoadStatus";
import { useUiSettings } from "../../app/providers/AppProviders";
import { UserProfilePosts } from "./UserProfilePosts";
import "./profile-legacy.css";

export function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { ensureChat, setActiveChat } = useChatStore();
  const useApi = useBackendApi();
  const { t } = useUiSettings();

  const [profile, setProfile] = useState(null);
  const [experienceItems, setExperienceItems] = useState([]);
  const [educationItems, setEducationItems] = useState([]);
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationText, setRecommendationText] = useState("");
  const [isSubmittingRecommendation, setIsSubmittingRecommendation] = useState(false);
  const [recommendationHint, setRecommendationHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const viewRecordedRef = useRef(false);

  const isOwnProfile =
    session.user?.id && userId && String(session.user.id) === String(userId);

  const view = useMemo(() => (profile ? mapProfileDtoToPublicView(profile) : null), [profile]);

  const avatarFallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    view?.fullName || userId || "profile",
  )}`;
  const avatarSrc = view?.avatarUrl || avatarFallback;

  const reload = useCallback(async () => {
    if (!useApi || !userId) return;
    const dto = await withLoadState(
      { setIsLoading, setLoadError },
      () => fetchPublicProfile(userId),
      t("userProfile.loadFailed", "Failed to load profile."),
    );
    if (!dto) return;

    setProfile(dto);

    const [experiences, educations, userSkills, receivedRecommendations] = await Promise.all([
      loadUserExperienceHistoryItems(userId),
      fetchUserEducations(userId),
      loadUserSkillsWithNames(userId),
      loadReceivedRecommendationItems(userId),
    ]);

    setExperienceItems(experiences);
    setEducationItems(educations.map(mapEducationDtoToHistoryItem));
    setSkills(userSkills);
    setRecommendations(receivedRecommendations);
  }, [useApi, userId, t]);

  const canWriteRecommendation =
    useApi &&
    !USE_MOCK_AUTH &&
    session.isAuthenticated &&
    !session.user?.isGuest &&
    userId;

  async function submitRecommendationForUser() {
    const text = recommendationText.trim();
    if (!text) {
      setRecommendationHint(t("profile.recommendations.textRequired", "Enter recommendation text."));
      return;
    }
    setIsSubmittingRecommendation(true);
    setRecommendationHint("");
    try {
      await createRecommendation(buildCreateRecommendationBody({ userId, text }));
      setRecommendationText("");
      const receivedRecommendations = await loadReceivedRecommendationItems(userId);
      setRecommendations(receivedRecommendations);
      setRecommendationHint(t("profile.recommendations.sent", "Recommendation sent."));
      window.setTimeout(() => setRecommendationHint(""), 1200);
    } catch (error) {
      setRecommendationHint(
        error?.message || t("profile.recommendations.saveFailed", "Could not save recommendation."),
      );
    } finally {
      setIsSubmittingRecommendation(false);
    }
  }

  useEffect(() => {
    if (!useApi || !userId || isOwnProfile) return;
    reload();
  }, [useApi, userId, isOwnProfile, reload]);

  useEffect(() => {
    if (!useApi || !userId || isOwnProfile || isLoading || loadError || !profile || viewRecordedRef.current) {
      return;
    }
    viewRecordedRef.current = true;
    tryRecordProfileView(userId, "profile");
  }, [useApi, userId, isOwnProfile, isLoading, loadError, profile]);

  if (isOwnProfile) {
    return <Navigate to="/profile" replace />;
  }

  function onMessage() {
    if (!view) return;
    const chat = ensureChat({ peer: view.fullName, peerId: view.userId || userId });
    if (chat?.id) setActiveChat(chat.id);
    navigate("/chat");
  }

  const profileExperience =
    experienceItems.length > 0
      ? experienceItems
      : view?.profileTitle
        ? [{ title: view.profileTitle, meta: view.location || "" }]
        : [];

  const profileEducation =
    educationItems.length > 0
      ? educationItems
      : view?.education
        ? [{ title: view.education, meta: "" }]
        : [];

  return (
    <section className="page profile-page-legacy lk-page user-profile-page">
      <div className="lk-wrap">
        <LoadStatus
          isLoading={isLoading}
          loadError={loadError}
          onRetry={reload}
          t={t}
          className="lk-load-status lk-main"
        />

        {!useApi ? (
          <div className="lk-main">
            <p className="lk-muted">{t("userProfile.apiOnly", "Public profiles require API mode.")}</p>
            <Link className="lk-back-link" to="/network">
              {t("userProfile.backNetwork", "Back to network")}
            </Link>
          </div>
        ) : null}

        {useApi && view && !loadError ? (
          <>
            <section className={isLoading ? "lk-card lk-card--loading" : "lk-card"}>
              <div
                className={view.headerUrl ? "lk-cover lk-cover--has-image" : "lk-cover"}
                style={view.headerUrl ? { backgroundImage: `url("${view.headerUrl}")` } : undefined}
              />
              <div className="lk-head">
                <div className="lk-head__row">
                  <div className="lk-avatar-wrap">
                    <img className="lk-avatar" src={avatarSrc} alt="" />
                  </div>
                  <div className="lk-head__info">
                    <h1 className="lk-name">{view.fullName}</h1>
                    {view.headline ? <p className="lk-headline">{view.headline}</p> : null}
                    {view.profileTitle ? <p className="lk-sub">{view.profileTitle}</p> : null}
                    {view.location ? <p className="lk-muted">{view.location}</p> : null}
                    <div className="lk-profile-actions">
                      <button type="button" className="lk-profile-actions__btn" onClick={onMessage}>
                        {t("userProfile.message", "Message")}
                      </button>
                      <Link className="lk-profile-actions__link" to="/network">
                        {t("userProfile.backNetwork", "Back to network")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="lk-main">
              {view.about ? (
                <article className="lk-card lk-card--section">
                  <h2 className="lk-title">{t("profile.field.about", "About")}</h2>
                  <p className="lk-line lk-line--pre">{view.about}</p>
                </article>
              ) : null}

              {view.portfolioUrl ? (
                <article className="lk-card lk-card--section">
                  <h2 className="lk-title">{t("userProfile.portfolio", "Portfolio")}</h2>
                  <a className="lk-line lk-line--link" href={view.portfolioUrl} target="_blank" rel="noreferrer">
                    {view.portfolioUrl}
                  </a>
                </article>
              ) : null}
            </section>

            <section className="lk-rows">
              <UserProfilePosts userId={userId} session={session} t={t} />

              <article className="lk-card lk-card--section">
                <h3 className="lk-row-title">{t("profile.section.experience", "Experience")}</h3>
                {profileExperience.length > 0 ? (
                  <div className="lk-history">
                    {profileExperience.map((item, index) => (
                      <div
                        className="lk-history__item lk-history__item--readonly"
                        key={item.experienceId || `exp-${index}`}
                      >
                        <div>
                          <p className="lk-history__title">{item.title}</p>
                          {item.meta ? <p className="lk-history__meta">{item.meta}</p> : null}
                          {item.description ? (
                            <p className="lk-line lk-line--pre lk-muted">{item.description}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="lk-line lk-muted">
                    {t("userProfile.experienceEmpty", "No experience listed yet.")}
                  </p>
                )}
              </article>

              <article className="lk-card lk-card--section">
                <h3 className="lk-row-title">{t("profile.section.education", "Education")}</h3>
                {profileEducation.length > 0 ? (
                  <ul className="lk-list">
                    {profileEducation.map((item, index) => (
                      <li key={`edu-${index}`} className="lk-line">
                        <strong>{item.title}</strong>
                        {item.meta ? <span className="lk-muted"> — {item.meta}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="lk-line lk-muted">
                    {t("userProfile.educationEmpty", "No education listed yet.")}
                  </p>
                )}
              </article>

              <article className="lk-card lk-card--section">
                <h3 className="lk-row-title">{t("profile.section.skills", "Skills")}</h3>
                {skills.length > 0 ? (
                  <div className="skills-chips">
                    {skills.map((skill) => (
                      <span className="skill-chip" key={skill.userSkillId || skill.skillId}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="lk-line lk-muted">{t("profile.skills.emptyYet", "Skills have not been added yet.")}</p>
                )}
              </article>

              <article className="lk-card lk-card--section">
                <h3 className="lk-row-title">{t("profile.section.recommendations", "Recommendations")}</h3>
                {recommendations.length > 0 ? (
                  <ul className="lk-list">
                    {recommendations.map((item, index) => (
                      <li key={item.recommendationId || `${item.title}-${index}`} className="lk-line">
                        <strong>{item.title}</strong>
                        {item.meta ? <span className="lk-muted lk-line--pre"> — {item.meta}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="lk-line lk-muted">
                    {t("profile.recommendations.receivedEmpty", "No recommendations yet.")}
                  </p>
                )}
                {canWriteRecommendation ? (
                  <div className="lk-recommendation-write">
                    <label>
                      {t("profile.recommendations.writeFor", "Write a recommendation")}
                      <textarea
                        rows={4}
                        value={recommendationText}
                        onChange={(e) => setRecommendationText(e.target.value)}
                        placeholder={t(
                          "profile.recommendations.textPh",
                          "Describe your experience working with this person…",
                        )}
                      />
                    </label>
                    <button
                      type="button"
                      className="lk-profile-actions__btn"
                      disabled={isSubmittingRecommendation}
                      onClick={submitRecommendationForUser}
                    >
                      {t("profile.recommendations.send", "Send recommendation")}
                    </button>
                    {recommendationHint ? <p className="lk-muted">{recommendationHint}</p> : null}
                  </div>
                ) : null}
              </article>
            </section>
          </>
        ) : null}
      </div>
    </section>
  );
}
