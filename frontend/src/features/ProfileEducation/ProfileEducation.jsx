import { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import '../ProfileEducation/ProfileEducation.css';
import AddEducationModal from '../Modals/AddEducationModal';
import AddCertificateModal from '../Modals/AddCertificateModal';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const ProfileEducation = ({
  education = [],
  certificates = [],
  onEducationAdded,
  onCertificateAdded,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const hasEducation = education.length > 0;

  return (
    <>
      <div className="education-card">
        <div className="section-header">
          <h2>{t('profile.education.title', 'Education')}</h2>
          <div className="section-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setIsModalOpen(true)}
              aria-label={t('profile.education.add', 'Add education')}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {!hasEducation && (
          <div className="education-empty">
            {t('profile.education.empty', 'No education added')}
          </div>
        )}

        {education.map(block => {
          if (!block.education) return null;

          return (
            <div
              key={block.education.id}
              className="education-item"
            >
              <div className="education-logo">
                {block.academy?.logoUrl ? (
                  <img
                    src={getAssetUrl(block.academy.logoUrl, IMAGE_PLACEHOLDERS.company)}
                    alt={block.academy?.name}
                    className="university-img"
                  />
                ) : (
                  <Briefcase size={24} />
                )}
              </div>

              <div className="education-content">
                <h3>{block.education.institution}</h3>

                <p>
                  {block.education.degree}
                  {block.education.fieldOfStudy &&
                    ` · ${block.education.fieldOfStudy}`}
                </p>

                <p className="education-date">
                  {block.education.startDate}
                  {' – '}
                  {block.education.endDate ?? t('profile.education.now', 'Now')}
                </p>
              </div>
            </div>
          );
        })}

        {certificates.map(block => {
          const { certificate, academy } = block;

          if (!certificate) return null;

          return (
            <div
              key={certificate.id}
              className="education-item certificate-item"
            >
              <div className="education-logo">
                {academy?.logoUrl ? (
                  <img
                    src={getAssetUrl(academy.logoUrl, IMAGE_PLACEHOLDERS.company)}
                    alt={academy?.name}
                    className="university-img"
                  />
                ) : (
                  <Briefcase size={24} />
                )}
              </div>

              <div className="education-content">
                <h3>{certificate.name}</h3>

                <p className="certificate-org">
                  {academy?.name}
                </p>

                <p className="education-date">
                  {t('profile.education.issued', 'Issued {date}', { date: certificate.issueDate })}
                  {certificate.expiryDate &&
                    ` · ${t('profile.education.expired', 'Expired {date}', { date: certificate.expiryDate })}`}
                </p>
              </div>

              {certificate.downloadRef && (
                <a
                  href={getAssetUrl(certificate.downloadRef)}
                  target="_blank"
                  rel="noreferrer"
                  className="certificate-btn"
                >
                  {t('profile.education.certificate', 'Certificate')}
                </a>
              )}
            </div>
          );
        })}

        <div className="education-actions">
          <button
            className="btn-add"
            onClick={() => setIsCertificateModalOpen(true)}
          >
            {t('profile.education.addCertificate', 'Add certificate')}
          </button>
        </div>
      </div>

      <AddEducationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={() => {
          onEducationAdded?.();
          setIsModalOpen(false);
        }}
      />

      <AddCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        onAdded={() => {
          onCertificateAdded?.();
          setIsCertificateModalOpen(false);
        }}
      />
    </>
  );
};

export default ProfileEducation;
