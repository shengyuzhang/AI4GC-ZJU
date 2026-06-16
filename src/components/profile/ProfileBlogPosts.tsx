import type { ReactNode } from "react";
import Link from "next/link";
import Tag from "@/components/site/Tag";
import { newsDateTimeAttr } from "@/lib/content/date";
import type { BlogChannel, BlogPost } from "@/types/lab";

type ProfileBlogPostsProps = {
  title: string;
  channels: BlogChannel[];
  posts: BlogPost[];
};

function ProfileBlogChannelCard({ channel }: { channel: BlogChannel }) {
  return (
    <a
      href={channel.href}
      className="profile-blog-card profile-blog-card--external"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="profile-blog-card__content">
        <p className="profile-blog-card__title">{channel.label}</p>
        {channel.desc ? <p className="profile-blog-card__desc">{channel.desc}</p> : null}
      </div>
      <span className="profile-blog-card__chevron profile-blog-card__chevron--external" aria-hidden>
        ↗
      </span>
    </a>
  );
}

function ProfileBlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.id}`} className="profile-blog-card profile-blog-card--onsite">
      <div className="profile-blog-card__content">
        <p className="profile-blog-card__eyebrow">
          <time dateTime={newsDateTimeAttr(post.date)}>{post.date}</time>
        </p>
        <p className="profile-blog-card__title">{post.title}</p>
        {post.desc ? <p className="profile-blog-card__desc">{post.desc}</p> : null}
        {post.tags.length > 0 ? (
          <div className="site-tag-list profile-blog-card__tags">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        ) : null}
      </div>
      <span className="profile-blog-card__chevron profile-blog-card__chevron--onsite" aria-hidden>
        ›
      </span>
    </Link>
  );
}

function ProfileBlogGroup({
  label,
  layout = "stack",
  children,
}: {
  label: string;
  layout?: "stack" | "channels";
  children: ReactNode;
}) {
  return (
    <div className="profile-markdown-blog__group">
      <h3 className="profile-markdown-blog__group-label">{label}</h3>
      <div
        className={
          layout === "channels"
            ? "profile-markdown-blog__channel-grid"
            : "profile-markdown-blog__stack"
        }
      >
        {children}
      </div>
    </div>
  );
}

export default function ProfileBlogPosts({ title, channels, posts }: ProfileBlogPostsProps) {
  if (channels.length === 0 && posts.length === 0) {
    return null;
  }

  return (
    <section className="profile-markdown-blog">
      <h2 className="profile-markdown-body__h2">{title}</h2>

      <div className="profile-markdown-blog__groups">
        {channels.length > 0 ? (
          <ProfileBlogGroup label="External" layout="channels">
            {channels.map((channel) => (
              <ProfileBlogChannelCard
                key={`${channel.platform}-${channel.href}-${channel.label}`}
                channel={channel}
              />
            ))}
          </ProfileBlogGroup>
        ) : null}

        {posts.length > 0 ? (
          <ProfileBlogGroup label="On-site">
            {posts.map((post) => (
              <ProfileBlogPostCard key={post.id} post={post} />
            ))}
          </ProfileBlogGroup>
        ) : null}
      </div>
    </section>
  );
}
