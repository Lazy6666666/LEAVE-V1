/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
    optimizeCss: true,
    optimizeServerReact: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Static optimization
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Cache optimization
  async headers() {
    return [
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.(ico|png|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Enhanced chunk optimization for performance
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        // Lucide-react icons - separate chunk to enable tree-shaking
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: "lucide",
          chunks: "all",
          priority: 30,
          enforce: true,
        },
        // Recharts visualization library
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: "recharts",
          chunks: "all",
          priority: 25,
        },
        // Admin-specific code
        admin: {
          test: /[\\/]components[\\/]admin[\\/]|[\\/]app[\\/]\\(dashboard\\)[\\/]admin[\\/]/,
          name: "admin",
          chunks: "async",
          priority: 20,
        },
        // React Query and related
        query: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
          name: "query",
          chunks: "all",
          priority: 15,
        },
        // Prisma and database
        prisma: {
          test: /[\\/]node_modules[\\/]@prisma[\\/]/,
          name: "prisma",
          chunks: "all",
          priority: 15,
        },
        // Other vendors
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
          minChunks: 1,
        },
        // Common code across application
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 5,
          enforce: true,
          reuseExistingChunk: true,
        },
      },
    };

    // Improve module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize module resolution
      "@": require("path").resolve(__dirname, "."),
    };

    // SVG optimization with better compression
    config.module.rules.push({
      test: /\.svg$/,
      oneOf: [
        {
          resourceQuery: /component/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                svgo: true,
                svgoConfig: {
                  plugins: [
                    {
                      name: "preset-default",
                      params: {
                        overrides: {
                          removeViewBox: false,
                          cleanupIds: true,
                          removeComments: true,
                          removeMetadata: true,
                          convertColors: true,
                          removeUselessStrokeAndFill: true,
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024, // 4kb
            },
          },
        },
      ],
    });

    // Bundle analyzer for production
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
        })
      );
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
