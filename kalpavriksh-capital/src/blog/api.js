const TOKEN_KEY = 'kg_admin_token';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class UnauthorizedError extends Error {}

async function request(path, { method = 'GET', token, body, signal, headers = {}, raw = false } = {}) {
  const finalHeaders = { ...headers };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined && !raw) finalHeaders['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      headers: finalHeaders,
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Could not reach the server. Please check your connection.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (response.status === 401 && token) throw new UnauthorizedError(payload?.error || 'Session expired');
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || 'Something went wrong. Please try again.');
  }
  return payload.data;
}

function toQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

// ---- public ----
export const fetchPosts = (params, signal) => request(`/posts${toQuery(params)}`, { signal });
export const fetchPost = (slug, signal) => request(`/posts/${encodeURIComponent(slug)}`, { signal });

// ---- admin ----
export const getStoredToken = () => {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) || '';
  } catch (error) {
    return '';
  }
};

export const storeToken = (token) => {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    // Storage can be blocked (private mode); the session just won't survive a refresh.
  }
};

export const login = (password) => request('/admin/login', { method: 'POST', body: { password } });
export const listAdminPosts = (token) => request('/admin/posts', { token });
export const createPost = (token, post) => request('/admin/posts', { method: 'POST', token, body: post });
export const updatePost = (token, id, post) =>
  request(`/admin/posts${toQuery({ id })}`, { method: 'PUT', token, body: post });
export const deletePost = (token, id) => request(`/admin/posts${toQuery({ id })}`, { method: 'DELETE', token });

export async function uploadImage(token, file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Please choose a JPEG, PNG or WebP image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Image must be 4 MB or smaller.');
  const data = await request('/admin/upload', {
    method: 'POST',
    token,
    body: file,
    raw: true,
    headers: { 'Content-Type': file.type },
  });
  return data.url;
}
