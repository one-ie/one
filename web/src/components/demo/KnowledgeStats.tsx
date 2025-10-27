import { BarChart3, Search, Zap, TrendingUp, Database } from 'lucide-react';

interface KnowledgeStatsProps {
  itemCount: number;
  backendConnected: boolean;
}

export default function KnowledgeStats({ itemCount, backendConnected }: KnowledgeStatsProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Knowledge Statistics & Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Items Count */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <Database size={24} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total Items</span>
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{itemCount}</p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">knowledge items indexed</p>
        </div>

        {/* Search Latency */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-3">
            <Zap size={24} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Avg Latency</span>
          </div>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">42ms</p>
          <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">semantic search</p>
        </div>

        {/* Embedding Dimensions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 size={24} className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Embeddings</span>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">1.5K</p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">dimensions per vector</p>
        </div>

        {/* Search Quality */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-3">
            <Search size={24} className="text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Accuracy</span>
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">94%</p>
          <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">relevance score</p>
        </div>

        {/* Backend Status */}
        <div className={`bg-gradient-to-br rounded-lg p-6 border ${
          backendConnected
            ? 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800'
            : 'from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-900/10 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp size={24} className={backendConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'} />
            <span className={`text-xs font-semibold ${
              backendConnected
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}>Backend</span>
          </div>
          <p className={`text-xl font-bold ${
            backendConnected
              ? 'text-emerald-900 dark:text-emerald-100'
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {backendConnected ? 'Connected' : 'Demo Mode'}
          </p>
          <p className={`text-sm ${
            backendConnected
              ? 'text-emerald-600 dark:text-emerald-300'
              : 'text-slate-600 dark:text-slate-300'
          } mt-1`}>
            {backendConnected ? 'Real data' : 'Mock data'}
          </p>
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">How Semantic Search Works</h3>
          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <li>1. Query converted to 1,536-dim vector</li>
            <li>2. Database searched for similar vectors</li>
            <li>3. Results ranked by cosine similarity</li>
            <li>4. Top matches returned with scores</li>
          </ol>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">Vector Similarity Scoring</h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <li>100% = Exact semantic match</li>
            <li>80-99% = Very similar meaning</li>
            <li>60-79% = Related concepts</li>
            <li>&lt;60% = Marginally relevant</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">RAG Pipeline</h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <li>Retrieve: Find relevant knowledge</li>
            <li>Augment: Inject into LLM context</li>
            <li>Generate: LLM creates response</li>
            <li>Cite: Original sources referenced</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
