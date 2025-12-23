import { BlogsResponse, BlogDetail } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Public: Get blogs (for landing page)
export const getBlogs = async (page: number = 1, perPage: number = 3): Promise<BlogsResponse> => {
  const response = await apiRequest(`blogs/more-blogs?page=${page}&perPage=${perPage}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch blogs');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch blogs');
  }

  return data?.payload ?? { itemsReceived: 0, curPage: 1, nextPage: null, prevPage: null, offset: 0, itemsTotal: 0, pageTotal: 0, items: [] };
};

// Public: Get featured blogs
export const getFeaturedBlogs = async (page: number = 1, perPage: number = 10): Promise<BlogsResponse> => {
  const response = await apiRequest(`blogs/featured-blogs?page=${page}&perPage=${perPage}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch featured blogs');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch featured blogs');
  }

  return data?.payload ?? { itemsReceived: 0, curPage: 1, nextPage: null, prevPage: null, offset: 0, itemsTotal: 0, pageTotal: 0, items: [] };
};

// Public: Get blog detail by ID
export const getBlogDetail = async (blogId: string): Promise<BlogDetail> => {
  const response = await apiRequest(`blogs/blog-detail?blog_id=${blogId}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch blog details');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch blog details');
  }

  return data?.payload;
};

// Protected: Delete blog (requires admin authentication)
export interface DeleteBlogRequest {
  blog_post_id: string;
}

export interface DeleteBlogResponse {
  status: boolean;
  message: string;
}

export const deleteBlog = async (
  payload: DeleteBlogRequest,
  adminToken: string
): Promise<DeleteBlogResponse> => {
  const response = await apiRequest(
    'blogs/delete-blog',
    {
      method: 'DELETE',
      body: JSON.stringify(payload),
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete blog');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to delete blog');
  }

  return data;
};

// Protected: Get blog categories (requires admin authentication)
export interface BlogCategory {
  id: string;
  name: string;
}

export interface BlogCategoriesResponse {
  status: boolean;
  message: string;
  payload?: BlogCategory[];
}

export const getBlogCategories = async (adminToken: string): Promise<BlogCategory[]> => {
  const response = await apiRequest(
    'blogs/blog-category',
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch blog categories');
  }

  const data: BlogCategoriesResponse = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch blog categories');
  }

  return data?.payload ?? [];
};

// Protected: Create blog (requires admin authentication)
export interface CreateBlogRequest {
  blog_title: string;
  content: string;
  blog_category_id: string;
  image: File;
}

export interface CreateBlogResponse {
  status: boolean;
  message: string;
  payload?: {
    id: string;
    title: string;
    [key: string]: unknown;
  };
}

export const createBlog = async (
  payload: CreateBlogRequest,
  adminToken: string
): Promise<CreateBlogResponse> => {
  const formData = new FormData();
  formData.append('image', payload.image);
  formData.append('blog_title', payload.blog_title);
  formData.append('content', payload.content);
  formData.append('blog_category_id', payload.blog_category_id);

  const response = await apiRequest(
    'blogs/create-blog',
    {
      method: 'POST',
      body: formData,
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create blog');
  }

  const data: CreateBlogResponse = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to create blog');
  }

  return data;
};

// Protected: Update blog (requires admin authentication)
export interface UpdateBlogRequest {
  blog_post_id: string;
  blog_title: string;
  content: string;
  blog_category_id: string;
  image: File;
}

export interface UpdateBlogResponse {
  status: boolean;
  message: string;
  payload?: {
    id: string;
    title: string;
    [key: string]: unknown;
  };
}

export const updateBlog = async (
  payload: UpdateBlogRequest,
  adminToken: string
): Promise<UpdateBlogResponse> => {
  const formData = new FormData();
  formData.append('blog_post_id', payload.blog_post_id);
  formData.append('image', payload.image);
  formData.append('blog_title', payload.blog_title);
  formData.append('content', payload.content);
  formData.append('blog_category_id', payload.blog_category_id);

  const response = await apiRequest(
    'blogs/edit-blog',
    {
      method: 'PUT',
      body: formData,
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update blog');
  }

  const data: UpdateBlogResponse = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to update blog');
  }

  return data;
};

