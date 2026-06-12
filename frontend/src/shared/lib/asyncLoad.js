/** Shared fetch lifecycle for isLoading + loadError state. */
export async function withLoadState({ setIsLoading, setLoadError }, task, fallbackMessage) {
  setIsLoading(true);
  setLoadError("");
  try {
    return await task();
  } catch (error) {
    setLoadError(error?.message || fallbackMessage);
    return null;
  } finally {
    setIsLoading(false);
  }
}
