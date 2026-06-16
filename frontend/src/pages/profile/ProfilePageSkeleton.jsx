import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

export default function ProfilePageSkeleton({ sectionsOnly = false }) {
  const { t } = useTranslation();

  return (
    <div className="profile-skeleton" aria-busy="true" aria-label={t('profile.page.loading', 'Loading profile...')}>
      {!sectionsOnly ? (
        <>
          <div className="profile-skeleton__banner" />
          <div className="profile-skeleton__head">
            <div className="profile-skeleton__avatar" />
            <div className="profile-skeleton__lines">
              <div className="profile-skeleton__line profile-skeleton__line--lg" />
              <div className="profile-skeleton__line profile-skeleton__line--md" />
              <div className="profile-skeleton__line profile-skeleton__line--sm" />
            </div>
          </div>
        </>
      ) : null}
      <div className="profile-skeleton__card" />
      <div className="profile-skeleton__card profile-skeleton__card--short" />
      <div className="profile-skeleton__card profile-skeleton__card--short" />
    </div>
  );
}
