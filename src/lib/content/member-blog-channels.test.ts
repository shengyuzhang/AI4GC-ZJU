import { describe, expect, it } from "vitest";
import { extractBlogChannels, inferBlogChannelPlatform } from "@/lib/content/member-blog-channels";
import type { MemberLink } from "@/types/lab";

const pathLabel = "content/team/phds/example/";

describe("inferBlogChannelPlatform", () => {
  it("detects Xiaohongshu URLs", () => {
    expect(
      inferBlogChannelPlatform("https://www.xiaohongshu.com/user/profile/abc"),
    ).toBe("xiaohongshu");
  });

  it("detects WeChat URLs", () => {
    expect(inferBlogChannelPlatform("https://mp.weixin.qq.com/mp/appmsgshow")).toBe("wechat");
  });

  it("detects X URLs", () => {
    expect(inferBlogChannelPlatform("https://x.com/YRChen_AIsafety")).toBe("x");
    expect(
      inferBlogChannelPlatform(
        "https://x.com/intent/follow?screen_name=YRChen_AIsafety",
      ),
    ).toBe("x");
  });
});

describe("extractBlogChannels", () => {
  it("extracts and sorts blog-channel links", () => {
    const links: MemberLink[] = [
      {
        label: "Yurun Chen",
        href: "https://www.xiaohongshu.com/user/profile/abc",
        kind: "blog-channel",
        desc: "Notes",
      },
      {
        label: "AI4GC Lab",
        href: "https://mp.weixin.qq.com/s/example",
        kind: "blog-channel",
      },
    ];

    expect(extractBlogChannels(links, pathLabel)).toEqual([
      {
        label: "AI4GC Lab",
        href: "https://mp.weixin.qq.com/s/example",
        platform: "wechat",
        desc: undefined,
      },
      {
        label: "Yurun Chen",
        href: "https://www.xiaohongshu.com/user/profile/abc",
        platform: "xiaohongshu",
        desc: "Notes",
      },
    ]);
  });

  it("throws when channel cannot be inferred from URL", () => {
    expect(() =>
      extractBlogChannels(
        [{ label: "Blog", href: "https://example.com", kind: "blog-channel" }],
        pathLabel,
      ),
    ).toThrow(/recognizable WeChat, X, or Xiaohongshu URL/i);
  });
});
