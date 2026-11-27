import React from 'react';
import BlogLayout from './BlogLayout';
import useBlogList from './useBlogList';
import useDocumentMeta from './useDocumentMeta';
import Hero from './list/Hero';
import FeaturedPost from './list/FeaturedPost';
import CategoryTabs from './list/CategoryTabs';
import Toolbar from './list/Toolbar';
import PostGrid from './list/PostGrid';
import LoadMore from './list/LoadMore';
import Archive from './list/Archive';
import InviteCta from './list/InviteCta';

/** /blogs: masthead, featured article, filterable grid with load more, archive and a closing invitation. */
export default function BlogList() {
  const list = useBlogList();

  useDocumentMeta({
    title: 'Insights & Articles | Kalpvriksh Global',
    description: 'Articles on personal finance, investing and wealth building by Rakhi Jain, Chartered Accountant.',
  });

  return (
    <BlogLayout>
      <Hero />
      {list.featured && <FeaturedPost post={list.featured} />}
      <section className="kj-wrap kj-discover" aria-label="Articles">
        <CategoryTabs
          categories={list.categories}
          active={list.filters.category}
          onSelect={(value) => list.setFilter({ category: value })}
        />
        <Toolbar list={list} />
        <PostGrid list={list} />
        <LoadMore list={list} />
      </section>
      <Archive archive={list.archive} activeMonth={list.filters.month} onSelect={(value) => list.setFilter({ month: value })} />
      <InviteCta />
    </BlogLayout>
  );
}
