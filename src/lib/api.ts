export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Ensure trailing slash because next.config.mjs specifies trailingSlash: true
  // Without trailing slash, Next.js sends a 308 redirect which breaks browser POST fetch requests
  const [basePath, search] = cleanPath.split('?');
  const formattedPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const finalPath = search ? `${formattedPath}?${search}` : formattedPath;

  if (typeof window !== 'undefined') {
    return finalPath;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028';
  return `${baseUrl}${finalPath}`;
};
