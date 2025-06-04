import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config, { isServer }) => {
    config.target = isServer ? 'node18' : ['web', 'es2022'];

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
