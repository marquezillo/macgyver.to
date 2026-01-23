module.exports = {
  apps: [{
    name: 'landing-editor',
    script: 'dist/index.js',
    cwd: '/var/www/landing-editor',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      
      // Database - TiDB Cloud (from Manus sandbox)
      DATABASE_URL: 'mysql://34PJYedpVygExjM.e1ecfc4d4172:88U0uJRcHsBCm2kj75LA@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/ZbHp7JpkjVz6yScGwQHTeE?ssl={"rejectUnauthorized":true}',
      
      // JWT Secret for authentication
      JWT_SECRET: 'BLbz9mxN3j9JCbtfTVMEGM',
      
      // Manus Built-in Forge API (for LLM)
      BUILT_IN_FORGE_API_URL: 'https://forge.manus.ai',
      BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY || '23Sf5SebMSTi4hqagVVP9RBqLNyxUHoGYHqKVdqCHmVPLqJLwVjCqHLV',
      
      // AI APIs (fallback)
      ANTHROPIC_API_KEY: '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',
      OPENAI_API_KEY_CUSTOM: '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',
      GEMINI_API_KEY: 'AIzaSyCeSXdhxcFCTqe75o4rdbYbV1XFH3knNFE',
      
      // Image APIs
      UNSPLASH_ACCESS_KEY: '3lfvosoEiShJY6pRwoOosx2OSOcxvUr0NhC2McJ2Z8Q',
      PEXELS_API_KEY: 'WbnqQvZkernpBpfzskcTDNCNvtUItG2gTxqH30anh1bt5Jeq0UJhGL2R',
      PIXABAY_API_KEY: '44104616-711a0e12ee1bc29cb080900c7',
      
      // Brave Search API
      BRAVE_SEARCH_API_KEY: 'BSAKxqLc5chIga0kUGWoktz4l_lDtKC',
      
      // App ID
      VITE_APP_ID: 'ZbHp7JpkjVz6yScGwQHTeE',
    }
  }]
};
