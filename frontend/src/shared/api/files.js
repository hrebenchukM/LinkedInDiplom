const BACK_URL = 'http://localhost:8080/JavaWeb222';

export const fileUrl = (name) =>
  name ? `${BACK_URL}/file/${name}` : null;
