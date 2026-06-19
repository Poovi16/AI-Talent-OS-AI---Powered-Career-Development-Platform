// ═══════════════════════════════════════════════════════════════
// INTERVIEW ANSWER DATABASE — Real, Substantive Answers
// Maps question fragments → complete ideal answers with
// key points, common mistakes, and evaluation criteria.
// ═══════════════════════════════════════════════════════════════

export interface AnswerDBEntry {
  answer: string;
  keyPoints: string[];
  mistakes: string[];
}

const answerDB: Record<string, AnswerDBEntry> = {

  // ═══════════════════════════════════════
  //  AI ENGINEER
  // ═══════════════════════════════════════

  'fine-tuning and rag': {
    answer: `Fine-tuning modifies the model's weights by training on domain-specific data, making the model itself an expert. RAG (Retrieval-Augmented Generation) keeps the base model unchanged and instead retrieves relevant documents at query time, injecting them into the prompt as context.

**Choose fine-tuning when:** You need the model to adopt a specific tone, format, or deeply internalized knowledge (e.g., legal document generation). It's best when training data is stable and you can afford the compute cost.

**Choose RAG when:** Your knowledge base changes frequently (e.g., product docs, news), you need source attribution, or you want to avoid hallucination by grounding responses in retrieved facts.

**In practice**, most production systems use both — a fine-tuned model for style/format combined with RAG for factual grounding. The key trade-off is cost vs. freshness: fine-tuning is expensive but fast at inference; RAG adds latency from retrieval but keeps data current.`,
    keyPoints: ['Clear definition of both approaches with how they work internally', 'When to use each with real-world examples', 'Trade-offs: cost, latency, freshness, hallucination risk', 'Hybrid approach used in production systems', 'Practical decision framework for choosing between them'],
    mistakes: ['Saying fine-tuning "teaches new knowledge" — it primarily adjusts behavior and style', 'Ignoring cost and compute implications of fine-tuning', 'Not mentioning RAG\'s dependency on retrieval quality and chunk size', 'Forgetting to discuss hybrid approaches used in real production']
  },

  'production ml inference pipeline': {
    answer: `For a 10K req/s ML inference pipeline, I would design a multi-layer architecture:

**1. API Gateway:** NGINX or AWS API Gateway for rate limiting, authentication, and request routing. This handles SSL termination and shields the model servers.

**2. Load Balancer:** Distributes requests across model servers using least-connections strategy to avoid overloading any single GPU.

**3. Model Serving:** Use Triton Inference Server or vLLM for GPU-optimized inference. Deploy models as gRPC services for low-latency inter-service communication.

**4. Dynamic Batching:** Accumulate requests over a small window (5-10ms) to maximize GPU utilization. This alone can improve throughput by 3-5x compared to single-request inference.

**5. Caching Layer:** Redis cache for identical or semantically similar queries. With embedding-based similarity matching, cache hit rates can reach 30-40% in production.

**6. Auto-scaling:** Kubernetes HPA based on GPU utilization and request queue depth, with pre-warmed instances to handle traffic spikes without cold-start delays.

**7. Monitoring:** Track p50/p95/p99 latency, throughput, GPU memory utilization, and model accuracy drift using Prometheus + Grafana dashboards.

For 10K req/s, I'd estimate 8-12 GPU instances with dynamic batching, achieving sub-100ms p95 latency for standard transformer models.`,
    keyPoints: ['Multi-layer architecture with each component explained', 'Dynamic batching as a key GPU optimization technique', 'Caching strategy with realistic hit rate estimates', 'Auto-scaling with specific metrics and pre-warming', 'Monitoring with precise metrics (p50/p95/p99)'],
    mistakes: ['Not mentioning GPU-specific optimizations like batching and quantization', 'Ignoring cold start and scale-up latency for GPU instances', 'Forgetting monitoring and observability', 'Not providing concrete scale estimates']
  },

  'deploying llms to production': {
    answer: `The key challenges in deploying LLMs to production are:

**1. Latency & Cost:** LLMs are computationally expensive. A single GPT-4 call costs ~$0.03 and takes 2-5 seconds. Solutions: model quantization (INT8/INT4 reduces memory by 50-75%), KV-cache optimization, speculative decoding, and using smaller distilled models where full capability isn't needed.

**2. Hallucination:** Models confidently generate false information. Mitigations: RAG for grounding in real data, output validation layers that cross-check facts, confidence scoring, and human-in-the-loop for critical decisions.

**3. Prompt Injection & Security:** Users can manipulate prompts to bypass safety guardrails. Solutions: input sanitization, guardrail models (like Llama Guard), output filtering for PII/sensitive data, and multi-layer defense.

**4. Evaluation:** Unlike traditional ML with clear accuracy metrics, LLM quality is subjective. Requires combination of automated metrics (BLEU, ROUGE, BERTScore), LLM-as-judge evaluation, and regular human review pipelines.

**5. Versioning & Reproducibility:** Managing model versions, prompt versions, and RAG index versions simultaneously requires robust MLOps infrastructure with rollback capabilities.

**6. Compliance & Privacy:** Data privacy (GDPR, HIPAA), PII detection in inputs/outputs, audit logging, and ensuring training data compliance for regulated industries.`,
    keyPoints: ['Latency optimization with specific techniques and cost numbers', 'Hallucination mitigation strategies', 'Security concerns including prompt injection', 'Evaluation methodology for subjective quality', 'Versioning and compliance considerations'],
    mistakes: ['Only mentioning cost without specific mitigation techniques', 'Ignoring security and prompt injection risks', 'Not discussing evaluation challenges unique to LLMs', 'Forgetting compliance and data privacy requirements']
  },

  'transformer attention mechanism': {
    answer: `The transformer attention mechanism computes relationships between all positions in a sequence simultaneously, enabling the model to understand context regardless of distance.

For each token, it creates three vectors through learned linear projections:
• **Query (Q)** — "What am I looking for?"
• **Key (K)** — "What do I contain?"
• **Value (V)** — "What information do I provide?"

**Self-Attention Formula:** Attention(Q, K, V) = softmax(QK^T / √d_k) × V

The dot product QK^T measures similarity between tokens. Division by √d_k (scaling factor) prevents the softmax from producing extremely peaked distributions, which would cause vanishing gradients. The softmax output weights each Value vector by its relevance.

**Multi-Head Attention** runs this computation h times in parallel (typically h=8 or 16) with different learned projections, then concatenates results. This allows the model to attend to different relationship types simultaneously — one head might capture syntax, another semantics, another coreference.

**Computational Complexity:** O(n² × d) where n is sequence length and d is model dimension. This quadratic scaling is the primary bottleneck — a 4K token input requires 16 million attention computations. Modern solutions include:
• **Flash Attention** — memory-efficient GPU kernel, 2-4x faster
• **Sparse Attention** — only compute attention for nearby tokens + selected global tokens
• **Sliding Window Attention** (Mistral) — fixed window with a few global attention tokens`,
    keyPoints: ['Q, K, V vectors with intuitive explanation of each role', 'Complete attention formula with scaling factor justification', 'Multi-head attention purpose — capturing different relationship types', 'O(n²d) complexity with practical implication (16M computations for 4K tokens)', 'Modern optimizations: Flash Attention, sparse attention, sliding window'],
    mistakes: ['Not explaining why the √d_k scaling factor is needed', 'Confusing self-attention with cross-attention', 'Forgetting to mention the quadratic complexity bottleneck', 'Not discussing modern optimization techniques']
  },

  'quality of a rag system': {
    answer: `RAG evaluation requires measuring both the retrieval component and the generation component separately, plus end-to-end quality:

**Retrieval Metrics:**
• **Recall@k** — Does the correct document appear in top-k results? Target: >90% for k=5
• **MRR (Mean Reciprocal Rank)** — How high does the correct document rank? Target: >0.8
• **Context Relevance** — Are the retrieved chunks actually relevant to the query? Measured via LLM-as-judge or human annotation.

**Generation Metrics:**
• **Faithfulness** — Does the answer ONLY use information from retrieved context? This is critical for preventing hallucination. Measure by checking if every claim in the answer can be traced to a retrieved chunk.
• **Answer Relevance** — Does the response actually answer the user's question?
• **Completeness** — Are all aspects of the question addressed?

**End-to-End Evaluation:**
• **RAGAS Framework** — Combines faithfulness, answer relevance, and context metrics into a unified score
• **Golden Dataset** — Curated set of 200+ question-answer pairs with expert annotations for regression testing
• **A/B Testing** — Compare RAG versions using user satisfaction, task completion rates, and click-through rates

I set up automated evaluation pipelines that run on every index rebuild to catch regression early, with Slack alerts if any metric drops more than 5%.`,
    keyPoints: ['Separate retrieval and generation evaluation', 'Specific metrics with concrete targets', 'RAGAS framework for unified scoring', 'Golden dataset for regression testing', 'Automated CI pipeline for continuous evaluation'],
    mistakes: ['Only measuring generation quality without evaluating retrieval', 'Not measuring faithfulness (hallucination detection)', 'Ignoring end-to-end evaluation with real users', 'No automated regression testing on index updates']
  },

  // ═══════════════════════════════════════
  //  MACHINE LEARNING ENGINEER
  // ═══════════════════════════════════════

  'data parallelism vs model parallelism': {
    answer: `**Data Parallelism** replicates the entire model on each GPU and splits training data across them. Each GPU processes a different mini-batch, computes gradients independently, then gradients are synchronized via AllReduce before the weight update. It's the simplest form and works well when the model fits in a single GPU's memory.

**Model Parallelism** splits the model itself across GPUs:
• **Tensor Parallelism** — Splits individual layers (e.g., a large matrix multiplication) across GPUs within a single node. Used when individual layers are too large for one GPU.
• **Pipeline Parallelism** — Splits the model by layers, with each GPU handling a subset. Requires micro-batching to minimize idle GPU time (called "pipeline bubbles").

**When to use which:**
• Model fits in one GPU → Data Parallelism (simplest, most communication-efficient)
• Model too large for one GPU → Tensor + Pipeline Parallelism
• Very large models (GPT-3 scale, 175B+ params) → 3D Parallelism combining all three types

**Modern frameworks blur these boundaries:**
• **DeepSpeed ZeRO** (Stages 1-3) — Shards optimizer states, gradients, and parameters across GPUs while maintaining data-parallel semantics. Stage 3 can train a 13B parameter model on a single GPU with 32GB.
• **PyTorch FSDP** — Similar to ZeRO Stage 3, integrated into PyTorch core.

**Key trade-off:** Data parallelism has communication overhead (gradient sync), model parallelism has computation overhead (pipeline bubbles, activation recomputation).`,
    keyPoints: ['Clear definition of both with how they work', 'Tensor vs Pipeline parallelism distinction', 'Decision framework: when to use which approach', '3D parallelism for very large models', 'Modern frameworks: DeepSpeed ZeRO, FSDP with specific capabilities'],
    mistakes: ['Not distinguishing tensor from pipeline parallelism', 'Forgetting gradient synchronization overhead in data parallelism', 'Not mentioning pipeline bubbles in pipeline parallelism', 'Ignoring modern hybrid approaches (ZeRO, FSDP)']
  },

  'training-serving skew': {
    answer: `Training-serving skew occurs when features computed during training differ from those computed at inference time, causing model performance degradation. Here's my approach to preventing it:

**1. Feature Store as Single Source of Truth:** Use a feature store like Feast or Tecton where both training and serving pipelines pull features from the same computation logic. Training uses historical features; serving uses the same logic in real-time.

**2. Point-in-Time Correctness:** During training, always join features using event timestamps — never use "latest" feature values for historical examples. This prevents future data leakage and ensures training mirrors what the model would see in production.

**3. Schema Validation:** Enforce feature schemas with data type, range, and distribution checks at pipeline boundaries. Tools like Great Expectations or TensorFlow Data Validation (TFDV) catch drift early.

**4. Shadow Mode Monitoring:** Before switching to a new feature pipeline in production, run it alongside the existing one, comparing outputs. Alert if feature distributions diverge beyond a threshold (using KL divergence or Population Stability Index).

**5. Integration Tests:** Write tests that compute features for known inputs and assert expected outputs. Run these on every feature pipeline change.

**Common root causes I've seen:** timezone mismatches between training and serving, different aggregation windows (30-day vs 28-day), library version differences (NumPy rounding), and missing value handling inconsistencies.`,
    keyPoints: ['Feature store as single source of truth', 'Point-in-time correctness to prevent leakage', 'Schema validation and distribution monitoring', 'Shadow mode deployment for safe transitions', 'Concrete root causes from production experience'],
    mistakes: ['Not using a centralized feature store', 'Ignoring point-in-time correctness', 'Skipping distribution monitoring between training and serving', 'Not having automated tests for feature computation']
  },

  'model monitoring and drift detection': {
    answer: `My approach to production model monitoring covers three layers:

**1. Data Drift Detection:**
• Monitor input feature distributions using Population Stability Index (PSI) and Kolmogorov-Smirnov tests
• Set thresholds: PSI > 0.2 = significant drift requiring investigation
• Track missing value rates, cardinality changes, and new categorical values
• Tools: Evidently AI, NannyML, or custom dashboards in Grafana

**2. Prediction Drift:**
• Monitor prediction distribution shifts (even without ground truth labels)
• Track confidence score distributions — sudden shifts indicate the model is uncertain about new data patterns
• Compare predicted class distributions against historical baselines

**3. Performance Monitoring (when ground truth is available):**
• Track core metrics: accuracy, precision, recall, F1, AUC-ROC
• Implement delayed label joins — in many systems, ground truth arrives hours or days later
• Segment performance by key dimensions (geography, user cohort, time of day)
• Set automated alerts: >5% degradation triggers investigation, >10% triggers model retraining

**Response Playbook:**
• Minor drift → Log and monitor, may self-correct
• Moderate drift → Trigger scheduled retraining with recent data
• Severe drift → Switch to fallback model or rule-based system while retraining
• Track model age — I typically schedule periodic retraining every 2-4 weeks regardless of drift signals.`,
    keyPoints: ['Three-layer monitoring: data drift, prediction drift, performance', 'Specific statistical tests (PSI, KS) with thresholds', 'Delayed label handling strategy', 'Automated response playbook with severity levels', 'Scheduled retraining cadence'],
    mistakes: ['Only monitoring prediction accuracy without input drift', 'Not having a response playbook for different drift severities', 'Ignoring delayed label join challenges', 'Not segmenting performance by key dimensions']
  },

  'batch and real-time inference': {
    answer: `**Batch Inference** processes a large dataset of inputs offline on a schedule (hourly, daily). Results are stored and served from a database or cache.

**Real-Time Inference** processes individual requests on-demand with low-latency requirements (typically <100ms).

**Key Differences:**

| Aspect | Batch | Real-Time |
|--------|-------|-----------|
| Latency | Minutes to hours | Milliseconds |
| Throughput | Very high (optimized) | Variable |
| Cost | Lower (GPU utilization) | Higher (always-on) |
| Freshness | Stale until next batch | Always current |
| Infrastructure | Spark, Airflow, scheduled jobs | Model server, load balancer |

**When to use Batch:**
• Recommendation systems that update nightly (Netflix, Spotify)
• Fraud scoring for next-day review
• Email campaign personalization
• Large-scale data labeling

**When to use Real-Time:**
• Search ranking and autocomplete
• Real-time fraud detection at payment time
• Chatbots and conversational AI
• Dynamic pricing

**Hybrid Pattern (most common in production):**
Pre-compute batch predictions for known entities (existing users, popular items), fall back to real-time inference for unknown inputs. This gives you batch-level cost with real-time freshness where it matters. For example, Netflix pre-computes recommendations for 90% of users nightly, but runs real-time inference for new users or trending content.`,
    keyPoints: ['Clear definition with key metrics (latency, throughput, cost)', 'Comparison table showing trade-offs', 'Concrete examples for each approach', 'Hybrid pattern as the production best practice', 'Cost optimization through intelligent routing'],
    mistakes: ['Treating it as a binary choice instead of discussing hybrid approaches', 'Not mentioning cost implications', 'Forgetting freshness as a key trade-off', 'No concrete examples of when to use each']
  },

  // ═══════════════════════════════════════
  //  DATA SCIENTIST
  // ═══════════════════════════════════════

  'xgboost handle missing values': {
    answer: `XGBoost handles missing values natively through its "sparsity-aware" split finding algorithm — no imputation is needed.

**How it works:**
During tree construction, when XGBoost encounters a feature with missing values at a split point, it tries routing all missing-value samples to both the left child and the right child. It picks the direction that yields the best information gain.

**Specifically:**
1. For each candidate split, XGBoost computes the gain twice — once with missing values going left, once going right
2. The direction producing higher gain becomes the "default direction" for that split
3. This default direction is stored in the tree and used at inference time for any missing values

**Why this is powerful:**
• No manual imputation needed — the model learns the optimal handling automatically
• The optimal direction can differ per feature, per split — much more nuanced than global imputation
• It handles both random missingness (MCAR) and systematic missingness (MNAR) well
• At inference time, it handles new missing patterns it didn't see during training

**Important nuances:**
• XGBoost treats NaN, None, and np.nan as missing — they're equivalent
• If your data uses sentinel values like -999 or 0 for missing, convert them to NaN first
• Sparse matrices (scipy.sparse) are also handled efficiently using the same algorithm
• LightGBM uses a similar approach but assigns missing values to the side with the larger number of samples by default`,
    keyPoints: ['Sparsity-aware split finding algorithm', 'Tries both directions and picks the higher gain', 'Default direction stored per split node', 'No manual imputation required', 'Handles both random and systematic missingness'],
    mistakes: ['Saying "XGBoost ignores missing values"', 'Claiming it uses mean/median imputation internally', 'Not explaining the two-direction gain comparison', 'Forgetting that sentinel values need conversion to NaN']
  },

  'a/b test': {
    answer: `Here's my process for designing a rigorous A/B test for a recommendation algorithm:

**1. Hypothesis & Metrics:**
• Primary metric (guardrail): Click-through rate (CTR) or conversion rate — the metric the new algorithm must improve
• Secondary metrics: Revenue per session, engagement time, diversity of recommendations
• Guardrail metrics: Page load time, bounce rate — metrics that must NOT degrade

**2. Statistical Design:**
• Minimum Detectable Effect (MDE): Define the smallest improvement worth detecting (e.g., 2% relative lift in CTR)
• Power analysis: Calculate sample size. For CTR baseline of 5%, MDE of 2% relative lift, α=0.05, power=0.80 → ~100K users per variant
• Duration: Run for at least 2 full business cycles (typically 2-4 weeks) to capture day-of-week and seasonal effects

**3. Randomization:**
• User-level randomization (not session-level) to avoid novelty bias
• Stratify by key segments: new vs returning users, device type, geography
• Hash user ID to deterministically assign variants (consistent experience)

**4. Implementation:**
• Control group: Current algorithm (50%)
• Treatment group: New algorithm (50%)
• Implement through a feature flag system
• Log all recommendations shown AND user interactions

**5. Analysis:**
• Pre-check: Verify groups are balanced on pre-experiment metrics (Sample Ratio Mismatch test)
• Primary analysis: Two-sample z-test or Mann-Whitney U for non-normal distributions
• Confidence intervals rather than just p-values
• Segment analysis: Check for heterogeneous treatment effects across user segments
• If inconclusive: Extend the test duration or increase MDE rather than p-hacking`,
    keyPoints: ['Clear hypothesis with primary, secondary, and guardrail metrics', 'Power analysis with concrete numbers', 'User-level randomization with stratification', 'Sample Ratio Mismatch as a pre-check', 'Segment analysis for heterogeneous effects'],
    mistakes: ['Not calculating required sample size upfront', 'Stopping the test early based on "looking at results"', 'Session-level instead of user-level randomization', 'Only reporting p-values without confidence intervals']
  },

  'l1 and l2 regularization': {
    answer: `L1 (Lasso) and L2 (Ridge) regularization both add penalty terms to the loss function to prevent overfitting, but they work fundamentally differently:

**L1 Regularization (Lasso):** Adds λ × Σ|w_i| — the sum of absolute values of weights.
• Creates a diamond-shaped constraint region in weight space
• Tends to push weights exactly to zero → produces sparse models
• Effectively performs automatic feature selection
• Use when you suspect many features are irrelevant or redundant

**L2 Regularization (Ridge):** Adds λ × Σw_i² — the sum of squared weights.
• Creates a circular constraint region in weight space
• Shrinks all weights toward zero but rarely makes them exactly zero
• Better handles multicollinearity (correlated features)
• Use when all features are likely relevant but you want to prevent any single feature from dominating

**Why L1 produces sparsity (geometric intuition):**
The diamond shape of the L1 constraint has corners on the axes. The optimal point where the loss function contour meets the constraint boundary is more likely to be at a corner (where some weights = 0) than on a flat edge. The L2 circle has no corners, so the intersection rarely lands exactly at zero.

**Elastic Net** combines both: α×L1 + (1-α)×L2. This gives feature selection (from L1) with group stability for correlated features (from L2).

**Practical guidance:** L2 is my default choice. I switch to L1 when I have hundreds of features and need selection. I use Elastic Net when I suspect correlated feature groups (e.g., gene expression data).`,
    keyPoints: ['Mathematical formulation of both penalties', 'Geometric explanation for why L1 produces sparsity', 'Clear practical guidance on when to use each', 'Elastic Net as the hybrid solution', 'Multicollinearity handling as L2 advantage'],
    mistakes: ['Not explaining why L1 produces exact zeros (the geometric intuition)', 'Confusing the penalty terms or their effects', 'Forgetting to mention Elastic Net', 'No practical decision framework for choosing between them']
  },

  'linear regression': {
    answer: `Linear regression makes five key assumptions (OLS assumptions), and violating them affects different aspects of the model:

**1. Linearity** — The relationship between features and target is linear.
• Violation: Curved patterns in residual plots → biased predictions
• Detection: Residual vs fitted plot should show random scatter
• Fix: Polynomial features, log transforms, or switch to non-linear models

**2. Independence of Errors** — Residuals are independent of each other.
• Violation: Common in time-series data (autocorrelation) → underestimated standard errors
• Detection: Durbin-Watson test (values near 2 indicate independence)
• Fix: Time-series models (ARIMA), or add lagged features

**3. Homoscedasticity** — Constant variance of residuals across all levels of X.
• Violation: Fan-shaped residual plots → inefficient estimates, wrong confidence intervals
• Detection: Breusch-Pagan test, White's test
• Fix: Weighted least squares, log transform of target, robust standard errors

**4. Normality of Residuals** — Residuals follow a normal distribution.
• Violation: Affects hypothesis tests and confidence intervals (less critical for large n)
• Detection: Q-Q plot, Shapiro-Wilk test
• Fix: Transform target variable, use bootstrap confidence intervals

**5. No Perfect Multicollinearity** — Features are not perfect linear combinations of each other.
• Violation: Cannot invert X^TX matrix → unstable coefficients
• Detection: Variance Inflation Factor (VIF > 10 is concerning)
• Fix: Remove correlated features, PCA, or Ridge regression (L2)

In practice, I always check residual plots and VIF before interpreting a linear regression model.`,
    keyPoints: ['All five OLS assumptions clearly stated', 'How to detect each violation', 'How to fix each violation', 'Practical detection tools (Durbin-Watson, VIF, Q-Q plots)', 'Real-world checking process'],
    mistakes: ['Only listing assumptions without discussing violations and fixes', 'Forgetting homoscedasticity or independence', 'Not mentioning diagnostic tools', 'Treating normality as critical for large sample sizes']
  },

  // ═══════════════════════════════════════
  //  DATA ANALYST
  // ═══════════════════════════════════════

  'dataset with 30% missing values': {
    answer: `With 30% missing values, the approach depends heavily on the missingness mechanism and the specific columns affected:

**Step 1: Diagnose the Missingness Pattern**
• **MCAR** (Missing Completely At Random): Missingness is independent of any variable. Test with Little's MCAR test.
• **MAR** (Missing At Random): Missingness depends on observed variables (e.g., older users skip income field). Most common in practice.
• **MNAR** (Missing Not At Random): Missingness depends on the missing value itself (e.g., high earners don't report income). Hardest to handle.

**Step 2: Decide Per-Column Strategy**
• If a column has >60% missing → Consider dropping it (low information value)
• If missing values correlate with a specific segment → Treat missingness as a feature (create "is_missing" indicator column)
• For numerical columns (MAR) → Multiple imputation or KNN imputation (not just mean/median, which distorts distribution)
• For categorical columns → Mode imputation or create a "Missing" category

**Step 3: Imputation Techniques (by complexity)**
1. **Simple:** Mean/median/mode — fast but distorts variance and correlations
2. **Better:** KNN Imputation — uses similar rows to estimate missing values, preserves local patterns
3. **Best:** Iterative/MICE (Multiple Imputation by Chained Equations) — models each missing column as a function of others, runs multiple iterations
4. **For time-series:** Forward-fill, backward-fill, or interpolation

**Step 4: Validate**
• Compare distributions before and after imputation
• Run models with and without imputation to check sensitivity
• Use cross-validation on imputed datasets to ensure no data leakage from imputation

**Important:** Never impute the target variable. And always impute AFTER train/test split to prevent data leakage.`,
    keyPoints: ['Diagnose missingness mechanism first (MCAR/MAR/MNAR)', 'Per-column strategy based on missing percentage', 'Multiple imputation techniques ranked by quality', 'Validation of imputation quality', 'Data leakage prevention: impute after split'],
    mistakes: ['Immediately dropping all rows with missing values (loses 30% of data)', 'Using only mean imputation (distorts variance)', 'Imputing before train/test split (data leakage)', 'Not creating missing indicator features']
  },

  'inner join and left join': {
    answer: `**INNER JOIN** returns only the rows where there is a matching value in BOTH tables. If a row in Table A has no match in Table B, it's excluded from the result.

**LEFT JOIN** (also called LEFT OUTER JOIN) returns ALL rows from the left table and the matching rows from the right table. If a row in the left table has no match, the right table's columns are filled with NULL.

**Example:**
Given: Customers table (100 rows) and Orders table (80 rows, some customers have no orders):

\`\`\`sql
-- INNER JOIN: Only customers WHO HAVE placed orders
SELECT c.name, o.order_date
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
-- Result: ~80 rows (only customers with orders)

-- LEFT JOIN: ALL customers, with order data where available
SELECT c.name, o.order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
-- Result: 100 rows (all customers, NULLs for those without orders)
\`\`\`

**When to use which:**
• **INNER JOIN:** When you only want records that exist in both tables (e.g., "Show me customers with orders")
• **LEFT JOIN:** When you want all records from the primary table regardless of matches (e.g., "Show me all customers and their orders, including those who haven't ordered")

**Common pitfall:** LEFT JOIN can produce duplicates if a left-table row matches multiple right-table rows. Always check row count after joins.

**Performance:** INNER JOIN is typically faster because it processes fewer rows. Ensure join columns are indexed for both types.`,
    keyPoints: ['Clear definition with the key difference (exclusion vs inclusion of non-matches)', 'SQL example with realistic tables', 'When to use each — practical decision criteria', 'Duplicate row warning with LEFT JOIN', 'Performance and indexing considerations'],
    mistakes: ['Confusing LEFT JOIN with CROSS JOIN', 'Not mentioning NULL values in unmatched rows', 'Forgetting about duplicate rows from one-to-many joins', 'Not considering performance and indexing']
  },

  // ═══════════════════════════════════════
  //  FULL STACK / FRONTEND / BACKEND
  // ═══════════════════════════════════════

  'server-side rendering and client-side rendering': {
    answer: `**SSR (Server-Side Rendering)** generates full HTML on the server for each request. The page is immediately visible but becomes interactive only after JavaScript hydration completes.

**CSR (Client-Side Rendering)** sends a minimal HTML shell with a JavaScript bundle. The browser downloads JS, executes it, and renders everything client-side.

**SSR Advantages:** Faster First Contentful Paint, better SEO (crawlers see complete HTML), works without JavaScript enabled. Used by Next.js, Nuxt.js.

**CSR Advantages:** Faster subsequent navigations (SPA behavior), simpler server infrastructure, better for highly interactive dashboards. Used by Create React App, Vite.

**Modern Hybrid Approaches (what production apps actually use):**
• **SSG (Static Site Generation):** Pre-renders pages at build time. Perfect for blogs, docs, marketing pages.
• **ISR (Incremental Static Regeneration):** SSG with background revalidation — pages are regenerated after a configurable interval. Best of both worlds for semi-dynamic content.
• **Streaming SSR:** Server streams HTML chunks progressively using React Suspense, reducing Time to First Byte.
• **React Server Components:** Mix server and client components at the component level — server components add zero JS to the client bundle.

**My decision framework:**
• Public-facing, SEO-critical pages → SSR or SSG
• Authenticated dashboards → CSR (no SEO needed, high interactivity)
• Content sites with occasional updates → ISR
• Complex apps with mixed needs → Streaming SSR + React Server Components`,
    keyPoints: ['Clear SSR vs CSR differences with trade-offs', 'SEO and performance implications', 'Modern hybrid approaches (SSG, ISR, Streaming SSR, RSC)', 'Practical decision framework', 'Real framework examples (Next.js, Vite)'],
    mistakes: ['Not mentioning hydration cost for SSR', 'Treating it as a binary SSR-vs-CSR choice', 'Ignoring modern approaches like ISR and Streaming SSR', 'Forgetting React Server Components']
  },

  'react server components': {
    answer: `React Server Components (RSC) execute exclusively on the server, never shipping their JavaScript to the client browser. They can directly access databases, file systems, and APIs without creating API endpoints.

**Key Benefits:**
1. **Zero Bundle Impact:** A server component importing a 100KB library (like a markdown parser or date library) adds exactly 0 bytes to the client JavaScript bundle.
2. **Direct Data Access:** Use async/await to fetch data directly — no useEffect, no loading states, no separate API routes.
3. **Streaming:** Server components can progressively stream their output, showing content as it becomes available via React Suspense boundaries.

**Server vs Client Components:**
• **Server (default in Next.js App Router):** No useState, no useEffect, no browser APIs. Can directly query databases. Can import client components as children.
• **Client (marked with "use client" at top of file):** Full React interactivity — state, effects, event handlers, browser APIs. Cannot import server components.

**Composition Pattern:**
\`\`\`
ServerLayout (fetches nav data from DB)
  └─ ServerProductList (fetches products from DB)
       └─ ClientAddToCartButton (handles click events)
\`\`\`

**Practical Impact:** In a typical dashboard app, 60-70% of components can be server components (navigation, data tables, static content), reducing the client JS bundle by 40-50%. This directly improves LCP and INP metrics.

**Key distinction:** RSC is NOT the same as SSR. SSR renders components to HTML once; RSC creates a persistent server-client component tree where server components can be re-fetched without losing client state.`,
    keyPoints: ['Zero client-side JavaScript for server components', 'Direct database/API access without API routes', 'Streaming with Suspense boundaries', '"use client" boundary and composition rules', 'RSC ≠ SSR distinction'],
    mistakes: ['Saying RSCs replace client components entirely', 'Not understanding the "use client" directive boundary', 'Confusing RSC with SSR — they\'re complementary', 'Not mentioning streaming capability']
  },

  'core web vitals': {
    answer: `Core Web Vitals are Google's three key metrics for real-user experience:

**LCP (Largest Contentful Paint) — Target: < 2.5s**
Measures when the largest visible element renders. Optimizations:
• Preload hero images: \`<link rel="preload" as="image" href="...">\`
• Use \`fetchpriority="high"\` on above-the-fold images
• Serve modern formats (WebP/AVIF) with responsive \`srcset\`
• Inline critical CSS, defer non-critical stylesheets with \`media="print"\`
• Use CDN for all static assets

**INP (Interaction to Next Paint) — Target: < 200ms**
Measures responsiveness to user interactions. Optimizations:
• Break long tasks with \`scheduler.yield()\` or \`requestIdleCallback\`
• Use React \`startTransition\` for non-urgent updates
• Debounce/throttle expensive event handlers
• Virtualize long lists (TanStack Virtual, react-window)
• Move heavy computation to Web Workers

**CLS (Cumulative Layout Shift) — Target: < 0.1**
Measures unexpected visual movement. Optimizations:
• Set explicit \`width\` and \`height\` on all images and videos
• Use CSS \`aspect-ratio\` for responsive media
• Reserve space for ads, embeds, and dynamic content
• Use \`font-display: swap\` with size-adjusted fallback fonts
• Never inject content above existing visible content

**My monitoring stack:** Lighthouse CI in CI/CD pipeline for lab data, Chrome UX Report (CrUX) for field data, Web Vitals JS library (\`web-vitals\` npm package) for real-user monitoring sent to our analytics dashboard.`,
    keyPoints: ['All three metrics with precise targets', 'Specific optimization techniques per metric (not generic advice)', 'INP as the current metric (replaced FID in March 2024)', 'Both lab and field measurement tools', 'Practical implementation with code examples'],
    mistakes: ['Still mentioning FID instead of INP (FID was replaced in 2024)', 'Only optimizing LCP without addressing CLS and INP', 'Giving generic advice like "make it faster" without specific techniques', 'Not distinguishing lab data from real-user monitoring']
  },

  'rate-limiting system': {
    answer: `I'd implement a multi-layer rate limiting system using the Token Bucket algorithm:

**Algorithm — Token Bucket:**
• Each client gets a bucket with capacity C tokens, refilled at rate R tokens/second
• Each request consumes 1 token. Empty bucket → 429 Too Many Requests response
• Allows short bursts (up to C requests) while enforcing average rate R

**Implementation Layers:**
1. **Edge Layer (API Gateway/CDN):** Global per-IP rate limits (e.g., 1000 req/min per IP) using NGINX \`limit_req\` or AWS WAF. Blocks DDoS and scraping.

2. **Application Layer:** Per-user API limits using Redis + Lua scripts for atomic operations:
\`\`\`
Key: ratelimit:{user_id}:{window}
Lua script: DECR key; if result < 0, reject; else allow
TTL: window duration (auto-cleanup)
\`\`\`

3. **Service Layer:** Circuit breakers (Hystrix/Resilience4j) to protect downstream services from cascading failures.

**Why Redis:** O(1) operations, built-in TTL for automatic key expiry, Lua scripts for atomic check-and-decrement (no race conditions), and Redis Cluster for horizontal scaling.

**Response Headers (RFC 6585 + Draft):**
\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1625097600 (Unix timestamp)
Retry-After: 30 (seconds, on 429 response)
\`\`\`

**Tiered Limits:** Free: 100/hour, Pro: 1,000/hour, Enterprise: custom. Limit tier stored in user JWT claims, checked at the application layer without a database call.`,
    keyPoints: ['Token bucket algorithm with clear explanation', 'Multi-layer architecture (edge + application + service)', 'Redis with Lua scripts for atomic operations', 'Rate limit response headers for client awareness', 'Tiered pricing model'],
    mistakes: ['Only implementing a single layer of rate limiting', 'Not handling race conditions in distributed environments', 'Forgetting to return rate limit headers', 'Not considering burst capacity needs']
  },

  'cap theorem': {
    answer: `The CAP theorem states that a distributed data system can guarantee at most two of three properties simultaneously:

**Consistency (C):** Every read returns the most recent write. All nodes see identical data at the same time.
**Availability (A):** Every request receives a non-error response, even if some nodes are down.
**Partition Tolerance (P):** The system continues operating despite network partitions between nodes.

**The Real Choice:** Since network partitions are inevitable in distributed systems, the practical choice is between CP and AP during a partition:

**CP Systems (Consistency over Availability):**
When a partition occurs, the system returns errors rather than potentially stale data.
Examples: MongoDB (with majority write concern), HBase, ZooKeeper, etcd.
Best for: Banking transactions, inventory management, distributed locks.

**AP Systems (Availability over Consistency):**
When a partition occurs, the system always responds but data might be temporarily stale. Uses eventual consistency.
Examples: Cassandra, DynamoDB, CouchDB, DNS.
Best for: Social media feeds, shopping carts, analytics counters, session data.

**My design decisions by use case:**
• Financial transactions → CP (incorrect balances are unacceptable)
• User session data → AP (better to serve slightly stale session than block login)
• E-commerce cart → AP with conflict resolution (last-write-wins or CRDT merge)
• Configuration data → CP (all services must see the same config)

**Beyond CAP:** I also consider PACELC — when there's No partition, do you optimize for Latency or Consistency? For example, DynamoDB is PA/EL: Available during partitions, favors Latency when no partition.`,
    keyPoints: ['Clear definition of all three properties', 'Why partition tolerance is non-negotiable', 'CP vs AP with real database examples', 'Design decisions mapped to specific use cases', 'PACELC as the modern extension of CAP'],
    mistakes: ['Claiming you can achieve all three', 'Not explaining why P is mandatory in practice', 'No real examples of CP vs AP database choices', 'Not mentioning eventual consistency as the AP strategy']
  },

  // ═══════════════════════════════════════
  //  DEVOPS / CLOUD
  // ═══════════════════════════════════════

  'zero-downtime deployment': {
    answer: `I implement zero-downtime deployments using a combination of strategies:

**1. Blue-Green Deployment:**
• Maintain two identical environments (Blue = current production, Green = new version)
• Deploy new version to Green, run automated smoke tests and health checks
• Switch load balancer routing from Blue to Green
• Keep Blue running for 30 minutes as instant rollback capability

**2. Rolling Updates (Kubernetes):**
\`\`\`yaml
strategy:
  rollingUpdate:
    maxSurge: 25%         # Allow 25% extra pods during update
    maxUnavailable: 0      # Never drop below desired replica count
\`\`\`
• New pods start and pass readiness probes before old ones terminate
• \`preStop\` lifecycle hook with 15-second sleep allows in-flight requests to complete gracefully
• \`terminationGracePeriodSeconds: 60\` gives pods time to drain connections

**3. Canary Releases (for risky changes):**
• Route 5% of traffic to new version via Istio or NGINX weight-based routing
• Monitor error rates, p99 latency, and business metrics for 30 minutes
• Gradually increase: 5% → 25% → 50% → 100% if all metrics are healthy
• Automated rollback if error rate exceeds baseline by more than 1%

**Database Migration Strategy (critical for zero-downtime):**
Always use the expand-contract pattern:
1. ADD new column (backward compatible)
2. Deploy code that writes to BOTH old and new columns
3. Backfill existing data
4. Deploy code that reads from new column
5. DROP old column in a separate deployment

Never rename or delete columns in the same deployment as the code change.`,
    keyPoints: ['Blue-Green with instant rollback strategy', 'Kubernetes rolling update with specific configuration', 'Canary releases with automated rollback thresholds', 'Database expand-contract pattern for schema changes', 'Graceful shutdown with preStop hooks'],
    mistakes: ['Not addressing database migration compatibility', 'Forgetting readiness probes and graceful shutdown', 'No automated rollback strategy', 'Making destructive schema changes in the same deployment as code']
  },

  'kubernetes statefulsets and deployments': {
    answer: `**Deployments** manage stateless applications where any pod can handle any request and pods are freely interchangeable. This is the default for web servers, APIs, and workers.

**StatefulSets** manage stateful applications where each pod needs a unique, persistent identity. Key differences:

**1. Pod Identity:**
• Deployment: Random names — \`api-7f8d9-xk4m2\`
• StatefulSet: Predictable ordinal names — \`mysql-0\`, \`mysql-1\`, \`mysql-2\`

**2. Ordering:**
• Deployment: Creates/deletes pods in parallel
• StatefulSet: Sequential — creates 0→1→2, deletes 2→1→0. Important for databases where the primary must start before replicas.

**3. Storage:**
• Deployment: Pods share or get ephemeral storage (lost on restart)
• StatefulSet: Each pod gets its own PersistentVolumeClaim that survives pod restarts and rescheduling

**4. Network Identity:**
• Deployment: Pods get random IPs behind a Service
• StatefulSet: Each pod gets a stable DNS name: \`mysql-0.mysql-svc.namespace.svc.cluster.local\`. This enables peer discovery (e.g., replica finding primary).

**When to use each:**
• **Deployment:** REST APIs, web frontends, microservices, stateless workers, batch processors
• **StatefulSet:** Databases (PostgreSQL, MySQL), message queues (Kafka brokers), distributed stores (Redis Cluster, Elasticsearch), coordination services (ZooKeeper, etcd)

**Important caveat:** StatefulSets provide stable identity and storage, but they do NOT handle data replication — that's the application's responsibility (e.g., MySQL replication, Kafka ISR).`,
    keyPoints: ['Four key differences: identity, ordering, storage, network', 'Concrete examples of naming conventions', 'Clear use cases for each resource type', 'Stable DNS for peer discovery', 'Caveat: StatefulSets don\'t handle data replication'],
    mistakes: ['Saying StatefulSets handle data replication automatically', 'Not mentioning ordered creation/deletion', 'Forgetting stable DNS hostnames', 'Not providing concrete use case examples']
  },

  // ═══════════════════════════════════════
  //  CYBER SECURITY
  // ═══════════════════════════════════════

  'suspected data breach': {
    answer: `I follow the NIST SP 800-61 Incident Response framework:

**1. Detection & Identification (0-30 minutes):**
• Confirm the breach is real — correlate alerts from SIEM (Splunk/QRadar), IDS/IPS, and endpoint detection (CrowdStrike/Carbon Black)
• Determine scope: which systems, what data types (PII, financial, health), how many users affected
• Classify severity: P1 (PII/financial data exposed), P2 (internal data), P3 (non-sensitive data)

**2. Containment (30 minutes - 2 hours):**
• **Critical:** Do NOT shut down affected systems — preserve volatile memory for forensics
• Isolate affected systems from the network (disable network interfaces, not power)
• Block malicious IPs/domains at the firewall and DNS level
• Revoke all compromised credentials, API keys, and session tokens
• Preserve forensic evidence: memory dumps, disk images, log snapshots with chain-of-custody documentation

**3. Eradication (2-24 hours):**
• Identify root cause and attack vector (phishing, unpatched vulnerability, insider, supply chain)
• Remove malware, backdoors, and persistence mechanisms
• Patch the exploited vulnerability
• Scan all systems for Indicators of Compromise (IOCs)

**4. Recovery (24-72 hours):**
• Restore systems from verified clean backups
• Deploy with enhanced monitoring and logging
• Gradually restore services with canary approach

**5. Post-Incident (1-2 weeks):**
• Detailed incident report with timeline and root cause
• Lessons-learned meeting with all involved teams
• Regulatory notifications: GDPR requires 72-hour notification to DPA, HIPAA requires 60 days, state breach laws vary
• Update security controls, runbooks, and employee training`,
    keyPoints: ['Structured NIST-based IR framework', 'Preserve evidence: do NOT shutdown systems', 'Specific tools per phase (SIEM, EDR, forensics)', 'Regulatory notification deadlines with specific laws', 'Post-incident improvements and knowledge sharing'],
    mistakes: ['Immediately shutting down systems (destroys volatile forensic evidence)', 'Not preserving chain-of-custody for legal proceedings', 'Skipping the post-incident review', 'Forgetting regulatory notification deadlines (GDPR: 72 hours)']
  },

  'mitre att&ck': {
    answer: `MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) is a knowledge base of real-world adversary behaviors organized into a matrix structure.

**Structure:**
• **Tactics** (14 categories): The adversary's GOAL — Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, C2, Exfiltration, Impact
• **Techniques** (~200+): HOW they achieve the goal — e.g., Phishing (T1566), PowerShell (T1059.001), Pass-the-Hash (T1550.002)
• **Sub-techniques:** More specific variants — e.g., T1566.001 (Spearphishing Attachment), T1566.002 (Spearphishing Link)
• **Procedures:** Documented examples of how specific threat groups (APT28, Lazarus) use each technique

**How I use it in practice:**

1. **Detection Engineering:** Map every detection rule in our SIEM to ATT&CK technique IDs. Visualize coverage gaps — if we have zero detections for Lateral Movement techniques (TA0008), that's a critical blind spot needing immediate attention.

2. **Threat Hunting:** Use technique descriptions to form hypotheses. Example: "If an adversary used Scheduled Tasks (T1053) for persistence, we'd see Event ID 4698 in Windows Security logs with unusual task names."

3. **Red Team Planning:** Design penetration tests that simulate specific threat group TTPs. Example: "Simulate APT29 initial access → map findings to ATT&CK for consistent, comparable reporting."

4. **Risk Prioritization:** Cross-reference techniques most commonly used against our industry (from CTI reports) with our detection coverage to prioritize security investments.

**Tooling:** I use ATT&CK Navigator to create heatmap visualizations of our detection coverage, updated quarterly.`,
    keyPoints: ['Complete structure: Tactics, Techniques, Sub-techniques, Procedures', 'Four practical use cases with concrete examples', 'Specific technique IDs demonstrating familiarity', 'ATT&CK Navigator for visualization', 'Threat group mapping for industry-specific prioritization'],
    mistakes: ['Describing ATT&CK as only a list without explaining the matrix structure', 'No practical use cases — just theory', 'Confusing tactics (goals) with techniques (methods)', 'Not mentioning specific technique IDs or threat groups']
  },

  'zero trust architecture': {
    answer: `Zero Trust is a security model based on the principle "never trust, always verify" — no user, device, or network segment is inherently trusted, even inside the corporate perimeter.

**Three Core Principles:**
1. **Verify Explicitly:** Authenticate and authorize every request using all available signals — identity, device health, location, behavior patterns, time of access
2. **Least Privilege Access:** Grant minimum permissions needed, use just-in-time (JIT) access with time-bound credentials, revoke promptly
3. **Assume Breach:** Design as if the attacker is already inside — segment networks, encrypt all traffic (even internal), monitor everything

**Implementation by Layer:**
• **Identity (start here):** SSO with MFA everywhere — prefer FIDO2/WebAuthn over SMS. Conditional access policies. Identity governance with Okta, Azure Entra ID, or Google Workspace.
• **Device:** Device posture checks before granting access — Is the OS patched? Is disk encrypted? Is MDM compliant? Block access from non-compliant devices.
• **Network:** Replace VPN with ZTNA solutions (Zscaler Private Access, Cloudflare Access). Implement micro-segmentation — services can only communicate with explicitly allowed peers.
• **Application:** mTLS for all service-to-service calls. JWT validation at every API boundary. Service mesh (Istio/Linkerd) for policy enforcement.
• **Data:** Classify data by sensitivity, encrypt at rest and in transit, apply DLP (Data Loss Prevention) policies, log all access for audit.

**Migration Roadmap (practical):**
Phase 1 (3 months): MFA everywhere, SSO consolidation
Phase 2 (6 months): Device compliance policies, ZTNA pilot
Phase 3 (12 months): Micro-segmentation, service mesh
Phase 4 (18-24 months): Full Zero Trust with continuous verification

Full Zero Trust transformation takes 2-3 years for a large organization.`,
    keyPoints: ['Three core principles clearly articulated', 'Five implementation layers with specific tools', 'ZTNA replacing traditional VPN', 'Phased migration roadmap with realistic timelines', 'mTLS and service mesh for application layer'],
    mistakes: ['Treating Zero Trust as a product you can buy and install', 'Only focusing on network without addressing identity and data', 'Not providing a practical migration timeline', 'Forgetting device posture checks']
  },

  // ═══════════════════════════════════════
  //  BUSINESS / PRODUCT
  // ═══════════════════════════════════════

  'gap analysis': {
    answer: `Gap analysis identifies the difference between the current state and desired future state across people, processes, technology, and data.

**My structured process:**

**1. Define Desired State (Week 1):**
• Workshop with key stakeholders to document target outcomes using SMART criteria
• Benchmark against industry standards and competitors
• Define measurable success KPIs for each area

**2. Assess Current State (Week 1-2):**
• Stakeholder interviews (8-12 people across departments)
• Process mapping using swim lane diagrams for key workflows
• Data analysis: throughput, error rates, cycle times, customer satisfaction
• Technology audit: system capabilities, integration gaps, technical debt
• Document as-is state with quantified metrics

**3. Identify & Categorize Gaps (Week 2):**
• Map gaps across four dimensions: People (skills, headcount), Process (efficiency, automation), Technology (tools, integration), Data (quality, accessibility)
• Quantify each gap: "Onboarding takes 5 days; target is 4 hours"

**4. Prioritize (Week 3):**
• Score each gap: Business Impact (1-5) × Feasibility (1-5) × Urgency (1-5)
• Plot on a priority matrix: High-impact + High-feasibility = Quick Wins (do first)
• Identify dependencies between gaps

**5. Action Plan (Week 3-4):**
• For each prioritized gap: specific initiative, owner, timeline, budget, success metric
• Create a 30-60-90 day roadmap
• Establish monthly review cadence with stakeholders

**Example:** At a previous company, gap analysis revealed 40% of customer onboarding was manual data entry. The action plan included implementing DocuSign for signatures and an automated workflow engine, reducing onboarding from 5 days to 4 hours — a 96% improvement.`,
    keyPoints: ['Structured 4-week methodology', 'Four assessment dimensions (people, process, tech, data)', 'Quantified gaps with current vs target metrics', 'Prioritization scoring framework', 'Real example with measurable outcome'],
    mistakes: ['Only identifying gaps without prioritization or action plan', 'Not involving stakeholders in defining the desired state', 'Skipping quantification — "improve onboarding" vs "reduce from 5 days to 4 hours"', 'No follow-up tracking mechanism']
  },

  'product kpis': {
    answer: `I use the HEART framework combined with business metrics:

**HEART Framework (User-Centric):**
• **Happiness:** NPS score (target: >50), CSAT surveys, app store ratings, qualitative feedback themes
• **Engagement:** DAU/MAU ratio — "stickiness" (target: >25% for B2B SaaS, >15% for consumer apps). Also: session duration, features used per session, core action frequency
• **Adoption:** New user activation rate — % completing the key "aha moment" action within first session (e.g., sending first message, creating first project). Target: >40%
• **Retention:** D1/D7/D30 retention curves, monthly churn rate, cohort analysis to spot trends. Target: D30 >20% consumer, >85% B2B SaaS
• **Task Success:** Task completion rate, time-to-completion, error rate for critical flows

**Business Metrics:**
• MRR/ARR growth rate, LTV:CAC ratio (target: >3:1), expansion revenue %, payback period
• Feature-level: adoption rate per feature, time-to-value for new features

**My tracking process:**
1. Define 3-5 North Star metrics per product area aligned with company OKRs
2. Set up real-time dashboards in Amplitude/Mixpanel/PostHog
3. Weekly metrics review with product team (15-min standup)
4. Monthly deep-dive: cohort analysis, funnel analysis, feature impact assessment
5. Quarterly OKR review to ensure metrics ladder up to strategy

**Key principle:** Every feature launch has pre-defined success criteria written in the PRD. If a feature doesn't move its target metric within 4 weeks of launch, we investigate or run a sunset analysis.`,
    keyPoints: ['HEART framework with specific targets per metric', 'Both user-centric and business metrics', 'Clear tracking cadence: weekly, monthly, quarterly', 'Feature-level success criteria in PRDs', 'Data-driven sunset decisions'],
    mistakes: ['Only tracking vanity metrics (page views, total downloads)', 'Not setting specific numerical targets for each KPI', 'Missing retention and engagement — only tracking acquisition', 'No process for acting on declining metrics']
  },

  // ═══════════════════════════════════════
  //  FINANCE
  // ═══════════════════════════════════════

  'dcf model': {
    answer: `A DCF (Discounted Cash Flow) model values a company by projecting future free cash flows and discounting them to present value. Here's my step-by-step approach:

**Step 1: Project Unlevered Free Cash Flow (5-10 years)**
• Start with revenue projections (bottom-up from unit economics or top-down from market sizing)
• Subtract operating expenses → EBIT
• Subtract taxes at marginal rate → NOPAT (Net Operating Profit After Tax)
• Add back depreciation & amortization (non-cash charges)
• Subtract capital expenditures (CapEx)
• Subtract changes in net working capital (growth requires more working capital)
• = **Unlevered Free Cash Flow (UFCF)**

**Step 2: Calculate WACC (Weighted Average Cost of Capital)**
• WACC = (E/V × Re) + (D/V × Rd × (1-T))
• Cost of Equity (Re) = Risk-free rate + β × Equity Risk Premium (CAPM)
• Example: 4.5% + 1.2 × 5.5% = 11.1%
• Typical WACC range: 8-12% for most public companies

**Step 3: Calculate Terminal Value (represents ~60-80% of total DCF)**
• **Gordon Growth:** TV = FCF_n × (1+g) / (WACC - g), where g = 2-3% long-term GDP growth
• **Exit Multiple:** TV = EBITDA_n × EV/EBITDA from comparable companies
• I calculate both methods and check they're within 15% of each other as a sanity check

**Step 4: Discount to Present Value**
• PV = Σ [FCF_t / (1+WACC)^t] + [Terminal Value / (1+WACC)^n]
• = Enterprise Value
• Subtract net debt (total debt minus cash) → Equity Value
• Divide by diluted shares outstanding → **Implied Share Price**

**Step 5: Sensitivity Analysis**
Create a data table varying WACC (±1%) and terminal growth rate (±0.5%) to show the range of implied share prices. This is essential for credibility.`,
    keyPoints: ['Complete step-by-step methodology with formulas', 'WACC calculation with CAPM and example numbers', 'Two terminal value methods with sanity check', 'Enterprise-to-equity value bridge', 'Sensitivity analysis for credibility'],
    mistakes: ['Not explaining the terminal value calculation (it\'s 60-80% of the value)', 'Forgetting to subtract net debt to get equity value', 'Using unrealistic terminal growth rates (above GDP growth)', 'Presenting a single-point estimate without sensitivity analysis']
  },

  'cash and accrual accounting': {
    answer: `**Cash Accounting** records transactions when cash physically changes hands. **Accrual Accounting** records transactions when they are earned or incurred, regardless of when cash moves.

**Example:** You complete a $10,000 consulting project in December but the client pays in January.
• Cash basis: Revenue recorded in **January** (when payment received)
• Accrual basis: Revenue recorded in **December** (when work was completed and earned)

**Key Differences:**

| Aspect | Cash Basis | Accrual Basis |
|--------|-----------|---------------|
| Revenue recognition | When cash received | When earned |
| Expense recognition | When cash paid | When incurred |
| Accounts receivable | Not tracked | Recorded |
| Matching principle | Not followed | Followed |
| GAAP/IFRS compliance | Not compliant | Required |
| Best suited for | Small businesses < $25M | All public companies, large businesses |

**Why Accrual is the standard (GAAP/IFRS):**
• Follows the **matching principle** — expenses are matched to the period they helped generate revenue
• Provides a more accurate picture of financial health in any given period
• Enables meaningful period-over-period comparisons
• Required by IRS for companies with inventory or gross receipts over $25M

**Accrual Challenges:**
• Requires estimates (bad debt allowances, warranty reserves, revenue recognition timing)
• Reported profit can differ significantly from actual cash position — a company can be "profitable" but cash-poor
• More complex bookkeeping requiring trained accountants

This is why the **Cash Flow Statement** is critical — it reconciles accrual-based income to actual cash movements.`,
    keyPoints: ['Clear definition with concrete dollar example', 'Comparison table with key differences', 'Matching principle as the fundamental reason for accrual', 'GAAP/IFRS and IRS requirements', 'Cash flow statement as the bridge between both methods'],
    mistakes: ['Not providing a concrete example with numbers', 'Forgetting to mention GAAP/IFRS requirements', 'Not explaining the matching principle', 'Not discussing the profit-vs-cash disconnect in accrual']
  },

  // ═══════════════════════════════════════
  //  DESIGN
  // ═══════════════════════════════════════

  'design process from research to delivery': {
    answer: `My design process follows a double-diamond approach, adapted based on project scope:

**1. Discover — Research (1-2 weeks):**
• Stakeholder kickoff: Understand business objectives, constraints, success metrics
• User research: 5-8 user interviews (contextual inquiry preferred), survey of 50+ users
• Competitive analysis: Audit 3-5 competitors' UX patterns, identify gaps and opportunities
• Analytics review: Existing product data — funnels, heatmaps, error rates, support tickets
• **Output:** Research synthesis document, 2-3 user personas, current journey map

**2. Define — Strategy (1 week):**
• Affinity mapping workshop: Cluster research insights into themes
• "How Might We" framing: Convert problems into opportunity statements
• Prioritize with stakeholders using Impact/Effort matrix
• **Output:** Design brief with clear problem statement, success metrics, and scope

**3. Develop — Design (2-3 weeks):**
• Information architecture and user flow diagrams
• Low-fidelity wireframes → Quick stakeholder gut-check
• High-fidelity mockups in Figma, built from our design system components
• Interactive prototype for critical flows (Figma prototyping)
• Usability testing: 5 participants, 2 iterative rounds (fix issues between rounds)
• **Output:** Validated, pixel-ready designs with interaction specifications

**4. Deliver — Handoff & QA (1 week):**
• Developer handoff in Figma: Auto-layout specs, component documentation, design tokens
• Live handoff session: Walk through interactions, edge cases, responsive breakpoints
• Design QA during development sprints (check builds against specs)
• Post-launch metrics review at week 2 and week 4

**Scaling the process:** For a small feature, I compress to 1 week total. For a new product, I extend discovery to 4 weeks and include diary studies.`,
    keyPoints: ['Double-diamond framework with clear phases', 'Specific research methods with participant numbers', 'Iterative usability testing built into the process', 'Clear outputs at each phase', 'Process flexibility based on project size'],
    mistakes: ['Skipping research and jumping straight to mockups', 'Not testing designs with real users before handoff', 'No post-launch measurement to validate design decisions', 'Being too rigid with the process — not adapting to project scope']
  },

  // ═══════════════════════════════════════
  //  HEALTHCARE
  // ═══════════════════════════════════════

  'differential diagnosis': {
    answer: `My approach to differential diagnosis follows a systematic methodology prioritizing patient safety:

**1. Comprehensive History (10-15 minutes):**
• Chief complaint: Onset (sudden vs gradual), duration, severity (1-10 scale), character (sharp, dull, burning)
• Associated symptoms using systems-based review of systems
• Past medical history, surgical history, current medications (including OTC and supplements), allergies with reaction type
• Family history (especially for hereditary conditions)
• Social history: smoking (pack-years), alcohol, occupation, travel, sexual history
• **Red flag screen:** Unexplained weight loss, night sweats, progressive neurological symptoms, chest pain — these escalate urgency

**2. Generate Initial Differential List:**
• **Anatomical approach:** What organs or systems could produce these symptoms given the location and character?
• **Worst-first thinking:** Rule out life-threatening conditions first (PE, MI, meningitis) — "Can't miss" diagnoses
• **Common first:** "When you hear hoofbeats, think horses" — but never ignore the zebra completely
• **Mechanism-based:** Infectious, inflammatory, neoplastic, metabolic, traumatic, vascular, congenital, autoimmune

**3. Focused Physical Examination:**
• Exam directed by differential — each finding aims to confirm or exclude specific diagnoses
• Document pertinent positives AND pertinent negatives (absence of findings is diagnostic information)

**4. Investigations:**
• Order tests that maximally differentiate between remaining diagnoses
• Start with least invasive, highest yield tests
• Apply Bayesian reasoning: pre-test probability affects test selection — a D-dimer is useful with low pre-test probability for PE but useless with high pre-test probability

**5. Reassess & Iterate:**
• Narrow differential based on results
• If patient doesn't respond to treatment as expected → revisit differential from scratch
• Consult specialist if uncertainty persists
• Key mindset: "A diagnosis is a working hypothesis, not a conclusion."`,
    keyPoints: ['Comprehensive history-taking methodology', 'Worst-first thinking for patient safety', 'Pertinent positives AND negatives', 'Bayesian reasoning for test selection', 'Willingness to reassess when treatment fails'],
    mistakes: ['Anchoring on the first diagnosis that comes to mind (anchoring bias)', 'Not ruling out life-threatening conditions first', 'Ordering a battery of tests without clinical reasoning (shotgun approach)', 'Ignoring pertinent negatives as diagnostic information']
  },

  // ═══════════════════════════════════════
  //  EDUCATION
  // ═══════════════════════════════════════

  'differentiate instruction': {
    answer: `Differentiated instruction adjusts content, process, product, and learning environment to meet the diverse needs of all learners in a classroom.

**1. Know Your Learners First:**
• Pre-assessment at each unit start: KWL charts, diagnostic quizzes, interest surveys
• Learning profile data: reading levels (Lexile), IEP/504 accommodations, language proficiency
• Ongoing formative assessment: exit tickets, thumbs up/down, quick writes — data drives daily grouping decisions

**2. Differentiate Content (What they learn):**
• Tiered reading materials: Same topic, three complexity levels (below/on/above grade level)
• Multimodal access: Video explanations + text + diagrams + audio for every key concept
• Choice boards: Students select resources based on interest and learning style

**3. Differentiate Process (How they learn):**
• Flexible grouping: Homogeneous groups for targeted skill practice, heterogeneous for collaborative projects
• Learning stations: 4-5 stations with activities at varying difficulty, students rotate
• Scaffolded support: Graphic organizers, sentence starters, word banks for struggling learners; open-ended prompts for advanced learners
• Think-Pair-Share for universal participation; Socratic seminar for advanced discussion

**4. Differentiate Product (How they show learning):**
• Student choice: Essay, presentation, video, infographic, podcast, Socratic dialogue
• Rubrics with consistent core standards but adjusted complexity expectations
• Self-assessment and reflection components

**5. Learning Environment:**
• Flexible seating (quiet zones, collaboration tables, standing desks)
• Growth mindset culture: "Not yet" instead of "can't"; celebrate effort and progress
• Visual schedules and clear routines for students who need predictability

**Concrete Example:** In a 7th-grade history unit on the Civil War, struggling readers use graphic novels and audio versions, on-level students use the textbook with guided questions and a timeline activity, and advanced students analyze primary source documents (Lincoln's letters) and write argumentative essays comparing historical perspectives.`,
    keyPoints: ['Four dimensions of differentiation: content, process, product, environment', 'Data-driven grouping from pre-assessment', 'Flexible grouping strategies (homogeneous AND heterogeneous)', 'Student choice in demonstrating learning', 'Concrete classroom example with specific activities'],
    mistakes: ['Giving all students the same work at different speeds (that\'s not differentiation)', 'Only differentiating by quantity — more problems vs fewer problems', 'Not using formative assessment data to inform daily grouping', 'Lowering expectations for struggling students instead of providing appropriate scaffolding']
  },

  // ═══════════════════════════════════════
  //  ENGINEERING
  // ═══════════════════════════════════════

  'thermodynamics': {
    answer: `**First Law of Thermodynamics (Conservation of Energy):**
Energy cannot be created or destroyed, only converted between forms. Mathematically: ΔU = Q - W, where ΔU is the change in internal energy, Q is heat added to the system, and W is work done by the system.

**Practical Applications:**
• **Power Plants:** Thermal efficiency η = W_net / Q_in. A typical coal plant achieves 33-40% efficiency — the rest is waste heat to the environment. Combined cycle gas plants reach 60%+ by recovering waste heat.
• **Internal Combustion Engines:** First law dictates that fuel energy → mechanical work + heat losses (exhaust, cooling, friction). Only 25-35% of fuel energy becomes useful work.
• **Refrigeration/HVAC:** COP (Coefficient of Performance) = Q_cold / W_input. A typical home AC has COP of 3-4, meaning 1 kW of electrical input moves 3-4 kW of heat.

**Second Law of Thermodynamics (Entropy Always Increases):**
Heat flows spontaneously from hot to cold, never the reverse without external work. Every real process increases the total entropy of the universe. No heat engine can be 100% efficient.

**Practical Applications:**
• **Carnot Efficiency:** η_max = 1 - T_cold/T_hot (temperatures in Kelvin). This sets the absolute theoretical maximum. A car engine operating between combustion at 2500K and exhaust at 300K has η_max = 88%, but real engines achieve only 25-35% due to friction, irreversibilities, and incomplete combustion.
• **Heat Exchanger Design:** The second law requires a temperature difference (driving force) for heat transfer — you can never have T_hot,out < T_cold,in. Minimum approach temperature is typically 5-10°C.
• **Material Degradation:** Entropy drives corrosion, fatigue crack propagation, and wear — informing preventive maintenance schedules and design life calculations.
• **Exergy Analysis:** Combines first and second law to identify where energy quality is being destroyed in a process — guiding optimization efforts to the highest-impact areas.`,
    keyPoints: ['Mathematical formulation of both laws', 'Multiple real engineering applications with numbers', 'Carnot efficiency with practical example', 'Connection to daily mechanical engineering work', 'Real vs ideal efficiency comparison'],
    mistakes: ['Only stating laws without engineering applications', 'Not providing Carnot efficiency with real numbers', 'Confusing which law governs which phenomena', 'Forgetting exergy analysis as a practical tool']
  },

  // ═══════════════════════════════════════
  //  SOFTWARE ENGINEERING
  // ═══════════════════════════════════════

  'solid principles': {
    answer: `SOLID is an acronym for five design principles that produce maintainable, flexible object-oriented code:

**S — Single Responsibility Principle:**
A class should have only one reason to change. Example: Separate \`UserAuthentication\` from \`UserEmailNotification\` — authentication logic changes shouldn't affect email sending.

**O — Open/Closed Principle:**
Classes should be open for extension but closed for modification. Example: Use a \`PaymentProcessor\` interface with \`CreditCardProcessor\`, \`PayPalProcessor\`, \`CryptoProcessor\` implementations. Adding Stripe means adding a new class, not modifying existing code.

**L — Liskov Substitution Principle:**
Subtypes must be substitutable for their base types without breaking behavior. Classic violation: \`Square extends Rectangle\` breaks if \`setWidth()\` and \`setHeight()\` are independent in Rectangle but coupled in Square. Fix: Use a \`Shape\` interface with \`area()\` instead.

**I — Interface Segregation Principle:**
Clients shouldn't depend on interfaces they don't use. Instead of one \`IWorker\` with \`work()\`, \`eat()\`, \`sleep()\`, create \`IWorkable\`, \`IFeedable\`, \`ISleepable\`. A robot worker implements only \`IWorkable\`.

**D — Dependency Inversion Principle:**
High-level modules shouldn't depend on low-level modules; both should depend on abstractions. Example: \`OrderService\` depends on \`IPaymentGateway\` interface, not on \`StripePaymentGateway\` directly. This makes swapping payment providers a config change, not a code rewrite.

**In practice:** I don't apply SOLID dogmatically. Over-abstracting simple code creates unnecessary complexity. I apply these principles when I notice code smell patterns: classes that change for multiple reasons (SRP violation), switch statements that grow with new types (OCP violation), or tight coupling that makes testing hard (DIP violation).`,
    keyPoints: ['All five principles with concrete code examples', 'Classic LSP violation (Square/Rectangle) with fix', 'Practical, not dogmatic application', 'Code smell patterns that signal violations', 'Real-world examples (payment processors, workers)'],
    mistakes: ['Only listing acronym meanings without examples', 'Not explaining LSP — it\'s the most commonly misunderstood', 'Applying SOLID dogmatically to simple code', 'Not connecting principles to real code smells']
  },

  'url shortener': {
    answer: `Here's my system design for a URL shortener (like bit.ly):

**Requirements Estimation:**
• 100M URLs created per month, 10B redirects per month (100:1 read-to-write ratio)
• 99.99% availability, <50ms redirect latency
• Short URLs: 7 characters using base62 (a-z, A-Z, 0-9) = 62^7 = 3.5 trillion possible URLs

**Architecture:**

**1. URL Shortening (Write Path):**
• Client sends long URL → API server generates 7-character short code
• **ID Generation:** Use a Snowflake-like distributed ID generator → Convert to base62
• Alternative: MD5 hash of URL → Take first 7 characters → Handle collisions with retry
• Store mapping in database: \`{short_code, long_url, created_at, user_id, expiry, click_count}\`

**2. URL Redirection (Read Path — hot path):**
• User hits short URL → API server looks up long URL → Returns 301 (permanent) or 302 (temporary) redirect
• **Caching is critical:** Cache short→long mappings in Redis (in-memory). With 100M URLs averaging 100 bytes, cache needs ~10GB — easily fits in memory.
• Cache hit rate: ~80-90% since URL access follows power-law distribution (few URLs get most traffic)

**3. Database:**
• Primary: PostgreSQL or DynamoDB with short_code as primary key
• Partition by short_code first character for horizontal sharding
• Read replicas for redirect lookups

**4. Analytics (async):**
• Log each redirect to Kafka
• Consumer writes to analytics DB (ClickHouse) for click tracking, geo data, referrer analysis

**5. Infrastructure:**
• CDN (Cloudflare) for geographic distribution of redirect endpoints
• Auto-scaling API servers behind a load balancer
• Health checks and circuit breakers

**Trade-offs discussed:**
• 301 vs 302 redirect: 301 is cached by browsers (reduces server load) but prevents click tracking
• Custom short codes: Allow users to choose but check for profanity and conflicts`,
    keyPoints: ['Back-of-envelope estimation with real numbers', 'Base62 encoding for short code generation', 'Caching strategy with memory estimation', 'Read-heavy optimization (100:1 ratio)', 'Analytics pipeline with async processing'],
    mistakes: ['Not estimating scale and requirements first', 'Ignoring caching for the read-heavy workload', 'Not discussing ID generation collision handling', 'Forgetting analytics and click tracking']
  },

  // ═══════════════════════════════════════
  //  MEDIA & CONTENT
  // ═══════════════════════════════════════

  'optimize content for seo': {
    answer: `My SEO content optimization process covers technical, on-page, and content quality:

**1. Keyword Research & Intent Mapping:**
• Use Ahrefs/SEMrush to identify target keyword cluster: primary keyword + 5-10 secondary/LSI keywords
• Analyze search intent: Informational (blog/guide), Commercial (comparison/review), Transactional (product page), Navigational (brand search)
• Check keyword difficulty vs domain authority — target KD < DA for realistic ranking chances

**2. On-Page SEO:**
• **Title tag:** Primary keyword within first 60 characters, power word for CTR (e.g., "Complete Guide," "2024")
• **Meta description:** 150-160 chars, includes keyword naturally, has a clear CTA
• **H1:** One per page, includes primary keyword, matches search intent
• **Header hierarchy:** H2s for main sections (include secondary keywords), H3s for subsections
• **URL slug:** Short, descriptive, includes primary keyword: \`/blog/seo-content-optimization\`
• **Internal linking:** 3-5 contextual internal links to related content (passes authority, improves crawling)
• **Image alt text:** Descriptive, includes keyword where natural

**3. Content Quality Signals:**
• Comprehensive coverage: Aim for "10x content" — better than everything on page 1
• E-E-A-T: Experience, Expertise, Authority, Trust — include author bio, cite sources, show first-hand experience
• Content freshness: Update date, current statistics and references
• Readability: Short paragraphs (2-3 sentences), bullet points, visual breaks, Flesch-Kincaid grade level 8-10

**4. Technical SEO:**
• Schema markup (Article, FAQ, HowTo) for rich snippets
• Core Web Vitals optimization (LCP < 2.5s, INP < 200ms, CLS < 0.1)
• Mobile-first design, proper canonical tags, XML sitemap inclusion

**5. Measurement:**
• Track: Organic impressions (GSC), ranking position, CTR, organic traffic, dwell time, conversions
• Review at 30/60/90 days post-publish; refresh content that plateaus`,
    keyPoints: ['Keyword research with intent mapping', 'Comprehensive on-page optimization checklist', 'E-E-A-T and content quality signals', 'Technical SEO implementation', 'Measurement and refresh strategy'],
    mistakes: ['Keyword stuffing instead of natural integration', 'Ignoring search intent — writing informational content for transactional keywords', 'Not measuring and refreshing content performance', 'Forgetting internal linking strategy']
  },
};

export default answerDB;
