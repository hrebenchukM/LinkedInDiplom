import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';
import { sharePostWithContact } from '../network/sharePostWithContact.js';
import './PostShareMenu.css';

export default function PostShareMenu({
  post,
  shareContacts = [],
  currentUserId,
  onHint,
  trigger,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sharingId, setSharingId] = useState(null);
  const [sharedIds, setSharedIds] = useState(() => new Set());
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const handleShare = async (contact) => {
    if (!contact?.userId || sharingId) return;

    setSharingId(contact.userId);
    try {
      await sharePostWithContact({
        post,
        contactUserId: contact.userId,
        currentUserId,
        navigate,
        t,
      });
      setSharedIds((prev) => new Set(prev).add(contact.userId));
      onHint?.(t('home.sharePost.sent', 'Post shared in chat'));
      setOpen(false);
    } catch {
      onHint?.(t('home.sharePost.failed', 'Could not share post'));
    } finally {
      setSharingId(null);
    }
  };

  return (
    <div className="post-share-wrap" ref={wrapRef}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}

      {open ? (
        <div className="post-share-menu" role="menu">
          <p className="post-share-menu__title">
            {t('home.post.shareWith', 'Share with')}
          </p>

          {shareContacts.length === 0 ? (
            <p className="post-share-menu__empty">
              {t(
                'home.sharePost.noContacts',
                'Add contacts in Network to share posts and message them.',
              )}
            </p>
          ) : (
            <ul className="post-share-menu__list">
              {shareContacts.map((contact) => {
                const done = sharedIds.has(contact.userId);
                return (
                  <li key={contact.userId}>
                    <button
                      type="button"
                      className={
                        done
                          ? 'post-share-menu__item post-share-menu__item--done'
                          : 'post-share-menu__item'
                      }
                      role="menuitem"
                      disabled={sharingId === contact.userId}
                      onClick={() => handleShare(contact)}
                    >
                      <img
                        className="post-share-menu__avatar"
                        src={getAssetUrl(contact.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                        alt=""
                        width={32}
                        height={32}
                      />
                      <span className="post-share-menu__name">{contact.name}</span>
                      {done ? <span className="post-share-menu__check">✓</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            className="post-share-menu__copy"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              onHint?.(t('home.hint.linkCopied', 'Link copied'));
              setOpen(false);
            }}
          >
            {t('home.post.copyLink', 'Copy link')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
