import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronDown, HelpCircle, Search, ShieldCheck } from 'lucide-react';

import axiosInstance from '@/api/axiosInstance';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { Card, CardContent } from '@/components/common/Card';

/**
 * Help Centre.
 *
 * Help content is fetched from a **public** endpoint on purpose: it has to be
 * reachable when you are locked out, which is exactly when you need it. The
 * topics also ship with the article text server-side rather than being hardcoded
 * in the bundle, so guidance can be corrected without a client release.
 *
 * Search posts to the API rather than filtering in the browser so that the same
 * index answers both, and so a future search can rank by relevance.
 */
const HelpCenter = () => {
  const [query, setQuery] = useState('');
  const [openArticle, setOpenArticle] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['help-topics'],
    queryFn: async () => (await axiosInstance.get('/help/topics')).data,
  });

  const search = useMutation({
    mutationFn: async (term) => (await axiosInstance.post('/help/search', { query: term })).data,
  });

  const topics = data?.topics ?? [];
  const faqs = data?.faqs ?? [];
  const results = search.data?.results ?? null;

  const onSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) { search.reset(); return; }
    search.mutate(term);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help Centre</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Security guidance, payment questions and how to recover access.
        </p>
      </header>

      <Alert variant="info" icon={ShieldCheck}>
        SecureBank will never ask for your password, one-time code or recovery codes
        by phone, SMS or email. Never sign in from a link in a message.
      </Alert>

      <form onSubmit={onSearch} role="search" className="flex gap-2">
        <div className="flex-1">
          <Input
            type="search"
            label="Search help"
            placeholder="Try “freeze card” or “phishing”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leftIcon={Search}
          />
        </div>
      </form>

      {search.isPending && <div className="flex justify-center py-6"><Spinner /></div>}

      {results && (
        <section aria-live="polite">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nothing matched. Try a shorter phrase, or browse the topics below.
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li key={`${result.title}-${index}`}>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{result.topicTitle}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{result.title}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{result.body}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
                    <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{topic.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{topic.summary}</p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1">
                  {topic.articles.map((article) => {
                    const key = `${topic.id}:${article.title}`;
                    const open = openArticle === key;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setOpenArticle(open ? null : key)}
                          aria-expanded={open}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          {article.title}
                          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>
                        {open && (
                          <p className="px-2 pb-2 text-sm text-gray-600 dark:text-gray-300">{article.body}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {faqs.length > 0 && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">About this demo</h2>
            {faqs.map((faq) => (
              <div key={faq.q}>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{faq.q}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { HelpCenter };
export default HelpCenter;
