const GOOGLE_GSI_URL = "https://accounts.google.com/gsi/client";
const FACEBOOK_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";

const scriptPromises = new Map();
let googleInitClientId = "";
let pendingGoogleAuth = null;

function loadScript(src, id) {
  if (scriptPromises.has(id)) return scriptPromises.get(id);

  const promise = new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

  scriptPromises.set(id, promise);
  return promise;
}

function ensureGoogleSdk() {
  return loadScript(GOOGLE_GSI_URL, "google-gsi-sdk");
}

function ensureFacebookSdk() {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = () => resolve();

    loadScript(FACEBOOK_SDK_URL, "facebook-jssdk").catch(reject);
  });
}

export function getGoogleClientId() {
  return String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
}

export function getFacebookAppId() {
  return String(import.meta.env.VITE_FACEBOOK_APP_ID || "").trim();
}

export function isOAuthSdkConfigured(provider) {
  if (provider === "google") return Boolean(getGoogleClientId());
  if (provider === "facebook") return Boolean(getFacebookAppId());
  return false;
}

function settleGoogleAuth(handler, value) {
  if (!pendingGoogleAuth) return;
  const { settle, timer } = pendingGoogleAuth;
  pendingGoogleAuth = null;
  window.clearTimeout(timer);
  settle(handler, value);
}

function handleGoogleCredential(response) {
  if (!pendingGoogleAuth) return;
  const token = String(response?.credential || "").trim();
  if (!token) {
    settleGoogleAuth("reject", new Error("Google did not return an id_token."));
    return;
  }
  settleGoogleAuth("resolve", token);
}

function initGoogleClient(clientId) {
  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services SDK is unavailable.");
  }

  if (googleInitClientId === clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  googleInitClientId = clientId;
}

function clickGoogleRenderedButton() {
  const host = document.createElement("div");
  host.className = "oauth-sdk-host oauth-sdk-host--google";
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);

  window.google.accounts.id.renderButton(host, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
  });

  const button = host.querySelector('div[role="button"]');
  if (!button) {
    host.remove();
    throw new Error("Google sign-in button could not be rendered.");
  }

  const cleanup = () => host.remove();
  button.addEventListener("click", cleanup, { once: true });
  window.setTimeout(cleanup, 5000);
  button.click();
}

/**
 * Google OAuth — returns id_token (JWT) for POST /api/auth/google.
 */
export function getGoogleIdToken(clientId = getGoogleClientId()) {
  if (!clientId) {
    return Promise.reject(new Error("Google OAuth is not configured (VITE_GOOGLE_CLIENT_ID)."));
  }

  return ensureGoogleSdk().then(
    () =>
      new Promise((resolve, reject) => {
        if (pendingGoogleAuth) {
          reject(new Error("Google sign-in is already in progress."));
          return;
        }

        const timer = window.setTimeout(() => {
          settleGoogleAuth("reject", new Error("Google sign-in timed out."));
        }, 120000);

        pendingGoogleAuth = {
          timer,
          settle: (handler, value) => {
            window.clearTimeout(timer);
            if (handler === "resolve") resolve(value);
            else reject(value);
          },
        };

        initGoogleClient(clientId);

        window.google.accounts.id.prompt((notification) => {
          if (!pendingGoogleAuth) return;

          const skipped =
            notification.isNotDisplayed?.() ||
            notification.isSkippedMoment?.() ||
            notification.isDismissedMoment?.();

          if (!skipped) return;

          try {
            clickGoogleRenderedButton();
          } catch (error) {
            settleGoogleAuth("reject", error);
          }
        });
      }),
  );
}

function initFacebookClient(appId) {
  if (!window.FB) {
    throw new Error("Facebook SDK is unavailable.");
  }

  window.FB.init({
    appId,
    cookie: false,
    xfbml: false,
    version: "v21.0",
  });
}

/**
 * Facebook OAuth — returns access_token for POST /api/auth/facebook.
 */
export function getFacebookAccessToken(appId = getFacebookAppId()) {
  if (!appId) {
    return Promise.reject(new Error("Facebook OAuth is not configured (VITE_FACEBOOK_APP_ID)."));
  }

  return ensureFacebookSdk().then(
    () =>
      new Promise((resolve, reject) => {
        try {
          initFacebookClient(appId);
        } catch (error) {
          reject(error);
          return;
        }

        window.FB.login(
          (response) => {
            if (response?.authResponse?.accessToken) {
              resolve(response.authResponse.accessToken);
              return;
            }

            if (response?.status === "not_authorized") {
              reject(new Error("Facebook sign-in was not authorized."));
              return;
            }

            reject(new Error("Facebook sign-in was cancelled."));
          },
          { scope: "public_profile,email" },
        );
      }),
  );
}

/** Acquire provider token for backend ExternalLoginRequest.providerToken. */
export function acquireProviderToken(provider) {
  if (provider === "google") return getGoogleIdToken();
  if (provider === "facebook") return getFacebookAccessToken();
  return Promise.reject(new Error(`Unknown OAuth provider: ${provider}`));
}
