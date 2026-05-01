import axios, { AxiosError } from 'axios';
import { env } from '../config/env.js';

const client = axios.create({
  baseURL: env.canvasApiUrl,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${env.canvasApiToken}`,
  },
});

function parseNextLink(linkHeader?: string): string | null {
  if (!linkHeader) return null;
  const parts = linkHeader.split(',').map((segment) => segment.trim());
  const nextPart = parts.find((segment) => segment.includes('rel="next"'));
  if (!nextPart) return null;
  const match = nextPart.match(/<([^>]+)>/);
  return match?.[1] || null;
}

async function getWithRetry<T>(url: string, attempt = 0): Promise<T> {
  try {
    const response = await client.get<T>(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    const canRetry = !axiosError.response && attempt < 2;
    if (canRetry) {
      return getWithRetry<T>(url, attempt + 1);
    }
    throw error;
  }
}

export async function getPaginated<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | null = path;

  while (nextUrl) {
    const response = await client.get<T[]>(nextUrl);
    results.push(...response.data);

    const linkHeader = response.headers.link as string | undefined;
    const parsed = parseNextLink(linkHeader);
    if (!parsed) {
      nextUrl = null;
      continue;
    }

    const url = new URL(parsed);
    nextUrl = `${url.pathname}${url.search}`;
  }

  return results;
}

export async function getJson<T>(path: string): Promise<T> {
  return getWithRetry<T>(path);
}
