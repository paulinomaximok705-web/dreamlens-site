(function() {
  'use strict';

  const API_ENDPOINT = '/api/feedback';
  const FALLBACK_DATA_URL = 'data/feedback.json';
  const LOCAL_STORE_KEY = 'dreamlens_public_feedback_v1';
  const MAX_FEEDBACK_LENGTH = 500;
  const MAX_COMMENT_LENGTH = 240;
  const MAX_NICKNAME_LENGTH = 24;

  const feedbackListEl = document.getElementById('feedbackList');
  const feedbackEmptyEl = document.getElementById('feedbackEmpty');
  const feedbackCountTextEl = document.getElementById('feedbackCountText');
  const feedbackFormEl = document.getElementById('feedbackForm');
  const feedbackContentEl = document.getElementById('feedbackContent');

  let feedbacks = [];
  let activeTransport = 'api';
  let fallbackNoticeShown = false;
  const openComments = new Set();

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateTime(value) {
    try {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value));
    } catch (_) {
      return value || '';
    }
  }

  function getInitial(name) {
    const safe = (name || '梦').trim();
    return safe.charAt(0).toUpperCase() || '梦';
  }

  function createId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeText(value, maxLength) {
    return String(value || '')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, maxLength);
  }

  function normalizeNickname(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_NICKNAME_LENGTH);
  }

  function createAnonymousName(seed) {
    const prefixes = ['雾中旅人', '夜航者', '月下访客', '静默回声', '梦境观测者', '微光拾梦者'];
    const safeSeed = Number(seed || Date.now());
    const suffix = String(safeSeed).slice(-3);
    return `${prefixes[safeSeed % prefixes.length]}${suffix}`;
  }

  function sortFeedbacks(items) {
    return [...(Array.isArray(items) ? items : [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((item) => ({
        ...item,
        comments: Array.isArray(item.comments)
          ? [...item.comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          : []
      }));
  }

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function buildApiUnavailableError(message) {
    const error = new Error(message || '当前环境未启用站内反馈接口');
    error.code = 'API_UNAVAILABLE';
    return error;
  }

  function shouldFallback(error) {
    return Boolean(error && error.code === 'API_UNAVAILABLE');
  }

  function announceFallbackMode() {
    if (fallbackNoticeShown) return;
    fallbackNoticeShown = true;
    window.showToast?.('当前环境未启用服务端反馈，已切换为本地留言模式。');
  }

  function renderCount() {
    if (!feedbackCountTextEl) return;
    const count = feedbacks.length;
    feedbackCountTextEl.textContent = count > 0
      ? `已经公开收到了 ${count} 条反馈`
      : '还没有新的公开反馈';
  }

  function renderFeedbacks() {
    if (!feedbackListEl || !feedbackEmptyEl) return;

    renderCount();

    if (!feedbacks.length) {
      feedbackListEl.innerHTML = '';
      feedbackEmptyEl.style.display = 'block';
      return;
    }

    feedbackEmptyEl.style.display = 'none';
    feedbackListEl.innerHTML = feedbacks.map((item) => {
      const comments = Array.isArray(item.comments) ? item.comments : [];
      const isOpen = openComments.has(item.id);
      return `
        <article class="feedback-card" data-feedback-id="${escapeHtml(item.id)}">
          <div class="feedback-card__head">
            <div class="feedback-card__identity">
              <div class="feedback-card__avatar" aria-hidden="true">${escapeHtml(getInitial(item.nickname))}</div>
              <div class="feedback-card__meta">
                <span class="feedback-card__nickname">${escapeHtml(item.nickname || '匿名旅人')}</span>
                <span class="feedback-card__time">${escapeHtml(formatDateTime(item.createdAt))}</span>
              </div>
            </div>
            <span class="feedback-card__count">${comments.length} 条评论</span>
          </div>

          <p class="feedback-card__content">${escapeHtml(item.content)}</p>

          <div class="feedback-card__actions">
            <button type="button" class="feedback-card__toggle" data-toggle-comments="${escapeHtml(item.id)}">
              <i class="fas ${isOpen ? 'fa-angle-up' : 'fa-angle-down'}" aria-hidden="true"></i>
              <span>${isOpen ? '收起评论' : '查看评论'}</span>
            </button>
          </div>

          <div class="feedback-comments ${isOpen ? 'is-open' : ''}" data-comments-panel="${escapeHtml(item.id)}">
            <div class="feedback-comments__list">
              ${comments.length ? comments.map((comment) => `
                <article class="feedback-comment">
                  <div class="feedback-comment__meta">
                    <span class="feedback-comment__author">${escapeHtml(comment.nickname || '匿名旅人')}</span>
                    <span>${escapeHtml(formatDateTime(comment.createdAt))}</span>
                  </div>
                  <p class="feedback-comment__content">${escapeHtml(comment.content)}</p>
                </article>
              `).join('') : '<p class="feedback-comments__empty">还没有人回应这条反馈，留下第一句回声吧。</p>'}
            </div>

            <form class="feedback-comment-form" data-comment-form="${escapeHtml(item.id)}">
              <div class="feedback-comment-form__fields">
                <div class="feedback-comment-form__grid">
                  <label class="feedback-inline-field">
                    <span>匿名昵称</span>
                    <input type="text" name="nickname" maxlength="24" placeholder="可选">
                  </label>
                  <label class="feedback-inline-field">
                    <span>评论内容</span>
                    <textarea name="content" maxlength="240" placeholder="写下你的补充、回应或感受"></textarea>
                  </label>
                </div>
              </div>
              <button type="submit" class="ds-btn ds-btn-ghost ds-btn-sm">发布评论</button>
            </form>
          </div>
        </article>
      `;
    }).join('');
  }

  async function parseJsonResponse(response) {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch (_) {
      throw buildApiUnavailableError('当前反馈接口尚未接通');
    }
  }

  async function requestJson(url, options) {
    let response;
    try {
      response = await fetch(url, options);
    } catch (_) {
      throw buildApiUnavailableError('当前反馈接口尚未接通');
    }

    const data = await parseJsonResponse(response);
    return { response, data };
  }

  function readLocalStore() {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.feedbacks)) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeLocalStore(store) {
    window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
  }

  async function loadFallbackSeed() {
    try {
      const response = await fetch(FALLBACK_DATA_URL, { cache: 'no-store' });
      const data = await parseJsonResponse(response);
      return Array.isArray(data.feedbacks) ? data.feedbacks : [];
    } catch (_) {
      return [];
    }
  }

  async function ensureLocalStore() {
    const existing = readLocalStore();
    if (existing) return existing;

    const seededFeedbacks = await loadFallbackSeed();
    const initialStore = { feedbacks: sortFeedbacks(seededFeedbacks) };
    writeLocalStore(initialStore);
    return initialStore;
  }

  async function withTransport(apiTask, localTask) {
    if (activeTransport === 'local') {
      return localTask();
    }

    try {
      const result = await apiTask();
      activeTransport = 'api';
      return result;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }

      activeTransport = 'local';
      announceFallbackMode();
      return localTask();
    }
  }

  async function readFeedbacksFromApi() {
    const { response, data } = await requestJson(API_ENDPOINT, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(data.error || '加载反馈失败');
    }

    return sortFeedbacks(data.feedbacks);
  }

  async function readFeedbacksFromLocal() {
    const store = await ensureLocalStore();
    return sortFeedbacks(store.feedbacks);
  }

  async function fetchFeedbacks() {
    if (feedbackCountTextEl) {
      feedbackCountTextEl.textContent = '正在读取反馈…';
    }

    feedbacks = await withTransport(readFeedbacksFromApi, readFeedbacksFromLocal);
    renderFeedbacks();
  }

  async function createFeedbackViaApi(payload) {
    const { response, data } = await requestJson(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'feedback', ...payload })
    });

    if (!response.ok) {
      throw new Error(data.error || '发布反馈失败');
    }

    return data.feedback;
  }

  async function createFeedbackViaLocal(payload) {
    const content = normalizeText(payload.content, MAX_FEEDBACK_LENGTH);
    const nickname = normalizeNickname(payload.nickname) || createAnonymousName(Date.now());

    if (content.length < 6) {
      throw new Error('反馈内容至少需要 6 个字');
    }

    const store = await ensureLocalStore();
    const feedback = {
      id: createId('fb'),
      nickname,
      content,
      createdAt: new Date().toISOString(),
      comments: []
    };

    store.feedbacks.unshift(feedback);
    writeLocalStore(store);
    return clone(feedback);
  }

  async function createFeedback(payload) {
    return withTransport(
      () => createFeedbackViaApi(payload),
      () => createFeedbackViaLocal(payload)
    );
  }

  async function createCommentViaApi(payload) {
    const { response, data } = await requestJson(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'comment', ...payload })
    });

    if (!response.ok) {
      throw new Error(data.error || '发布评论失败');
    }

    return data.comment;
  }

  async function createCommentViaLocal(payload) {
    const feedbackId = String(payload.feedbackId || '').trim();
    const content = normalizeText(payload.content, MAX_COMMENT_LENGTH);
    const nickname = normalizeNickname(payload.nickname) || createAnonymousName(Date.now());

    if (!feedbackId) {
      throw new Error('缺少反馈 ID');
    }

    if (content.length < 2) {
      throw new Error('评论内容至少需要 2 个字');
    }

    const store = await ensureLocalStore();
    const target = store.feedbacks.find((item) => item.id === feedbackId);

    if (!target) {
      throw new Error('反馈不存在');
    }

    const comment = {
      id: createId('cm'),
      feedbackId,
      nickname,
      content,
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(target.comments)) {
      target.comments = [];
    }

    target.comments.push(comment);
    writeLocalStore(store);
    return clone(comment);
  }

  async function createComment(payload) {
    return withTransport(
      () => createCommentViaApi(payload),
      () => createCommentViaLocal(payload)
    );
  }

  feedbackFormEl?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const content = feedbackContentEl?.value.trim() || '';

    if (content.length < 6) {
      window.showToast?.('请先写下至少 6 个字的反馈。');
      return;
    }

    const submitButton = feedbackFormEl.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      await createFeedback({ content });
      feedbackFormEl.reset();
      await fetchFeedbacks();
      window.showToast?.('反馈已公开留下，谢谢你一起把 DreamLens 打磨得更好。');
    } catch (error) {
      window.showToast?.(error.message || '发布反馈失败，请稍后再试。');
    } finally {
      submitButton.disabled = false;
    }
  });

  feedbackListEl?.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-toggle-comments]');
    if (!toggle) return;

    const id = toggle.getAttribute('data-toggle-comments');
    if (!id) return;

    if (openComments.has(id)) {
      openComments.delete(id);
    } else {
      openComments.add(id);
    }

    renderFeedbacks();
  });

  feedbackListEl?.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-comment-form]');
    if (!form) return;

    event.preventDefault();

    const feedbackId = form.getAttribute('data-comment-form');
    const nickname = form.querySelector('input[name="nickname"]')?.value.trim() || '';
    const content = form.querySelector('textarea[name="content"]')?.value.trim() || '';

    if (!feedbackId || content.length < 2) {
      window.showToast?.('评论至少写 2 个字。');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      await createComment({ feedbackId, nickname, content });
      openComments.add(feedbackId);
      await fetchFeedbacks();
      window.showToast?.('这句回声已经留在这里了。');
    } catch (error) {
      window.showToast?.(error.message || '发布评论失败，请稍后再试。');
    } finally {
      submitButton.disabled = false;
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    fetchFeedbacks().catch((error) => {
      if (feedbackCountTextEl) {
        feedbackCountTextEl.textContent = '反馈暂时没有载入成功';
      }
      if (feedbackEmptyEl) {
        feedbackEmptyEl.style.display = 'block';
      }
      window.showToast?.(error.message || '公开反馈暂时不可用，请稍后再试。');
    });
  });
})();
