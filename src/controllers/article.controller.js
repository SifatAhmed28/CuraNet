const Article = require('../models/Article');

/**
 * GET /api/articles?search=&category=&sort=&page=&limit=
 */
exports.listArticles = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    let sortObj = { publishedAt: -1 };
    if (sort === 'views') sortObj = { views: -1 };
    if (sort === 'likes') sortObj = { likes: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('authorId', 'name avatarUrl')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: articles,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/articles/:slug
 */
exports.getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('authorId', 'name avatarUrl')
      .lean();

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/articles/:id/like
 */
exports.likeArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, data: { likes: article.likes } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/articles — create article (doctor or admin)
 */
exports.createArticle = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, tags, coverImageUrl } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Title, content, and category are required' });
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 80);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const words = content.split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.round(words / 200));

    const article = await Article.create({
      title,
      slug,
      excerpt: excerpt || content.slice(0, 160),
      content,
      category,
      tags: tags || [],
      coverImageUrl: coverImageUrl || undefined,
      readingTimeMinutes,
      authorId: req.user._id,
      isPublished: true,
      publishedAt: new Date(),
    });

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};
