import { Navigate, useParams } from 'react-router-dom';
import { allBlogs } from '../../data/blogIndex';

export default function DynamicBlogReader() {
  const { blogSlug } = useParams();
  const currentBlog = allBlogs.find((blog) => blog.slug === blogSlug);

  if (!currentBlog) {
    return <Navigate to="/blog" replace />;
  }

  const BlogContentComponent = currentBlog.Component;

  return (
    <div data-blog-page className="min-h-screen flex-1 overflow-y-auto bg-[#0b0f19]">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <BlogContentComponent />
      </div>
    </div>
  );
}
