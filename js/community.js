/* DreamLens — Dream Community */
(function() {
  'use strict';

  const STORAGE_KEY = 'dreamlens_community_posts_v2';
  const DEFAULT_NICKNAME = '匿名旅人';
  const TAG_POOL = [
    '森林', '海浪', '门', '镜子', '旧房间', '追逐', '飞行', '楼梯',
    '平静', '迟疑', '困惑', '想念', '发光', '下沉感', '长廊', '黄昏',
    '夜空', '被看见', '反复出现', '未完成'
  ];

  const ART_THEMES = {
    forest: {
      name: '发光森林',
      gradient:
        'linear-gradient(145deg, rgba(31, 58, 63, 0.92) 0%, rgba(60, 111, 123, 0.86) 32%, rgba(31, 36, 68, 0.94) 100%)'
    },
    ocean: {
      name: '海浪入口',
      gradient:
        'linear-gradient(145deg, rgba(38, 48, 89, 0.94) 0%, rgba(57, 98, 145, 0.88) 44%, rgba(21, 18, 47, 0.94) 100%)'
    },
    mirror: {
      name: '镜中回声',
      gradient:
        'linear-gradient(145deg, rgba(73, 72, 109, 0.94) 0%, rgba(117, 112, 162, 0.82) 38%, rgba(24, 20, 49, 0.96) 100%)'
    },
    room: {
      name: '旧房间',
      gradient:
        'linear-gradient(145deg, rgba(76, 53, 52, 0.94) 0%, rgba(130, 91, 96, 0.84) 34%, rgba(28, 20, 44, 0.96) 100%)'
    },
    sky: {
      name: '夜空飞行',
      gradient:
        'linear-gradient(145deg, rgba(33, 43, 82, 0.94) 0%, rgba(104, 122, 191, 0.84) 36%, rgba(22, 18, 51, 0.96) 100%)'
    },
    stairs: {
      name: '楼梯与光',
      gradient:
        'linear-gradient(145deg, rgba(46, 37, 71, 0.94) 0%, rgba(119, 96, 169, 0.84) 34%, rgba(19, 16, 40, 0.96) 100%)'
    }
  };

  const SEED_POSTS = [
    {
      id: 'seed-1',
      authorName: '匿名旅人 A-17',
      createdAt: offsetTime(40),
      title: '门后的海浪一直没有停',
      body:
        '我梦见自己走在很长的走廊里，尽头那扇门半开着，里面不断有海浪声传出来。每次我想再靠近一点，脚步都会被一阵很轻的下沉感拖住。\n\n奇怪的是我并不害怕，反而有一种平静的迟疑，像知道那扇门后面不是危险，而是某个我还没准备好承认的答案。',
      tags: ['门', '海浪', '迟疑', '长廊', '下沉感'],
      arts: [{ kind: 'theme', theme: 'ocean' }, { kind: 'theme', theme: 'stairs' }],
      likes: 186,
      bookmarks: 64,
      liked: false,
      bookmarked: false,
      size: 'tall',
      comments: [
        { id: 'c-1', authorName: '今晚旅人', text: '我也梦见过门后的水声，像在等我做决定。', createdAt: offsetTime(18) },
        { id: 'c-2', authorName: '匿名旅人 G-02', text: '“平静的迟疑”这个感觉太准确了，我每次都是停在门口。', createdAt: offsetTime(11) }
      ]
    },
    {
      id: 'seed-2',
      authorName: '玻璃叶片',
      createdAt: offsetTime(95),
      title: '发光的森林把路折起来了',
      body:
        '梦里是一片蓝绿色的森林，树叶像玻璃一样轻轻作响。远处有一点白色的光，我沿着它走，结果脚下的路越来越软，像有人把原本的出口轻轻收了起来。\n\n醒来后一直觉得很安静，但那种安静里有一点没走完的事。',
      tags: ['森林', '发光', '平静', '迟疑'],
      arts: [{ kind: 'theme', theme: 'forest' }],
      likes: 143,
      bookmarks: 51,
      liked: false,
      bookmarked: false,
      size: 'wide',
      comments: [
        { id: 'c-3', authorName: '梦里的人', text: '这种“路被收起来”的感觉很 DreamLens。', createdAt: offsetTime(53) }
      ]
    },
    {
      id: 'seed-3',
      authorName: '匿名旅人 N-09',
      createdAt: offsetTime(160),
      title: '旧房间的窗外已经不是过去的天色',
      body:
        '房间里的摆设和小时候一模一样，连桌角那道划痕都还在。但窗外是一种完全不属于那段时间的天色，很安静，也很陌生。\n\n我在梦里待了很久，像在确认什么东西已经回不去了。',
      tags: ['旧房间', '想念', '黄昏', '平静'],
      arts: [{ kind: 'theme', theme: 'room' }],
      likes: 120,
      bookmarks: 72,
      liked: false,
      bookmarked: false,
      size: 'compact',
      comments: [
        { id: 'c-4', authorName: '门边的人', text: '我最近总梦见类似的旧空间，像现实没有处理完。', createdAt: offsetTime(134) },
        { id: 'c-5', authorName: '匿名旅人', text: '窗外天色变了这件事特别有感觉。', createdAt: offsetTime(101) }
      ]
    },
    {
      id: 'seed-4',
      authorName: '夜色回声',
      createdAt: offsetTime(220),
      title: '镜子里的人先认出我',
      body:
        '我站在很暗的洗手台前，镜子里那个人看起来比我平静。她没有说话，只是像已经知道我在躲什么。\n\n整个梦没有发生什么大事，但醒来之后那种被自己看见的感觉留了很久。',
      tags: ['镜子', '困惑', '平静', '被看见'],
      arts: [{ kind: 'theme', theme: 'mirror' }],
      likes: 96,
      bookmarks: 38,
      liked: false,
      bookmarked: false,
      size: 'compact',
      comments: [
        { id: 'c-6', authorName: '今晚旅人', text: '这种梦像是潜意识比你更早知道答案。', createdAt: offsetTime(207) }
      ]
    },
    {
      id: 'seed-5',
      authorName: '飞越旧屋顶',
      createdAt: offsetTime(300),
      title: '我从楼顶飞过去，但一直不敢往下看',
      body:
        '梦里我会飞，可是飞得不高，只敢沿着屋顶和天台滑过去。下面是很暗的城市，偶尔有几盏灯亮着。\n\n我知道自己没有掉下去，但还是一直不敢低头。',
      tags: ['飞行', '夜空', '迟疑', '楼顶'],
      arts: [{ kind: 'theme', theme: 'sky' }],
      likes: 88,
      bookmarks: 29,
      liked: false,
      bookmarked: false,
      size: 'wide',
      comments: []
    },
    {
      id: 'seed-6',
      authorName: '长楼梯用户',
      createdAt: offsetTime(420),
      title: '楼梯一直往下，但尽头有一圈很轻的光',
      body:
        '这是最近第三次梦见同一段楼梯了。它一直往下走，周围很暗，可最下面总有一圈很轻的白光。\n\n我每次都快走到的时候醒来，像梦故意只给到这里。',
      tags: ['楼梯', '反复出现', '发光', '未完成'],
      arts: [{ kind: 'theme', theme: 'stairs' }, { kind: 'theme', theme: 'mirror' }],
      likes: 134,
      bookmarks: 57,
      liked: false,
      bookmarked: false,
      size: 'tall',
      comments: [
        { id: 'c-7', authorName: '匿名旅人 K', text: '我最近也常梦见楼梯，尤其是快到底时醒来。', createdAt: offsetTime(399) }
      ]
    }
  ];

  const state = {
    posts: [],
    sort: 'recommend',
    tag: '全部',
    query: '',
    composeTheme: 'forest',
    composeImage: '',
    composeTags: new Set(),
    detailPostId: null
  };

  function offsetTime(minutesAgo) {
    return new Date(Date.now() - minutesAgo * 60000).toISOString();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function getThemeByName(theme) {
    return ART_THEMES[theme] || ART_THEMES.forest;
  }

  function normalizeComment(comment) {
    return {
      id: comment.id || `comment-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      authorName: comment.authorName || DEFAULT_NICKNAME,
      text: comment.text || '',
      createdAt: comment.createdAt || new Date().toISOString()
    };
  }

  function normalizePost(post) {
    return {
      id: post.id || `post-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      authorName: post.authorName || DEFAULT_NICKNAME,
      createdAt: post.createdAt || new Date().toISOString(),
      title: post.title || '没有标题的梦',
      body: post.body || '',
      tags: Array.isArray(post.tags) ? post.tags.slice(0, 8) : [],
      arts: Array.isArray(post.arts) && post.arts.length ? post.arts : [{ kind: 'theme', theme: 'forest' }],
      likes: Number(post.likes) || 0,
      bookmarks: Number(post.bookmarks) || 0,
      liked: Boolean(post.liked),
      bookmarked: Boolean(post.bookmarked),
      size: post.size || 'wide',
      comments: Array.isArray(post.comments) ? post.comments.map(normalizeComment) : []
    };
  }

  function loadPosts() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(SEED_POSTS).map(normalizePost);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) {
        return clone(SEED_POSTS).map(normalizePost);
      }
      return parsed.map(normalizePost);
    } catch (_) {
      return clone(SEED_POSTS).map(normalizePost);
    }
  }

  function savePosts() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
      return true;
    } catch (_) {
      window.showToast?.('图片过大，当前内容已显示但可能无法长期保存在本地。');
      return false;
    }
  }

  function getInitial(name) {
    const text = String(name || DEFAULT_NICKNAME).trim();
    return text.slice(0, 1).toUpperCase();
  }

  function formatRelativeTime(value) {
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.max(1, Math.round(diff / 60000));

    if (minutes < 60) return `${minutes} 分钟前`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} 小时前`;
    if (minutes < 10080) return `${Math.round(minutes / 1440)} 天前`;
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  function formatCount(value) {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return `${value}`;
  }

  function getPostScore(post) {
    const ageHours = Math.max(1, (Date.now() - new Date(post.createdAt).getTime()) / 3600000);
    const engagement = post.likes * 1.6 + post.bookmarks * 2.3 + post.comments.length * 3.1;
    const mediaBonus = post.arts.length > 1 ? 16 : 8;
    return engagement + mediaBonus - ageHours * 0.5;
  }

  function normalizeSearchTerm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getSearchCorpus(post) {
    return [
      post.authorName,
      post.title,
      post.body,
      ...(Array.isArray(post.tags) ? post.tags : [])
    ].join(' ').toLowerCase();
  }

  function getFeedStatusText() {
    const sortText = state.sort === 'latest'
      ? '最新排序'
      : state.sort === 'withImage'
        ? '带图梦境'
        : '推荐排序';

    const parts = [sortText, state.tag === '全部' ? '全部标签' : `#${state.tag}`];
    if (state.query.trim()) {
      parts.push(`搜索“${state.query.trim()}”`);
    }
    return parts.join(' · ');
  }

  function getVisiblePosts() {
    const activeTag = state.tag;
    const searchTerm = normalizeSearchTerm(state.query);
    let posts = state.posts.slice();

    if (activeTag !== '全部') {
      posts = posts.filter((post) => post.tags.includes(activeTag));
    }

    if (searchTerm) {
      posts = posts.filter((post) => getSearchCorpus(post).includes(searchTerm));
    }

    switch (state.sort) {
      case 'latest':
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'withImage':
        posts.sort((a, b) => {
          const imageDelta = b.arts.length - a.arts.length;
          if (imageDelta !== 0) return imageDelta;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
      case 'recommend':
      default:
        posts.sort((a, b) => getPostScore(b) - getPostScore(a));
        break;
    }

    return posts;
  }

  function getHotTags(limit = 10) {
    const counter = new Map();
    state.posts.forEach((post) => {
      post.tags.forEach((tag) => {
        counter.set(tag, (counter.get(tag) || 0) + 1);
      });
    });
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  function getThemeStyle(theme) {
    return `--art-gradient:${getThemeByName(theme).gradient};`;
  }

  function getPrimaryArt(arts) {
    if (Array.isArray(arts) && arts.length) return arts[0];
    return { kind: 'theme', theme: 'forest' };
  }

  function buildFeedArtMarkup(arts) {
    const art = getPrimaryArt(arts);

    if (art.kind === 'image' && art.src) {
      return `
        <div class="community-art-card community-art-card--cover">
          <img src="${escapeHtml(art.src)}" alt="AI 生成的梦境艺术">
        </div>
      `;
    }

    return `
      <div class="community-art-card community-art-card--cover" style="${getThemeStyle(art.theme)}"></div>
    `;
  }

  function buildArtMarkup(arts) {
    const list = Array.isArray(arts) ? arts : [];
    const gridClass = list.length > 1 ? 'community-post__art-grid is-double' : 'community-post__art-grid';

    return `
      <div class="${gridClass}">
        ${buildArtItemsMarkup(list)}
      </div>
    `;
  }

  function buildArtItemsMarkup(arts) {
    return arts.map((art) => {
      if (art.kind === 'image' && art.src) {
        return `
          <div class="community-art-card">
            <img src="${escapeHtml(art.src)}" alt="AI 生成的梦境艺术">
            <span class="community-art-card__label"><i class="fas fa-sparkles"></i> AI 梦境艺术</span>
          </div>
        `;
      }

      const theme = getThemeByName(art.theme);
      return `
        <div class="community-art-card" style="${getThemeStyle(art.theme)}">
          <span class="community-art-card__label"><i class="fas fa-sparkles"></i> ${escapeHtml(theme.name)}</span>
        </div>
      `;
    }).join('');
  }

  function buildTagMarkup(tags, className) {
    return tags.map((tag) => `<span class="${className}">#${escapeHtml(tag)}</span>`).join('');
  }

  function buildCompactTagMarkup(tags, className, limit = 2) {
    return (Array.isArray(tags) ? tags : [])
      .slice(0, limit)
      .map((tag) => `<span class="${className}">#${escapeHtml(tag)}</span>`)
      .join('');
  }

  function excerptText(text, max = 98) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= max) return normalized;
    return `${normalized.slice(0, max).trim()}…`;
  }

  function buildPostCard(post) {
    const compactTags = buildCompactTagMarkup(post.tags, 'community-post__micro-tag');

    return `
      <article class="community-post" data-post-id="${escapeHtml(post.id)}">
        <div class="community-post__media">
          ${buildFeedArtMarkup(post.arts)}
        </div>

        <div class="community-post__body community-post__body--compact">
          <h3 class="community-post__title">${escapeHtml(post.title)}</h3>
          <p class="community-post__excerpt">${escapeHtml(excerptText(post.body))}</p>
          ${compactTags ? `<div class="community-post__micro-tags">${compactTags}</div>` : ''}

          <div class="community-post__author-row">
            <div class="community-post__author">
              <div class="community-post__avatar">${escapeHtml(getInitial(post.authorName))}</div>
              <div class="community-post__author-copy">
                <strong>${escapeHtml(post.authorName)}</strong>
                <span>${escapeHtml(formatRelativeTime(post.createdAt))}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="community-post__footer community-post__footer--compact">
          <div class="community-post__actions community-post__actions--compact">
            <button type="button" class="community-post__action ${post.liked ? 'is-active' : ''}" data-action="like" data-post-id="${escapeHtml(post.id)}">
              <i class="fas fa-heart"></i>
              <span>${escapeHtml(formatCount(post.likes))}</span>
            </button>
            <button type="button" class="community-post__action ${post.bookmarked ? 'is-active' : ''}" data-action="bookmark" data-post-id="${escapeHtml(post.id)}">
              <i class="fas fa-bookmark"></i>
              <span>${escapeHtml(formatCount(post.bookmarks))}</span>
            </button>
            <button type="button" class="community-post__action" data-action="comment" data-post-id="${escapeHtml(post.id)}">
              <i class="fas fa-comment-dots"></i>
              <span>${escapeHtml(formatCount(post.comments.length))}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFeed() {
    const feed = document.getElementById('communityFeed');
    if (!feed) return;

    const posts = getVisiblePosts();
    if (!posts.length) {
      feed.innerHTML = `
        <div class="community-feed__empty">
          <strong>这一层夜色里还没有与你的搜索相遇的梦</strong>
          <p>试试把关键词放宽一点，搜索意象、情绪或标签，例如“海浪”“旧房间”或“迟疑”。</p>
        </div>
      `;
    } else {
      feed.innerHTML = posts.map(buildPostCard).join('');
    }

    const feedStatus = document.getElementById('communityFeedStatus');
    if (feedStatus) {
      feedStatus.textContent = getFeedStatusText();
    }
  }

  function renderSearchState() {
    const input = document.getElementById('communitySearchInput');
    if (input && document.activeElement !== input) {
      input.value = state.query;
    }
  }

  function renderQuickTags() {
    const tagRail = document.getElementById('communityTagRail');
    const hotTags = getHotTags(10);

    if (tagRail) {
      const items = [['全部', state.posts.length], ...hotTags];
      tagRail.innerHTML = items.map(([tag, count]) => `
        <button type="button" class="community-tag-rail__item ${state.tag === tag ? 'is-active' : ''}" data-tag="${escapeHtml(tag)}">
          #${escapeHtml(tag)}
          <small>${escapeHtml(String(count))}</small>
        </button>
      `).join('');
    }
  }

  function renderSortTabs() {
    document.querySelectorAll('[data-sort]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.sort === state.sort);
    });
  }

  function renderComposeTags() {
    const tagBox = document.getElementById('communityComposeTags');
    if (!tagBox) return;

    tagBox.innerHTML = TAG_POOL.map((tag) => `
      <button type="button" class="community-compose__tag ${state.composeTags.has(tag) ? 'is-selected' : ''}" data-compose-tag="${escapeHtml(tag)}">
        #${escapeHtml(tag)}
      </button>
    `).join('');
  }

  function renderComposePresets() {
    const presets = document.getElementById('communityArtPresets');
    if (!presets) return;

    presets.innerHTML = Object.entries(ART_THEMES).map(([key, theme]) => `
      <button type="button" class="community-compose__preset ${state.composeTheme === key ? 'is-active' : ''}" data-art-theme="${escapeHtml(key)}" style="--preset-gradient:${theme.gradient}">
        <span class="community-compose__preset-dot"></span>
        <span>${escapeHtml(theme.name)}</span>
      </button>
    `).join('');
  }

  function renderComposePreview() {
    const preview = document.getElementById('composeArtPreview');
    if (!preview) return;

    if (state.composeImage) {
      preview.style.setProperty('--compose-art-gradient', getThemeByName(state.composeTheme).gradient);
      preview.innerHTML = `<img src="${escapeHtml(state.composeImage)}" alt="梦境艺术预览">`;
      return;
    }

    preview.style.setProperty('--compose-art-gradient', getThemeByName(state.composeTheme).gradient);
    preview.innerHTML = '';
  }

  function openCompose() {
    const shell = document.getElementById('communityCompose');
    if (!shell) return;
    shell.hidden = false;
    document.body.classList.add('community-ui-open');
  }

  function closeCompose() {
    const shell = document.getElementById('communityCompose');
    if (!shell) return;
    shell.hidden = true;
    if (document.getElementById('communityDetail')?.hidden !== false) {
      document.body.classList.remove('community-ui-open');
    }
  }

  function openDetail(postId, focusComments) {
    state.detailPostId = postId;
    renderDetail();

    const shell = document.getElementById('communityDetail');
    if (!shell) return;
    shell.hidden = false;
    document.body.classList.add('community-ui-open');

    if (focusComments) {
      requestAnimationFrame(() => {
        const commentsBlock = shell.querySelector('.community-detail__comments');
        if (commentsBlock) {
          commentsBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  function closeDetail() {
    const shell = document.getElementById('communityDetail');
    if (!shell) return;
    shell.hidden = true;
    state.detailPostId = null;
    if (document.getElementById('communityCompose')?.hidden !== false) {
      document.body.classList.remove('community-ui-open');
    }
  }

  function buildDetailMarkup(post) {
    const bodyParagraphs = escapeHtml(post.body).split('\n').filter(Boolean).map((paragraph) => `<p>${paragraph}</p>`).join('');
    const comments = post.comments.length
      ? post.comments.map((comment) => `
          <article class="community-detail__comment">
            <div class="community-detail__comment-meta">
              <strong>${escapeHtml(comment.authorName)}</strong>
              <span>${escapeHtml(formatRelativeTime(comment.createdAt))}</span>
            </div>
            <p>${escapeHtml(comment.text)}</p>
          </article>
        `).join('')
      : '<p class="community-detail__empty">还没有评论。留下第一句回声，让这场梦真的被接住。</p>';

    return `
      <article class="community-detail-post">
        <div class="community-detail-post__header">
          <div class="community-detail-post__author">
            <div class="community-detail-post__avatar">${escapeHtml(getInitial(post.authorName))}</div>
            <div class="community-detail-post__author-copy">
              <strong>${escapeHtml(post.authorName)}</strong>
              <span>在梦境广场发布了一场梦</span>
            </div>
          </div>
          <div class="community-detail-post__meta">${escapeHtml(formatRelativeTime(post.createdAt))}</div>
        </div>

        <div class="community-detail-post__media">
          <div class="community-detail-post__art-grid ${post.arts.length > 1 ? 'is-double' : ''}">
            ${buildArtItemsMarkup(post.arts)}
          </div>
        </div>

        <div class="community-detail-post__body">
          <h3 class="community-detail-post__title">${escapeHtml(post.title)}</h3>
          <div class="community-detail-post__text">${bodyParagraphs}</div>
          <div class="community-detail__tags">${buildTagMarkup(post.tags, 'community-detail__tag')}</div>
        </div>

        <div class="community-detail-post__footer">
          <div class="community-detail-post__actions">
            <button type="button" class="community-detail-post__action ${post.liked ? 'is-active' : ''}" data-action="like" data-post-id="${escapeHtml(post.id)}">
              <i class="fas fa-heart"></i>
              <span>${escapeHtml(formatCount(post.likes))}</span>
            </button>
            <button type="button" class="community-detail-post__action ${post.bookmarked ? 'is-active' : ''}" data-action="bookmark" data-post-id="${escapeHtml(post.id)}">
              <i class="fas fa-bookmark"></i>
              <span>${escapeHtml(formatCount(post.bookmarks))}</span>
            </button>
            <button type="button" class="community-detail-post__action" data-action="comment" data-post-id="${escapeHtml(post.id)}">
              <i class="fas fa-comment-dots"></i>
              <span>${escapeHtml(formatCount(post.comments.length))}</span>
            </button>
          </div>
        </div>

        <section class="community-detail__comments">
          <div class="community-detail__comments-head">
            <h4>评论区</h4>
            <span>${escapeHtml(String(post.comments.length))} 条评论</span>
          </div>
          <div class="community-detail__comment-list">${comments}</div>
          <form class="community-detail__comment-form" data-comment-form="${escapeHtml(post.id)}">
            <input type="text" name="authorName" maxlength="20" placeholder="你的昵称（选填）">
            <textarea name="comment" rows="4" maxlength="300" placeholder="写下你对这场梦的回应，或者你也梦见过的片段"></textarea>
            <button type="submit" class="community-detail__comment-submit ds-btn ds-btn-primary ds-btn-sm">发布评论</button>
          </form>
        </section>
      </article>
    `;
  }

  function renderDetail() {
    const panel = document.getElementById('communityDetailBody');
    if (!panel) return;
    const post = state.posts.find((item) => item.id === state.detailPostId);
    if (!post) {
      panel.innerHTML = '';
      return;
    }
    panel.innerHTML = buildDetailMarkup(post);
  }

  function updateAll() {
    renderSearchState();
    renderQuickTags();
    renderSortTabs();
    renderFeed();
    if (state.detailPostId) renderDetail();
  }

  function findPost(postId) {
    return state.posts.find((item) => item.id === postId);
  }

  function toggleLike(postId) {
    const post = findPost(postId);
    if (!post) return;
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    savePosts();
    updateAll();
    if (post.liked) window.showToast?.('已为这场梦点亮一个喜欢');
  }

  function toggleBookmark(postId) {
    const post = findPost(postId);
    if (!post) return;
    post.bookmarked = !post.bookmarked;
    post.bookmarks += post.bookmarked ? 1 : -1;
    savePosts();
    updateAll();
    if (post.bookmarked) window.showToast?.('这场梦已加入你的收藏');
  }

  function suggestTagsFromText(text) {
    const matches = [];
    const rules = [
      { tag: '森林', keywords: ['森林', '树', '树林'] },
      { tag: '海浪', keywords: ['海浪', '海', '水声', '海水'] },
      { tag: '门', keywords: ['门', '入口'] },
      { tag: '镜子', keywords: ['镜子', '镜', '倒影'] },
      { tag: '旧房间', keywords: ['房间', '屋', '家'] },
      { tag: '追逐', keywords: ['追', '跑', '逃'] },
      { tag: '飞行', keywords: ['飞', '天台', '翅膀'] },
      { tag: '楼梯', keywords: ['楼梯', '台阶'] },
      { tag: '平静', keywords: ['平静', '安静', '宁静'] },
      { tag: '迟疑', keywords: ['迟疑', '犹豫', '停下'] },
      { tag: '困惑', keywords: ['困惑', '不明白', '看不清'] },
      { tag: '想念', keywords: ['想念', '过去', '旧'] },
      { tag: '发光', keywords: ['发光', '光', '亮'] },
      { tag: '下沉感', keywords: ['下沉', '坠落', '往下'] }
    ];

    rules.forEach((rule) => {
      if (rule.keywords.some((keyword) => text.includes(keyword))) {
        matches.push(rule.tag);
      }
    });

    return matches.slice(0, 5);
  }

  function resetComposeForm() {
    const form = document.getElementById('communityComposeForm');
    if (form) form.reset();
    state.composeTheme = 'forest';
    state.composeImage = '';
    state.composeTags = new Set();
    renderComposePresets();
    renderComposeTags();
    renderComposePreview();
  }

  function publishPost(form) {
    const title = form.title.value.trim();
    const body = form.body.value.trim();
    const nickname = form.nickname.value.trim() || DEFAULT_NICKNAME;

    if (title.length < 2) {
      window.showToast?.('梦境标题至少写 2 个字。');
      return;
    }
    if (body.length < 12) {
      window.showToast?.('梦境描述至少写 12 个字。');
      return;
    }

    const selectedTags = [...state.composeTags];
    const tags = selectedTags.length ? selectedTags : suggestTagsFromText(`${title} ${body}`);
    const arts = state.composeImage
      ? [{ kind: 'image', src: state.composeImage }]
      : [{ kind: 'theme', theme: state.composeTheme }];

    const post = normalizePost({
      authorName: nickname,
      title,
      body,
      tags: tags.length ? tags : ['梦境记录', '这一夜'],
      arts,
      likes: 0,
      bookmarks: 0,
      comments: [],
      size: body.length > 180 ? 'tall' : arts.length > 1 ? 'wide' : 'compact'
    });

    state.posts.unshift(post);
    savePosts();
    updateAll();
    closeCompose();
    resetComposeForm();
    window.showToast?.('这场梦已经发布到梦境广场');
  }

  function addComment(postId, authorName, text) {
    const post = findPost(postId);
    if (!post) return;

    post.comments.unshift(normalizeComment({
      authorName: authorName || '今晚旅人',
      text
    }));
    savePosts();
    updateAll();
    openDetail(postId, true);
    window.showToast?.('评论已留下');
  }

  function handleFeedClick(event) {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      event.stopPropagation();
      const postId = actionButton.dataset.postId;
      const action = actionButton.dataset.action;

      if (action === 'like') toggleLike(postId);
      if (action === 'bookmark') toggleBookmark(postId);
      if (action === 'comment') openDetail(postId, true);
      return;
    }

    const card = event.target.closest('[data-post-id]');
    if (!card) return;
    openDetail(card.dataset.postId, false);
  }

  function handleToolbarClick(event) {
    const sortButton = event.target.closest('[data-sort]');
    if (sortButton) {
      state.sort = sortButton.dataset.sort || 'recommend';
      updateAll();
      return;
    }

    const tagButton = event.target.closest('[data-tag]');
    if (tagButton) {
      state.tag = tagButton.dataset.tag || '全部';
      updateAll();
    }
  }

  function initComposeTagSelection() {
    document.addEventListener('click', (event) => {
      const tagButton = event.target.closest('[data-compose-tag]');
      if (!tagButton) return;

      const tag = tagButton.dataset.composeTag;
      if (!tag) return;

      if (state.composeTags.has(tag)) {
        state.composeTags.delete(tag);
      } else if (state.composeTags.size < 6) {
        state.composeTags.add(tag);
      } else {
        window.showToast?.('最多选择 6 个标签。');
      }
      renderComposeTags();
    });
  }

  function initComposePresets() {
    document.addEventListener('click', (event) => {
      const preset = event.target.closest('[data-art-theme]');
      if (!preset) return;
      state.composeTheme = preset.dataset.artTheme || 'forest';
      state.composeImage = '';
      const imageInput = document.getElementById('composeImage');
      if (imageInput) imageInput.value = '';
      renderComposePresets();
      renderComposePreview();
    });
  }

  function applySearch(query, scrollIntoFeed) {
    state.query = String(query || '').trim();
    updateAll();

    if (scrollIntoFeed) {
      document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function initHeroSearch() {
    const form = document.getElementById('communitySearchForm');
    const input = document.getElementById('communitySearchInput');
    if (!form || !input) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      applySearch(input.value, true);
    });

    input.addEventListener('input', () => {
      if (!input.value.trim() && state.query) {
        applySearch('', false);
      }
    });
  }

  function initOpenCloseActions() {
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-open-publish]')) {
        openCompose();
      }
      if (event.target.closest('[data-close-publish]')) {
        closeCompose();
      }
      if (event.target.closest('[data-close-detail]')) {
        closeDetail();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (document.getElementById('communityCompose')?.hidden === false) closeCompose();
      if (document.getElementById('communityDetail')?.hidden === false) closeDetail();
    });
  }

  function initComposeForm() {
    const form = document.getElementById('communityComposeForm');
    const imageInput = document.getElementById('composeImage');
    if (!form || !imageInput) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      publishPost(form);
    });

    imageInput.addEventListener('change', () => {
      const file = imageInput.files && imageInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        state.composeImage = typeof reader.result === 'string' ? reader.result : '';
        renderComposePreview();
      };
      reader.readAsDataURL(file);
    });
  }

  function initFeedAndToolbar() {
    document.getElementById('communityFeed')?.addEventListener('click', handleFeedClick);
    document.getElementById('communityDetail')?.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) {
        const postId = actionButton.dataset.postId;
        const action = actionButton.dataset.action;

        if (action === 'like') toggleLike(postId);
        if (action === 'bookmark') toggleBookmark(postId);
        if (action === 'comment') {
          const commentsBlock = document.querySelector('.community-detail__comments');
          commentsBlock?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    document.querySelector('.community-toolbar')?.addEventListener('click', handleToolbarClick);
  }

  function initCommentForm() {
    document.getElementById('communityDetail')?.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-comment-form]');
      if (!form) return;
      event.preventDefault();

      const postId = form.getAttribute('data-comment-form');
      const authorName = form.authorName.value.trim();
      const comment = form.comment.value.trim();

      if (!comment || comment.length < 2) {
        window.showToast?.('评论至少写 2 个字。');
        return;
      }

      addComment(postId, authorName, comment);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    state.posts = loadPosts();
    renderComposePresets();
    renderComposeTags();
    renderComposePreview();
    updateAll();

    initHeroSearch();
    initOpenCloseActions();
    initComposeTagSelection();
    initComposePresets();
    initComposeForm();
    initFeedAndToolbar();
    initCommentForm();
  });
})();
