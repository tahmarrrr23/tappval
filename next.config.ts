import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["@lycorp-jp/tappy"],
};

export default config;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
