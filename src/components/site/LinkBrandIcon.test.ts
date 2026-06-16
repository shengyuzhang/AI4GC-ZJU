import { describe, expect, it } from "vitest";
import { detectLinkPlatform } from "@/components/site/LinkBrandIcon";

describe("detectLinkPlatform", () => {
  it("detects X from label and follow-intent href", () => {
    expect(
      detectLinkPlatform(
        "X",
        "https://x.com/intent/follow?screen_name=YRChen_AIsafety",
      ),
    ).toBe("x");
  });

  it("detects Xiaohongshu from RedNote label and profile href", () => {
    expect(
      detectLinkPlatform(
        "RedNote (小红书)",
        "https://www.xiaohongshu.com/user/profile/abc",
      ),
    ).toBe("xiaohongshu");
  });

  it("detects Xiaohongshu from Chinese label", () => {
    expect(
      detectLinkPlatform("小红书", "https://www.xiaohongshu.com/user/profile/abc"),
    ).toBe("xiaohongshu");
  });

  it("does not treat unrelated labels as X or homepage", () => {
    expect(detectLinkPlatform("Notwitter", "https://example.com")).toBeNull();
    expect(detectLinkPlatform("Impersonal site", "https://example.com")).toBeNull();
  });
});
